import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { ImageResponse } from '../common';
import { AppConnectionType } from '@activepieces/shared';
import {
  disabledState,
  imageCommon,
  omitUndefined,
  retrievedModels,
} from '../common/helper';
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
    // prompt: Property.LongText({
    //   displayName: 'Prompt',
    //   description: 'Text description of the desired image.',
    //   required: true,
    // }),
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
    // styles: Property.Dropdown({
    //   displayName: 'Styles',
    //   description: 'The style to use when generating the image',
    //   required: false,
    //   auth: apipieAuth,
    //   refreshers: ['auth', 'model'],
    //   options: async ({ auth, model }) => {
    //     if (!auth) return disabledState('Please connect your account first');
    //     if (!model) return disabledState('Please select a model first');
    //     return retrieveEnumOptions(model as string, auth.secret_text, 'style');
    //   },
    // }),
    // size: Property.StaticDropdown({
    //   displayName: 'Image Size',
    //   description:
    //     'The size of the image generated. 1024x1024 is supported by all models.',
    //   required: false,
    //   options: {
    //     options: IMAGE_SIZES,
    //     disabled: false,
    //   },
    // }),
    // quality: Property.StaticDropdown({
    //   displayName: 'Image Quality',
    //   description: 'The quality of the image that will be generated.',
    //   required: false,
    //   options: {
    //     options: IMAGE_QUALITIES,
    //     disabled: false,
    //   },
    // }),
    // responseFormat: Property.StaticDropdown({
    //   displayName: 'Format',
    //   description:
    //     'The format in which the generated images are returned. Set to url by default.',
    //   required: false,
    //   options: {
    //     options: IMAGE_RESPONSE_FORMATS,
    //     disabled: false,
    //   },
    // }),
    // steps: Property.Number({
    //   displayName: 'Steps',
    //   description:
    //     'Amount of computational iterations to run. More is typically higher quality. Check specific models for compatibility.',
    //   required: false,
    // }),
    // loras: Property.MultiSelectDropdown({
    //   displayName: 'LoRa Models',
    //   description:
    //     'Augment the output with up to 3 LoRa models. Check specific models for compatibility.',
    //   required: false,
    //   auth: apipieAuth,
    //   refreshers: ['auth', 'model'],
    //   options: async ({ auth, model }) => {
    //     if (!auth) return disabledState('Please connect your account first');
    //     if (!model) return disabledState('Please select a model first');
    //     return retrieveEnumOptions(model as string, auth.secret_text, 'loras');
    //   },
    // }),
    // strength: Property.ShortText({
    //   displayName: 'Strength',
    //   description:
    //     'Controls the strength of the applied effect (Range 0-1). Check specific models for compatibility.',
    //   required: false,
    // }),
    // aspectRatio: Property.StaticDropdown({
    //   displayName: 'Aspect Ratio',
    //   description: 'Aspect Ratio. Check specific models for compatibility.',
    //   required: false,
    //   options: {
    //     options: ASPECT_RATIO,
    //     disabled: false,
    //   },
    // }),
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
