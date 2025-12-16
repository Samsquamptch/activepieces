import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { createAction } from '@activepieces/pieces-framework';
import { AppConnectionType } from '@activepieces/shared';

export const listVectorCollections = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'listVectorCollections',
  displayName: 'list vector collections',
  description:
    'Returns a list of vector collections for the authenticated user.',
  props: {},
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const res = await httpClient.sendRequest<string[]>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/vectors/listcollections',
      body: {},
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
