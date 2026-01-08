import { createAction, Property } from '@activepieces/pieces-framework';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import z from 'zod';
import { AppConnectionType } from '@activepieces/shared';
import { apipieAuth } from '../..';

export const createVectorCollection = createAction({
  name: 'createVectorCollection',
  auth: apipieAuth,
  displayName: 'Create Vector Collection',
  description:
    'Creates a new vector collection with the specified name and dimension.',
  props: {
    name: Property.ShortText({
      displayName: 'Collection Name',
      description: 'The name of the collection you wish to create.',
      required: true,
    }),
    dimensions: Property.Number({
      displayName: 'Dimensions',
      description:
        'Number of dimensions for the embedding vector. Maximum value is 384-4096 - check the models route for max_tokens per model. Only supported by OpenAI',
      required: true,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      name: z.string().transform((value) => value.replaceAll(' ', '-')),
      dimensions: z.number().int().min(1).max(4096),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = {
      collection_name: context.propsValue.name,
      dimension: context.propsValue.dimensions,
      vector_provider: "qdrant",
    };

    const res = await httpClient.sendRequest<string>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/vectors',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
