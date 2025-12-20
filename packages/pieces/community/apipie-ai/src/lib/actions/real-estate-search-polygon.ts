import { AppConnectionType } from '@activepieces/shared';
import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { disabledState, joinOrUndefined, omitUndefined, setHomeType, setSpaceType } from '../common/helper';
import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import z from 'zod';
import { HOME_STATUS, REAL_ESTATE_SORT } from '../common/constants';
import { PropertySearchResponse } from '../common';

export const realEstateSearchPolygon = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'realEstateSearchPolygon',
  auth: apipieAuth,
  displayName: 'Real Estate Search Polygon',
  description: 'Search for real estate properties by polygon area using Real Estate API through RapidAPI.',
  props: {
polygon: Property.LongText({
      displayName: 'Location',
      description: 'Polygon coordinates string for search area (e.g. through google maps).',
      required: true,
    }),
    page: Property.Number({
      displayName: 'Page',
      description: 'Page to return (each page includes up to 41 results)',
      required: false,
    }),
    homeStatus: Property.StaticDropdown({
      displayName: 'Home Status',
      description: 'Filters properties based on their status',
      required: false,
      options: {
        options: HOME_STATUS
      },
    }),
    homeType: Property.MultiSelectDropdown({
      displayName: 'Home Type',
      description:
        'Find properties with specified home type (works for "For Sale" option in Home Status).',
      required: true,
      auth: apipieAuth,
      refreshers: [],
      options: async ({ auth, homeStatus }) => {
        if (!auth) return disabledState('Please connect your account first');
        return setHomeType(homeStatus as string);
      },
    }),
    spaceType: Property.MultiSelectDropdown({
      displayName: 'Space Type',
      description:
        'Find properties with specified rental type (works for "For Rent" option in Home Status).',
      required: true,
      auth: apipieAuth,
      refreshers: [],
      options: async ({ auth, homeStatus }) => {
        if (!auth) return disabledState('Please connect your account first');
        return setSpaceType(homeStatus as string);
      },
    }),
    sort: Property.StaticDropdown({
      displayName: 'Sort Order',
      description: 'Return results in a specific order',
      required: false,
      options: {
        options: REAL_ESTATE_SORT,
      },
    }),
    minPrice: Property.Number({
      displayName: 'Min Price',
      required: false,
    }),
    maxPrice: Property.Number({
      displayName: 'Max Price',
      required: false,
    }),
    minMonthlyPayment: Property.Number({
      displayName: 'Min Monthly Payment',
      required: false,
    }),
    maxMonthlyPayment: Property.Number({
      displayName: 'Max Monthly Payment',
      required: false,
    }),
    minBedrooms: Property.Number({
      displayName: 'Min Bedrooms',
      required: false,
    }),
    maxBedrooms: Property.Number({
      displayName: 'Max Bedrooms',
      required: false,
    }),
    minBathrooms: Property.Number({
      displayName: 'Min Bathrooms',
      required: false,
    }),
    maxBathrooms: Property.Number({
      displayName: 'Max Bathrooms',
      required: false,
    }),
    minSqft: Property.Number({
      displayName: 'Min Square Feet',
      required: false,
    }),
    maxSqft: Property.Number({
      displayName: 'Max Square Feet',
      required: false,
    }),
    minLotSize: Property.Number({
      displayName: 'Min Lot Size (sqft)',
      required: false,
    }),
    maxLotSize: Property.Number({
      displayName: 'Max Lot Size (sqft)',
      required: false,
    }),
    listingType: Property.StaticDropdown({
      displayName: 'Listing Type',
      required: false,
      defaultValue: 'BY_AGENT',
      options: {
        options: [
          { label: 'By Agent', value: 'BY_AGENT' },
          { label: 'By Owner / Other', value: 'BY_OWNER_OTHER' },
        ],
      },
    }),
    saleByAgent: Property.Checkbox({
      displayName: 'For Sale by Agent',
      required: false,
      defaultValue: true,
    }),
    saleByOwner: Property.Checkbox({
      displayName: 'For Sale by Owner',
      required: false,
      defaultValue: true,
    }),
    isNewConstruction: Property.Checkbox({
      displayName: 'New Construction',
      required: false,
      defaultValue: true,
    }),
    isForeclosure: Property.Checkbox({
      displayName: 'Foreclosure',
      description: 'Filters for properties that are foreclosures',
      required: false,
      defaultValue: true,
    }),
    isAuction: Property.Checkbox({
      displayName: 'Auction',
      required: false,
      defaultValue: true,
    }),
    wasForeclosed: Property.Checkbox({
      displayName: 'Previously Foreclosed',
      required: false,
      defaultValue: false,
    }),
    isPreforeclosure: Property.Checkbox({
      displayName: 'Pre-Foreclosure',
      required: false,
      defaultValue: false,
    }),
    maxHoaFee: Property.Number({
      displayName: 'Max HOA Fee',
      required: false,
    }),
    noHoaData: Property.Checkbox({
      displayName: 'Include Homes Without HOA Data',
      required: false,
      defaultValue: true,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      page: z.number().int().min(1).max(100).optional(),
      minPrice: z.number().min(0).optional(),
      maxPrice: z.number().min(0).optional(),
      minMonthlyPayment: z.number().min(0).optional(),
      maxMonthlyPayment: z.number().min(0).optional(),
      minBathrooms: z.number().min(0).optional(),
      maxBathrooms: z.number().min(0).optional(),
      minBedrooms: z.number().min(0).optional(),
      maxBedrooms: z.number().min(0).optional(),
      minSqft: z.number().min(0).optional(),
      maxSqft: z.number().min(0).optional(),
      minLotSize: z.number().min(0).optional(),
      maxLotSize: z.number().min(0).optional(),
      maxHoaFee: z.number().min(0).optional(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = omitUndefined({
      location: context.propsValue.polygon,
      page: context.propsValue.page,
      home_status: context.propsValue.homeStatus,
      home_type: joinOrUndefined(context.propsValue.homeType),
      space_type: joinOrUndefined(context.propsValue.spaceType),
      sort: context.propsValue.sort,
      min_price: context.propsValue.minPrice,
      max_price: context.propsValue.maxPrice,
      min_monthly_payment: context.propsValue.minMonthlyPayment,
      max_monthly_payment: context.propsValue.maxMonthlyPayment,
      min_bedrooms: context.propsValue.minBedrooms,
      max_bedrooms: context.propsValue.maxBedrooms,
      min_bathrooms: context.propsValue.minBathrooms,
      max_bathrooms: context.propsValue.maxBathrooms,
      min_sqft: context.propsValue.minSqft,
      max_sqft: context.propsValue.maxSqft,
      min_lot_size: context.propsValue.minLotSize,
      max_lot_size: context.propsValue.maxLotSize,
      listing_type: context.propsValue.listingType,
      for_sale_by_agent: context.propsValue.saleByAgent,
      for_sale_by_owner: context.propsValue.saleByOwner,
      for_sale_is_new_construction: context.propsValue.isNewConstruction,
      for_sale_is_foreclosure: context.propsValue.isForeclosure,
      for_sale_is_auction: context.propsValue.isAuction,
      for_sale_is_foreclosed: context.propsValue.wasForeclosed,
      for_sale_is_preforeclosure: context.propsValue.isPreforeclosure,
      max_hoa_fee: context.propsValue.maxHoaFee,
      includes_homes_no_hoa_data: context.propsValue.noHoaData,
    });

    const res = await httpClient.sendRequest<PropertySearchResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/data/real-estate/polygon',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
