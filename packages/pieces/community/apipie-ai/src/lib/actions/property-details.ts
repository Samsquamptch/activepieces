import { apipieAuth } from '../..';
import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { AppConnectionType } from '@activepieces/shared';
import z from 'zod';
import { PropertyDetailsResponse } from '../common';

export const propertyDetails = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'propertyDetails',
  auth: apipieAuth,
  displayName: 'Property Details',
  description:
    'Get detailed property information by address using Real Estate API through RapidAPI',
  props: {
    address: Property.ShortText({
      displayName: 'Address',
      description:
        'Full property address, for example "1161 Natchez Dr College Station Texas 77845". Must be no longer than 200 characters',
      required: true,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      address: z.string().max(200, 'Length cannot exceed 200 characters'),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const res = await httpClient.sendRequest<PropertyDetailsResponse>({
          method: HttpMethod.POST,
          url: 'https://apipie.ai/v1/data/real-estate/address',
          body : {
            address: context.propsValue.address
          },
          headers: {
            Authorization: context.auth.secret_text,
            Accept: 'application/json',
          },
        });
    
        return res.body;
  },
});
