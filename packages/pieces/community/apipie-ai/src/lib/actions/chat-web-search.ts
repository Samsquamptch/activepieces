import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import {
  chatCommon,
  joinOrUndefined,
  omitUndefined,
  searchCommon,
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
    searchProvider: searchCommon.searchProvider,
    searchWhitelist: searchCommon.searchWhitelist,
    searchBlacklist: searchCommon.searchBlacklist,
    searchGeo: searchCommon.searchGeo,
    searchLang: searchCommon.searchLang,
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
