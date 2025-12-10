import { createAction } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { apipieAuth } from '../..';

export const listModels = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'listModels',
  auth: apipieAuth,
  displayName: 'list models',
  description: 'list models based on selected type',
  props: {},
  async run(context) {
    const res = await httpClient.sendRequest<string[]>({
      method: HttpMethod.GET,
      url: 'https://apipie.ai/v1/models?type=llm',
      headers: {
        Authorization: context.auth,
        Accept: "application/json"
      },
    });
    return res.body;
  },
});
