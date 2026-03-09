import { apipieAuth } from '../..';
import { createAction } from '@activepieces/pieces-framework';
import { vectorCommon } from '../common/common';
import { VectorIDs } from '../common/interfaces';
import {
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';
import { AppConnectionType } from '@activepieces/shared';

export const listVectorIds = createAction({
  name: 'listVectorIds',
  auth: apipieAuth,
  displayName: 'List Vector IDs',
  description: 'Retrieves a list of vector IDs for the specified collection.',
  props: {
    collection: vectorCommon.collection,
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
