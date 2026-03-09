import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import z from 'zod';
import {
  joinOrUndefined,
  omitUndefined,
  propertyCommon,
} from '../common/common';
import { PropertySearchResponse } from '../common/interfaces';
import { AppConnectionType } from '@activepieces/shared';

export const realEstateSearchLocation = createAction({
  name: 'realEstateSearchLocation',
  auth: apipieAuth,
  displayName: 'Real Estate Search by Location',
  description:
    'Search for real estate properties by location using Real Estate API through RapidAPI',
  props: {
    location: Property.ShortText({
      displayName: 'Location',
      description: 'Location details (county, neighborhood, or zip code)',
      required: true,
    }),
    page: propertyCommon.page,
    homeStatus: propertyCommon.homeStatus,
    homeType: propertyCommon.homeType,
    spaceType: propertyCommon.spaceType,
    sort: propertyCommon.sort,
    minPrice: propertyCommon.minPrice,
    maxPrice: propertyCommon.maxPrice,
    minMonthlyPayment: propertyCommon.minMonthlyPayment,
    maxMonthlyPayment: propertyCommon.maxMonthlyPayment,
    minBedrooms: propertyCommon.minBedrooms,
    maxBedrooms: propertyCommon.maxBedrooms,
    minBathrooms: propertyCommon.minBathrooms,
    maxBathrooms: propertyCommon.maxBathrooms,
    minSqft: propertyCommon.minSqft,
    maxSqft: propertyCommon.maxSqft,
    minLotSize: propertyCommon.minLotSize,
    maxLotSize: propertyCommon.maxLotSize,
    listingType: propertyCommon.listingType,
    saleByAgent: propertyCommon.saleByAgent,
    saleByOwner: propertyCommon.saleByOwner,
    isNewConstruction: propertyCommon.isNewConstruction,
    isForeclosure: propertyCommon.isForeclosure,
    isAuction: propertyCommon.isAuction,
    wasForeclosed: propertyCommon.wasForeclosed,
    isPreforeclosure: propertyCommon.isPreforeclosure,
    maxHoaFee: propertyCommon.maxHoaFee,
    noHoaData: propertyCommon.noHoaData,
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
      location: context.propsValue.location,
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
      url: 'https://apipie.ai/v1/data/real-estate/search',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
