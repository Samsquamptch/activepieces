import { createAction, Property } from '@activepieces/pieces-framework';
import { omitUndefined, retrievedModels } from '../common/helper';
import { apipieAuth } from '../..';
import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import z from 'zod';
import { EmbeddingResponse } from '../common';
import { AppConnectionType } from '@activepieces/shared';

export const createEmbeddings = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'createEmbeddings',
  auth: apipieAuth,
  displayName: 'Create Embeddings',
  description: 'Generate embeddings for the given input text using the specified model.',
  props: {
      model: Property.Dropdown({
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
          const modelResponse = await retrievedModels('type=embedding', auth.secret_text);
          return {
            options: modelResponse.options,
            disabled: modelResponse.disabled,
            ...(modelResponse.placeholder && { placeholder: modelResponse.placeholder }),
          };
        },
      }),
    input: Property.LongText({
      displayName: 'Input',
      required: true,
      description:
        "Input text to generate embeddings for. For example: 'Why is the sky blue?'",
    }),
    encoding: Property.StaticDropdown({
      displayName: 'Encoding Format',
      description: 'Format of the output encoding. Only supported by OpenAI',
      required: false,
      options: {
        options: [
          { label: 'Float', value: 'float' },
          { label: 'Np', value: 'np' },
        ],
      },
    }),
    dimensions: Property.Number({
      displayName: 'Dimensions',
      description: 'Number of dimensions for the embedding vector. Maximum value is 384-1536 - check the models route for max_tokens per model. Only supported by OpenAI',
      required: false,
    })
    },
    async run(context) {
      await propsValidation.validateZod(context.propsValue, {
        dimensions: z.number().int().min(1).max(1536).optional(),
      });

      if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
            throw new Error('API key is required');
          }
      
      const optionalParams = omitUndefined({
        encoding_format: context.propsValue.encoding,
        dimensions: context.propsValue.dimensions,
      });
  
      const body = {
        model: context.propsValue.model,
        prompt: context.propsValue.input,
        ...optionalParams,
      };
  
      const res = await httpClient.sendRequest<EmbeddingResponse>({
        method: HttpMethod.POST,
        url: 'https://apipie.ai/v1/embeddings',
        body,
        headers: {
          Authorization: context.auth.secret_text,
          Accept: 'application/json',
        },
      });
  
      return res.body;
    },
});
