import { apipieAuth } from '../../index';
import { createAction, Property } from '@activepieces/pieces-framework';
import { chatCommon, disabledState, omitUndefined, retrievedModels } from '../common/helper';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import z from 'zod';
import { CompletionResponse } from '../common/interfaces';

export const chatFunctions = createAction({
  name: 'chatFunctions',
  auth: apipieAuth,
  displayName: 'Chat Functions',
  description: 'Send a chat to a selected LLM model using functions.',
  props: {
    model: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the LLM model to use for completions.',
      required: true,
      auth: apipieAuth,
      refreshers: [],
      options: async ({ auth }) => {
        if (!auth) return disabledState('Please connect your account first')
        return retrievedModels('subtype=tools', auth.secret_text);
      },
    }),
    userMessage: chatCommon.userMessage,
    // userMessage: Property.LongText({
    //   displayName: 'User Message',
    //   required: true,
    //   description:
    //     "The content of the message sent to the model with the user role. For example: 'Why is the sky blue?'",
    // }),
    functions: Property.LongText({
      displayName: 'Functions',
      required: true,
      description:
        'A valid JSON array of functions. Function calls are handled in Open AI standard request/response format.',
      defaultValue: `[
          {
            "type": "function",
            "name": "your_function_name",
            "description": "Details on when and how to use the function",
            "strict": true,
            "parameters": {
              "type": "object",
              "properties": {
                "property_name": {
                  "type": "property_type",
                  "description": "A description for this property"
                }
              },
              "required": [
                "list",
                "of",
                "required",
                "properties",
                "for",
                "this",
                "object"
              ],
              "additionalProperties": false
            }
          }
        ]`,
    }),
    systemInstructions: chatCommon.systemInstructions,
    // systemInstructions: Property.LongText({
    //   displayName: 'System Instructions',
    //   required: false,
    //   description:
    //     "Instructions to give for the system role. For example 'You are a helpful assistant that speaks only in Swedish.'",
    // }),
    toolChoice: Property.StaticDropdown({
      displayName: 'Tool Choice',
      required: false,
      description:
        '\n- "Auto" means the model can pick between generating a message or calling one or more tools. \n- "Required" means the model must call one or more tools.',
      options: {
        options: [
          {
            value: 'Auto',
            label: 'auto',
          },
          {
            value: 'Required',
            label: 'required',
          },
        ],
        disabled: false,
      },
    }),
  },
  async run(context) {
    const jsonStringSchema = z.string().refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Invalid JSON',
      }
    );

    await propsValidation.validateZod(
      { functions: context.propsValue.functions },
      { functions: jsonStringSchema }
    );

    if (!context.auth) {
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
      tool_choice: context.propsValue.toolChoice,
    });

    const body = {
      model: context.propsValue.model,
      messages,
      tools: context.propsValue.functions,
      tools_model: context.propsValue.model,
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
