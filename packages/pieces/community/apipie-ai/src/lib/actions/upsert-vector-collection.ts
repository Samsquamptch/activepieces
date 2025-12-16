import { apipieAuth } from '../../index';
import { createAction, Property } from '@activepieces/pieces-framework';
import { retriveVectorCollections } from '../common/helper';
import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import z from 'zod';
import { AppConnectionType } from '@activepieces/shared';

export const upsertVectorCollection = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'upsertVectorCollection',
  displayName: 'Upsert Vector Collection',
  description:
    'Upserts a vector into the specified collection with metadata and data.',
  props: {
    collection: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the embedding model to use for completions.',
      required: true,
      auth: apipieAuth,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) {
          return {
            disabled: true,
            options: [],
            placeholder: 'Please connect your account first',
          };
        }
        const modelResponse = await retriveVectorCollections(auth.secret_text);
        return {
          options: modelResponse.options,
          disabled: modelResponse.disabled,
          ...(modelResponse.placeholder && {
            placeholder: modelResponse.placeholder,
          }),
        };
      },
    }),
    vectorID: Property.ShortText({
      displayName: 'Vector ID',
      description: 'The ID of a vector inside of a collection.',
      required: true,
    }),
    metaTag: Property.ShortText({
      displayName: 'Meta Tag',
      description: 'The Meta Tag associated with the vector.',
      required: true,
    }),
    data: Property.ShortText({
      displayName: 'Data',
      description: 'Text you wish to associate with the vector.',
      required: true,
    }),
    embedding: Property.Array({
      displayName: 'Embedding',
      description:
        'Embedding data you wish to add to the vector. Please input data in the following format `[0.1,0.2,0.3]`.',
      required: true,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      vectorID: z.string().transform((value) => value.replaceAll(' ', '-')),
      embedding: z.number().array(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = {
      collection_name: context.propsValue.collection,
      vector_id: context.propsValue.vectorID,
      metatag: context.propsValue.metaTag,
      data: context.propsValue.data,
      embedding: context.propsValue.embedding,
    };

    const res = await httpClient.sendRequest<string>({
      method: HttpMethod.PUT,
      url: 'https://apipie.ai/vectors/upsert',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
