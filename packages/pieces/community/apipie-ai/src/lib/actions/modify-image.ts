import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { ImageResponse } from '../common/interfaces';
import { AppConnectionType } from '@activepieces/shared';
import {
  disabledState,
  imageCommon,
  omitUndefined,
  retrievedModels,
} from '../common/common';
import z from 'zod';
import { apipieAuth } from '../..';

export const modifyImage = createAction({
  name: 'modifyImage',
  auth: apipieAuth,
  displayName: 'Modify Image',
  description:
    'Modifies an existing image using an image to image model and provided parameters',
  props: {
    model: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the LLM model to use for completions.',
      required: true,
      auth: apipieAuth,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledState('Please connect your account first');
        return retrievedModels('subtype=image-to-image', auth.secret_text);
      },
    }),
    prompt: imageCommon.prompt,
    url: Property.LongText({
      displayName: 'Image URL',
      description: 'URL for the image you wish to modify',
      required: true,
    }),
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
      url: z.url(),
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
      image: context.propsValue.url,
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
