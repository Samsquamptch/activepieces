import {
  AuthenticationType,
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import {
  IMAGE_RESPONSE_FORMATS,
  IMAGE_SIZES,
  IMAGE_QUALITIES,
  ASPECT_RATIO,
} from '../common/constants';
import { promptResponse } from '../common';
import z from 'zod';
import { omitUndefined, retrievedModels } from '../common/helper';
import { apipieAuth } from '../..';
import { AppConnectionType } from '@activepieces/shared';

export const generateImage = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'generateImage',
  displayName: 'generate image',
  description: 'generates an image based on the provided prompt and parameters',
  props: {
    model: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the LLM model to use for completions.',
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
        const modelResponse = await retrievedModels(
          'type=text-to-image',
          auth.secret_text
        );
        return {
          options: modelResponse.options,
          disabled: modelResponse.disabled,
          ...(modelResponse.placeholder && {
            placeholder: modelResponse.placeholder,
          }),
        };
        // const request: HttpRequest = {
        //   url: 'https://apipie.ai/v1/models?subtype=text-to-image',
        //   method: HttpMethod.GET,
        //   authentication: {
        //     type: AuthenticationType.BEARER_TOKEN,
        //     token: auth.secret_text,
        //   },
        // };
        // try {
        //   const data = await httpClient.sendRequest<ApiPieModels>(request);
        //   const uniqueModels = new Map();
        //   data.body.data.map((llm: { id: string; model: string }) => {
        //     if (!uniqueModels.has(llm.id)) {
        //       uniqueModels.set(llm.id, llm.model);
        //     }
        //   });
        //   const options = Array.from(uniqueModels.entries())
        //     .map(([value, label]) => ({
        //       label,
        //       value,
        //     }))
        //     .sort((a, b) => a.label.localeCompare(b.label));
        //   return {
        //     options: options,
        //     disabled: false,
        //   };
        // } catch (e) {
        //   return {
        //     options: [],
        //     disabled: true,
        //     placeholder: `Couldn't Load Models:\n${e}`,
        //   };
        // }
      },
    }),
    styles: Property.Dropdown({
      displayName: 'Styles',
      description: 'The style to use when generating the image',
      required: false,
      auth: apipieAuth,
      refreshers: ['auth', 'model'],
      options: async ({ auth, model }) => {
        if (!auth) {
          return {
            disabled: true,
            options: [],
            placeholder: 'Please connect your account first',
          };
        }
        if (!model) {
          return {
            disabled: true,
            options: [],
          };
        }
        const modelResponse = await retrievedModels(
          `https://apipie.ai/v1/models/detailed?model=${model}`,
          auth.secret_text
        );
        return {
          options: modelResponse.options,
          disabled: modelResponse.disabled,
          ...(modelResponse.placeholder && {
            placeholder: modelResponse.placeholder,
          }),
        };
        // try {
        //   const response = await httpClient.sendRequest({
        //     method: HttpMethod.GET,
        //     url: `https://apipie.ai/v1/models/detailed?model=${model}`,
        //     authentication: {
        //       type: AuthenticationType.BEARER_TOKEN,
        //       token: auth.secret_text,
        //     },
        //   });
        //   const styles =
        //     response.body?.data?.[0]?.supported_input_parameters?.style?.enum ||
        //     [];
        //   const options = styles
        //     .sort((a: string, b: string) => a.localeCompare(b))
        //     .map((s: string) => ({
        //       label: s,
        //       value: s,
        //     }));
        //   return {
        //     disabled: false,
        //     options,
        //   };
        // } catch (e) {
        //   console.error('Error fetching model styles', e);
        //   return {
        //     disabled: true,
        //     options: [
        //       {
        //         label: 'Failed to load styles',
        //         value: 'error',
        //       },
        //     ],
        //   };
        // }
      },
    }),
    prompt: Property.LongText({
      displayName: 'Prompt',
      description: 'Text description of the desired image.',
      required: true,
    }),
    numberOfImages: Property.Number({
      displayName: 'N',
      description:
        'The number of images to generate. Currently only supports one image.',
      required: false,
    }),
    size: Property.StaticDropdown({
      displayName: 'Image Size',
      description:
        'The size of the image generated. 1024x1024 is supported by all models.',
      required: false,
      options: {
        options: IMAGE_SIZES,
        disabled: false,
      },
    }),
    quality: Property.StaticDropdown({
      displayName: 'Image Quality',
      description: 'The quality of the image that will be generated.',
      required: false,
      options: {
        options: IMAGE_QUALITIES,
        disabled: false,
      },
    }),
    responseFormat: Property.StaticDropdown({
      displayName: 'Format',
      description:
        'The format in which the generated images are returned. Set to url by default.',
      required: false,
      options: {
        options: IMAGE_RESPONSE_FORMATS,
        disabled: false,
      },
    }),
    steps: Property.Number({
      displayName: 'Steps',
      description:
        'Amount of computational iterations to run. More is typically higher quality. Check specific models for compatibility.',
      required: false,
    }),
    loras: Property.ShortText({
      displayName: 'LoRa Models',
      description:
        'Augment the output with up to 3 LoRa models. Check specific models for compatibility.',
      required: false,
    }),
    strength: Property.ShortText({
      displayName: 'Strength',
      description:
        'Controls the strength of the applied effect (Range 0-1). Check specific models for compatibility.',
      required: false,
    }),
    aspectRatio: Property.StaticDropdown({
      displayName: 'Aspect Ratio',
      description: 'Aspect Ratio. Check specific models for compatibility.',
      required: false,
      options: {
        options: ASPECT_RATIO,
        disabled: false,
      },
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      numberOfImages: z.number().int().min(1).max(1).optional(),
      steps: z.number().int().min(1).optional(),
      strength: z.number().min(0).max(1).optional(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const optionalParams = omitUndefined({
      n: context.propsValue.numberOfImages,
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

    const res = await httpClient.sendRequest<promptResponse>({
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
