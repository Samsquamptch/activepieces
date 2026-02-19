import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { joinOrUndefined, omitUndefined, searchCommon } from '../common/common';
import { RESPONSE_LENGTH } from '../common/constants';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import z from 'zod';
import { AppConnectionType } from '@activepieces/shared';
import { SearchResultsResponse } from '../common/interfaces';

export const webSearch = createAction({
  name: 'webSearch',
  auth: apipieAuth,
  displayName: 'Web Search',
  description: 'Perform a web search and return results.',
  props: {
    query: Property.ShortText({
      displayName: 'Query',
      description: 'The web query you wish to search.',
      required: true,
    }),
    searchProvider: searchCommon.searchProvider,
    searchGeo: searchCommon.searchGeo,
    searchLang: searchCommon.searchLang,
    resultNumber: Property.Number({
      displayName: 'Results Amount',
      description:
        'The number of results returned per search. 1-100 for Google, 1-20 for Valyu.',
      required: false,
    }),
    safeSearch: Property.StaticDropdown({
      displayName: 'Safe Search',
      description: 'Safe search filter level. Not supported by Valyu.',
      options: {
        options: [
          { label: 'Enabled', value: 1 },
          { label: 'Moderate', value: -1 },
          { label: 'Disabled', value: -2 },
        ],
        disabled: false,
      },
      required: false,
    }),
    searchWhitelist: searchCommon.searchWhitelist,
    searchBlacklist: searchCommon.searchBlacklist,
    maxPrice: Property.Number({
      displayName: 'Max Price',
      description:
        'Valyu only. Maximum price in dollars for a thousands retrievals. Determined by search type and max number of results if not provided.',
      required: false,
    }),
    startDate: Property.DateTime({
      displayName: 'Start Date',
      description: 'Valyu only. Start date for time-filtered searches.',
      required: false,
    }),
    endDate: Property.DateTime({
      displayName: 'End Date',
      description: 'Valyu only. End date for time-filtered searches.',
      required: false,
    }),
    fastMode: Property.Checkbox({
      displayName: 'Fast Mode',
      description:
        'Valyu only. Fast mode reduces latency but returns shorter results. Best for general purpose queries',
      required: false,
    }),
    category: Property.ShortText({
      displayName: 'Category',
      description:
        'Natural language category/guide phrase to help guide the search to the most relevant content.',
      required: false,
    }),
    responseLength: Property.StaticDropdown({
      displayName: 'Response Length',
      description:
        'Valyu only. Controls the length of content returned per result.',
      options: {
        options: RESPONSE_LENGTH,
        disabled: false,
      },
      required: false,
    }),
    isToolCall: Property.Checkbox({
      displayName: 'Tool Call',
      description:
        'Valyu only. modifies retrieval process based on whether the API is being called by an AGI agent as a tool call, or a user query.',
      required: false,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      searchWhitelist: z.string().array().optional(),
      searchBlacklist: z.string().array().optional(),
      searchGeo: z.string().optional(),
      searchLang: z.string().optional(),
      resultNumber: z.number().int().min(1).max(100).optional(),
      maxPrice: z.number().min(0).optional(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = omitUndefined({
      query: context.propsValue.query,
      search_provider: context.propsValue.searchProvider,
      geo: context.propsValue.searchGeo,
      lang: context.propsValue.searchLang,
      results: context.propsValue.resultNumber,
      safeSearch: context.propsValue.safeSearch,
      whitelist: joinOrUndefined(context.propsValue.searchWhitelist),
      blacklist: joinOrUndefined(context.propsValue.searchBlacklist),
      max_price: context.propsValue.maxPrice,
      start_date: context.propsValue.startDate,
      end_date: context.propsValue.endDate,
      fast_mode: context.propsValue.fastMode,
      category: context.propsValue.category,
      response_length: context.propsValue.responseLength,
      is_tool_call: context.propsValue.isToolCall,
    });

    const res = await httpClient.sendRequest<SearchResultsResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/search',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body
  },
});
