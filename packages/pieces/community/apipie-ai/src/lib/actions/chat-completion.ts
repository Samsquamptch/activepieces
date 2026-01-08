import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { CompletionResponse } from '../common/interfaces';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { z } from 'zod';
import { propsValidation } from '@activepieces/pieces-common';
import { omitUndefined, retrievedModels } from '../common/helper';
import { AppConnectionType } from '@activepieces/shared';
import { chatCommon } from '../common/helper';

export const chatCompletion = createAction({
  name: 'chatCompletion',
  auth: apipieAuth,
  displayName: 'Chat Completion',
  description: 'Send a chat completion request to a selected LLM model.',
  props: {
    // model: Property.Dropdown({
    //   displayName: 'Model',
    //   description: 'The ID of the LLM model to use for completions.',
    //   required: true,
    //   auth: apipieAuth,
    //   refreshers: [],
    //   options: async ({ auth }) => {
    //     if (!auth) {
    //       return {
    //         disabled: true,
    //         options: [],
    //         placeholder: 'Please connect your account first',
    //       };
    //     }
    //     const modelResponse = await retrievedModels(
    //       'type=llm',
    //       auth.secret_text
    //     );
    //     return {
    //       options: modelResponse.options,
    //       disabled: modelResponse.disabled,
    //       ...(modelResponse.placeholder && {
    //         placeholder: modelResponse.placeholder,
    //       }),
    //     };
    //   },
    // }),
    // userMessage: Property.LongText({
    //   displayName: 'User Message',
    //   required: true,
    //   description:
    //     "The content of the message sent to the model with the user role. For example: 'Why is the sky blue?'",
    // }),
    // systemInstructions: Property.LongText({
    //   displayName: 'System Instructions',
    //   required: false,
    //   description:
    //     "Instructions to give for the system role. For example 'You are a helpful assistant that speaks only in Swedish.'",
    // }),
    model: chatCommon.model,
    userMessage: chatCommon.userMessage,
    systemInstructions: chatCommon.systemInstructions,
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
    }),
    topP: Property.Number({
      displayName: 'Top P',
      required: false,
      description:
        'Top-p (nucleus) sampling value. Limits sampling to the smallest set of tokens whose cumulative probability exceeds p. (range: (0, 1])',
    }),
    topK: Property.Number({
      displayName: 'Top K',
      required: false,
      description:
        'Top-k sampling value. Limits sampling to the k most likely tokens at each step. (range: [1, ∞))',
    }),
    frequencyPenalty: Property.Number({
      displayName: 'Frequency Penalty',
      required: false,
      description:
        'Penalty applied to tokens that appear frequently in the output. Reduces repetition. (range: [-2, 2])',
    }),
    presencePenalty: Property.Number({
      displayName: 'Presence Penalty',
      required: false,
      description:
        'Penalty applied to tokens that have already appeared in the prompt. Encourages new content. (range: [-2, 2])',
    }),
    repetitionPenalty: Property.Number({
      displayName: 'Repetition Penalty',
      required: false,
      description:
        'Penalty applied to repeated sequences in the output. Helps reduce verbatim repetition. (range: (0, 2])',
    }),
    reasoningEffort: Property.StaticDropdown({
      displayName: 'Reasoning Effort',
      required: false,
      description:
        'OpenAI-style reasoning effort setting, controlling how much effort the model uses to reason.',
      options: {
        options: [
          {
            label: 'Low',
            value: 'low',
          },
          {
            label: 'medium',
            value: 'medium',
          },
          {
            label: 'high',
            value: 'high',
          },
        ],
      },
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      maxTokens: z.number().int().min(1).optional(),
      temperature: z.number().min(0).max(1.0).optional(),
      topP: z.number().min(0).max(1.0).optional(),
      topK: z.number().min(0).optional(),
      frequencyPenalty: z.number().min(-2).max(2).optional(),
      presencePenalty: z.number().min(-2).max(2).optional(),
      repetitionPenalty: z.number().min(1).max(2).optional(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const messages = [
      omitUndefined({
        role: 'system',
        content: context.propsValue.systemInstructions,
      }),
      {
        role: 'user',
        content: context.propsValue.userMessage,
      },
    ].filter((msg) => msg.content !== undefined);

    const optionalParams = omitUndefined({
      max_tokens: context.propsValue.maxTokens,
      temperature: context.propsValue.temperature,
      top_p: context.propsValue.topP,
      top_k: context.propsValue.topK,
      frequency_penalty: context.propsValue.frequencyPenalty,
      presence_penalty: context.propsValue.presencePenalty,
      repetition_penalty: context.propsValue.repetitionPenalty,
      reasoning_effort: context.propsValue.reasoningEffort,
    });

    const body = {
      model: context.propsValue.model,
      messages,
      ...optionalParams,
    };

    const res = await httpClient.sendRequest<CompletionResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/chat/completions',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body.choices;
  },
});
