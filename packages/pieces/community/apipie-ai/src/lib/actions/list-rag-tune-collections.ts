import { AppConnectionType } from '@activepieces/shared';
import { apipieAuth } from '../..';
import { createAction } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const listRagTuneCollections = createAction({
  name: 'listRagTuneCollections',
  auth: apipieAuth,
  displayName: 'List RAG Tune Collections',
  description:
    'Returns a list of RAG Tune collections for the authenticated user.',
  props: {},
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = {
      vector_provider: 'qdrant',
    };

    const res = await httpClient.sendRequest<string[]>({
      method: HttpMethod.POST,
      url: 'https://dev.apipie.ai/ragtune/listcollections',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
