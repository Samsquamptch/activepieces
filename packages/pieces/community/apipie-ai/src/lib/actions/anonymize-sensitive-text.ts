import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { AnonymizeTextResponse } from '../common';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { AppConnectionType } from '@activepieces/shared';

export const anonymizeSensitiveText = createAction({
  name: 'anonymizeSensitiveText',
  auth: apipieAuth,
  displayName: 'Anonymize Sensitive Text',
  description:
    'Detects and anonymizes PII in text, returning the anonymized text plus a re-identification map.',
  props: {
    text: Property.LongText({
      displayName: 'Text',
      description:
        'Text containing potentially sensitive information to be anonymized',
      required: true,
    }),
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = {
      text: context.propsValue.text,
    };

    const res = await httpClient.sendRequest<AnonymizeTextResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/anon',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
