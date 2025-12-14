import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { ApiPieModels } from '../common';
import {
  AuthenticationType,
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';
import { Lowercase } from '@sinclair/typebox';

export const chatCompletion = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'chatCompletion',
  auth: apipieAuth,
  displayName: 'chat completion',
  description: 'Send a chat completion request to a selected LLM model.',
  props: {
    model: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the LLM model to use for completions.',
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
          const data = await httpClient.sendRequest<ApiPieModels>(request);
          const uniqueModels = new Map();
          data.body.data.map((llm: { id: string; model: string }) => {
            if (!uniqueModels.has(llm.id)) {
              uniqueModels.set(llm.id, llm.model);
            }
          });
          const options = Array.from(uniqueModels.entries())
            .map(([value, label]) => ({
              label,
              value,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
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
    userMessage: Property.LongText({
      displayName: 'User Message',
      required: true,
      description:
        "The content of the message sent to the model with the user role. For example: 'Why is the sky blue?'",
    }),
    maxTokens: Property.Number({
      displayName: 'Max Tokens',
      required: false,
      description:
        'Maximum number of tokens the model can generate. (range: [1, context length))',
    }),
    temperature: Property.Number({
      displayName: 'Temperature',
      required: false,
      description:
        'Sampling temperature: Lower values make output more deterministic, higher values increase randomness. (range: [0, 2])',
      defaultValue: 0,
    }),
    topP: Property.Number({
      displayName: 'Top P',
      required: false,
      description:
        'Top-p (nucleus) sampling value. Limits sampling to the smallest set of tokens whose cumulative probability exceeds p. (range: (0, 1])',
      defaultValue: 0,
    }),
    topK: Property.Number({
      displayName: 'Top K',
      required: false,
      description:
        'Top-k sampling value. Limits sampling to the k most likely tokens at each step. (range: [1, ∞))',
      defaultValue: 1,
    }),
    frequencyPenalty: Property.Number({
      displayName: 'Frequency Penalty',
      required: false,
      description:
        'Penalty applied to tokens that appear frequently in the output. Reduces repetition. (range: [-2, 2])',
      defaultValue: 0,
    }),
    presencePenalty: Property.Number({
      displayName: 'Presence Penalty',
      required: false,
      description:
        'Penalty applied to tokens that have already appeared in the prompt. Encourages new content. (range: [-2, 2])',
      defaultValue: 0,
    }),
    repetitionPenalty: Property.Number({
      displayName: 'Repetition Penalty',
      required: false,
      description:
        'Penalty applied to repeated sequences in the output. Helps reduce verbatim repetition. (range: (0, 2])',
      defaultValue: 0,
    }),
    reasoningEffort: Property.StaticDropdown({
      displayName: 'Reasoning Effort',
      required: false,
      description: 'OpenAI-style reasoning effort setting, controlling how much effort the model uses to reason.',
      options: {
        options: [
        {
          label: 'Low',
          value: 'low'
        },
        {
          label: 'medium', 
          value: 'medium'
        },
        {
          label: 'high', 
          value: 'high'
        }
      ],
    },
  }),
  },
  async run() {
    // Action logic here
  },
});
