import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { ApiPieModel, ApiPieModels } from '../common';
import { AuthenticationType, httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';

export const chatCompletion = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'chatCompletion',
  auth: apipieAuth,
  displayName: 'chat completion',
  description: 'Send a chat completion request to a selected LLM model.',
  props: {
    model: Property.Dropdown({
      displayName: "Model",
      description: "The ID of the LLM model to use for completions.",
      required: true,
      refreshers: [],
      options: async ({ auth }) => {
          const request: HttpRequest = {
            url: 'https://apipie.ai/v1/models?type=llm',
            method: HttpMethod.GET,
            authentication: {
              type: AuthenticationType.BEARER_TOKEN,
              token: auth as string,
            },
          };
          try {
            const data = await httpClient.sendRequest<ApiPieModels>(
              request
            );
            const options = data.body.data.map((llm: ApiPieModel) => {
              return {
                label: llm.id,
                value: llm.model,
              };
            });
          // const uniqueModels = new Map();
          // data.body.data.map((llm: { id: string; model: string }) => {
          //   if (!uniqueModels.has(llm.id)) {
          //     uniqueModels.set(llm.id, llm.model);
          //   }
          // });
          // const options = Array.from(uniqueModels.entries()).map(([value, label]) => ({
          //   label,
          //   value,
          // }));
          // const options = Array.from(uniqueModels.entries())
          //   .map(([
          //     value,
          //     label,
          //   ]) => ({
          //     label,
          //     value,
          //   }))
          //   .sort((a, b) => a.label.localeCompare(b.label));
          return {
            options: options,
            disabled: false,
          };
        } catch (e) {
          return {
            options: [],
            disabled: true,
            placeholder: `Couldn't Load Models:\n${e}`,
          };
        }
      },
    }),
  },
  async run() {
    // Action logic here
  },
});
