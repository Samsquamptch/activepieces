import { createAction, Property } from '@activepieces/pieces-framework';
import { RESPONSE_LENGTH } from '../common/constants';
import { AppConnectionType } from '@activepieces/shared';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import z from 'zod';
import { omitUndefined } from '../common/common';
import { ScrapeResponse } from '../common/interfaces';
import { apipieAuth } from '../..';

export const webScraper = createAction({
  name: 'webScraper',
  displayName: 'Web Scraper',
  auth: apipieAuth,
  description: 'Scrape content from a webpage.',
  props: {
    url: Property.ShortText({
      displayName: 'URL',
      description: 'The URL to scrape content from.',
      required: true,
    }),
    provider: Property.StaticDropdown({
      displayName: 'Provider',
      description: 'The scrape provider to use.',
      options: {
        options: [
          { label: 'Brightdata', value: 'brightdata' },
          { label: 'Valyu', value: 'valyu' },
        ],
        disabled: false,
      },
      required: false,
    }),
    format: Property.StaticDropdown({
      displayName: 'Format',
      description: 'Format of the response.',
      options: {
        options: [
          { label: 'Raw', value: 'raw' },
          { label: 'Parsed', value: 'parsed' },
        ],
        disabled: false,
      },
      required: false,
    }),
    scrapeRender: Property.Checkbox({
      displayName: 'Scrape Render',
      description: 'Forces Javascript to fully render before scraping.',
      required: false,
    }),
    scrapeLength: Property.StaticDropdown({
      displayName: 'Scrape Length',
      description: 'Valyu only. Content length for extraction.',
      options: {
        options: RESPONSE_LENGTH,
        disabled: false,
      },
      required: false,
    }),
    summary: Property.StaticDropdown({
      displayName: 'Summary',
      description:
        'AI processing options for Valyu. Use the manual input option to provide custom instructions or JSON Schema.',
      options: {
        options: [
          { label: 'No AI processing', value: false },
          { label: 'Basic summarization', value: true },
        ],
        disabled: false,
      },
      required: false,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      url: z.url(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = omitUndefined({
      url: context.propsValue.url,
      provider: context.propsValue.provider,
      format: context.propsValue.format,
      scrape_render: context.propsValue.scrapeRender,
      scrape_length: context.propsValue.scrapeLength,
      summary: context.propsValue.summary,
    });

    const res = await httpClient.sendRequest<ScrapeResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/scrape',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
