import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { retriveVectorCollections } from '../common/helper';
import { VectorIDs } from '../common';
import {
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';
import { AppConnectionType } from '@activepieces/shared';

export const listVectorIds = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'listVectorIds',
  auth: apipieAuth,
  displayName: 'List Vector IDs',
  description: 'Retrieves a list of vector IDs for the specified collection.',
  props: {
    collection: Property.Dropdown({
      displayName: 'Collection Name',
      description: 'The collection to be deleted.',
      required: true,
      auth: apipieAuth,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) {
          return {
            disabled: true,
            options: [],
            placeholder: 'Please connect your account first',
          };
        }
        const modelResponse = await retriveVectorCollections(auth.secret_text);
        return {
          options: modelResponse.options,
          disabled: modelResponse.disabled,
          ...(modelResponse.placeholder && {
            placeholder: modelResponse.placeholder,
          }),
        };
      },
    }),
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const request: HttpRequest = {
      url: 'https://apipie.ai/vectors/list',
      body: {
        collection_name: context.propsValue.collection,
      },
      method: HttpMethod.POST,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    };
    const response = await httpClient.sendRequest<VectorIDs>(
      request
    );

    return response.body.vectors;
  },
});
