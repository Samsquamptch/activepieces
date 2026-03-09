import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { ImageResponse } from '../common/interfaces';
import z from 'zod';
import {
  disabledState,
  imageCommon,
  omitUndefined,
  retrievedModels,
} from '../common/common';
import { apipieAuth } from '../..';
import { AppConnectionType } from '@activepieces/shared';

export const generateImage = createAction({
  name: 'generateImage',
  auth: apipieAuth,
  displayName: 'Generate Image',
  description: 'Generates an image based on the provided prompt and parameters',
  props: {
    model: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the LLM model to use for completions.',
      required: true,
      auth: apipieAuth,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledState('Please connect your account first');
        return retrievedModels('subtype=text-to-image', auth.secret_text);
      },
    }),
    prompt: imageCommon.prompt,
    styles: imageCommon.styles,
    size: imageCommon.size,
    quality: imageCommon.quality,
    responseFormat: imageCommon.responseFormat,
    steps: imageCommon.steps,
    loras: imageCommon.loras,
    strength: imageCommon.strength,
    aspectRatio: imageCommon.aspectRatio,
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      steps: z.number().int().min(1).optional(),
      strength: z.number().min(0).max(1).optional(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const optionalParams = omitUndefined({
      size: context.propsValue.size,
      quality: context.propsValue.quality,
      response_format: context.propsValue.responseFormat,
      style: context.propsValue.styles,
      steps: context.propsValue.steps,
      loras: context.propsValue.loras,
      strength: context.propsValue.strength,
      aspect_ratio: context.propsValue.aspectRatio,
    });

    const body = {
      model: context.propsValue.model,
      prompt: context.propsValue.prompt,
      ...optionalParams,
    };

    const res = await httpClient.sendRequest<ImageResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/images/generations',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
