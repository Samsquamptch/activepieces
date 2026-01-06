import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import {
  disabledState,
  omitUndefined,
  retrievedModels,
  retrieveVoices,
} from '../common/helper';
import { AUDIO_RESPONSE_FORMATS } from '../common/constants';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import z from 'zod';

export const textToSpeech = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'textToSpeech',
  auth: apipieAuth,
  displayName: 'Text To Speech',
  description: 'Generates audio from the input text.',
  props: {
    model: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the LLM model to use for completions.',
      required: true,
      auth: apipieAuth,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledState('Please connect your account first');
        const modelResponse = await retrievedModels(
          'subtype=text-to-speech',
          auth.secret_text
        );
        return {
          options: modelResponse.options,
          disabled: modelResponse.disabled,
          ...(modelResponse.placeholder && {
            placeholder: modelResponse.placeholder,
          }),
        };
      },
    }),
    voice: Property.Dropdown({
      displayName: 'Voice',
      description: 'The voice you wish to use for the model.',
      required: true,
      auth: apipieAuth,
      refreshers: ['auth', 'model'],
      options: async ({ auth, model }) => {
        if (!auth) return disabledState('Please connect your account first');
        if (!model) return disabledState('Please select a model first');
        return retrieveVoices(model as string, auth.secret_text);
      },
    }),
    input: Property.LongText({
      displayName: 'Input',
      description:
        'Text input to be converted into speech. Example: "why is the sky blue?"',
      required: true,
    }),
    fileName: Property.ShortText({
      displayName: 'File name',
      description:
        'The name of the returned audio file. Do not add the format (e.g. ".mp3") as this is determined by the Format field',
      required: true,
    }),
    responseFormat: Property.StaticDropdown({
      displayName: 'Format',
      description:
        'The audio format of the response (e.g., MP3, Opus) defaults MP3, openai recommends WAV or PCM for faster response times.',
      required: true,
      options: {
        options: AUDIO_RESPONSE_FORMATS,
        disabled: false,
      },
    }),
    stability: Property.Number({
      displayName: 'Stability',
      description:
        'Stability of the voice modulation. Possible values between 0-1.',
      required: false,
    }),
    similarityBoost: Property.Number({
      displayName: 'Similarity Boost',
      description:
        'Boost the similarity of the voice modulation. Possible values between 0-1.',
      required: false,
    }),
    style: Property.Number({
      displayName: 'Style',
      description:
        'Style of the voice modulation. Possible values between 0-1.',
      required: false,
    }),
    speakerBoost: Property.Checkbox({
      displayName: 'Speaker Boost',
      description: 'Whether to use speaker boost.',
      required: false,
    }),
    speed: Property.Number({
      displayName: 'Speed',
      description:
        'Speed of the speech playback (openai). Possible values between 0.25-4.',
      required: false,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      stability: z.number().min(0).max(1).optional(),
      similarityBoost: z.number().min(0).max(1).optional(),
      style: z.number().min(0).max(1).optional(),
      speed: z.number().min(0.25).max(4).optional(),
    });

    if (!context.auth) {
      throw new Error('API key is required');
    }

    const [modelId, providerId] = context.propsValue.model.split('|');

    const voiceSettings = omitUndefined({
      stability: context.propsValue.stability,
      similarity_boost: context.propsValue.similarityBoost,
      style: context.propsValue.style,
      use_speaker_boost: context.propsValue.speakerBoost,
    });

    const body = omitUndefined({
      provider: providerId,
      model: modelId,
      input: context.propsValue.input,
      voice: context.propsValue.voice,
      voiceSettings:
        Object.keys(voiceSettings).length > 0 ? voiceSettings : undefined,
      responseFormat: context.propsValue.responseFormat,
      speed: context.propsValue.speed,
      stream: false,
    });

    const res = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/audio/speech',
      body,
      headers: {
        Authorization: `Bearer ${context.auth.secret_text}`,
        Accept: 'audio/mpeg',
      },
      responseType: 'arraybuffer',
    });

    const fileReference = await context.files.write({
      fileName: `${context.propsValue.fileName}.${context.propsValue.responseFormat}`,
      data: res.body,
    });

    return fileReference;
  },
});
