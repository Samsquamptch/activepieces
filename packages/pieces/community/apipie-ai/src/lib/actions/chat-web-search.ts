import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import {
  chatCommon,
  joinOrUndefined,
  omitUndefined,
  retrievedModels,
} from '../common/common';
import { EFFORT_OPTIONS } from '../common/constants';
import { AppConnectionType } from '@activepieces/shared';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import z from 'zod';
import { CompletionResponse } from '../common/interfaces';

export const chatWebSearch = createAction({
  name: 'chatWebSearch',
  auth: apipieAuth,
  displayName: 'Chat (Web Search)',
  description: 'Send a chat to a selected LLM model using web search results.',
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
    searchContext: Property.StaticDropdown({
      displayName: 'Search Context Size',
      description:
        'Options for web search context size. Can be set to low, medium, or high. Defaults to low.',
      required: false,
      options: {
        options: EFFORT_OPTIONS,
        disabled: false,
      },
    }),
    searchProvider: Property.StaticDropdown({
      displayName: 'Search Provider',
      description:
        'Search provider to use for inline internet augmentation. Can be "valyu" or "google". Default is "valyu".',
      required: false,
      options: {
        options: [
          {
            value: 'Valyu',
            label: 'valyu',
          },
          {
            value: 'Google',
            label: 'google',
          },
        ],
        disabled: false,
      },
    }),
    searchWhitelist: Property.Array({
      displayName: 'URL Whitelist',
      description:
        'List of root FQDNs to allow for AI search (e.g. bbc.com, apnews.com). One per line.',
      required: false,
    }),
    searchBlacklist: Property.Array({
      displayName: 'URL Blacklist',
      description:
        'List of root FQDNs to block for AI search (e.g. cnn.com, foxnews.com). One per line.',
      required: false,
    }),
    searchGeo: Property.ShortText({
      displayName: 'Country Code',
      description:
        "Enter your country code for localized results (e.g. 'gb'). Defaults to 'us'.",
      required: false,
    }),
    searchLang: Property.ShortText({
      displayName: 'Language',
      description:
        "The language of search results (e.g. 'en'). Defaults to 'en'.",
      required: false,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      searchWhitelist: z.string().array().optional(),
      searchBlacklist: z.string().array().optional(),
      searchGeo: z.string().optional(),
      searchLang: z.string().optional(),
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

    const searchContext = {
      search_context_size: context.propsValue.searchContext ?? 'low',
    };

    const optionalParams = omitUndefined({
      search_provider: context.propsValue.searchProvider,
      search_whitelist: joinOrUndefined(context.propsValue.searchWhitelist),
      search_blacklist: joinOrUndefined(context.propsValue.searchBlacklist),
      search_lang: context.propsValue.searchLang,
      search_geo: context.propsValue.searchGeo,
    });

    const body = {
      model: context.propsValue.model,
      messages,
      web_search_options: searchContext,
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
