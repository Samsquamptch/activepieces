import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import {
  disabledState,
  omitUndefined,
  retrievedModels,
} from '../common/common';
import { AUDIO_RESPONSE_FORMATS } from '../common/constants';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import z from 'zod';
import { ApiPieModels, voiceModels } from '../common/interfaces';

export const textToSpeech = createAction({
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
        // return retrievedModels(
        //   'subtype=text-to-speech',
        //   auth.secret_text
        // );
        try {
          const data = await httpClient.sendRequest<ApiPieModels>({
            url: `https://apipie.ai/v1/models?subtype=text-to-speech`,
            method: HttpMethod.GET,
            headers: {
              Authorization: auth.secret_text,
              Accept: 'application/json',
            },
          });
          const uniqueModels = new Map();
          data.body.data.map(
            (retrievedModel: {
              id: string;
              model: string;
              provider: string;
              route: string;
            }) => {
              if (!uniqueModels.has(retrievedModel.id)) {
                uniqueModels.set(retrievedModel.id, {
                  model: retrievedModel.model,
                  provider: retrievedModel.provider,
                  route: retrievedModel.route,
                });
              }
            }
          );
          const options = Array.from(uniqueModels.entries())
            .map(([id, info]) => ({
              label: info.model,
              value: `${id}|${info.provider}|${info.route}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          return {
            options: options,
            disabled: false,
          };
        } catch (error) {
          return disabledState(`Couldn't Load Models:\n${error}`)
        }
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
        const [, provider, route] = (model as string).split('|');
        try {
          const response = await httpClient.sendRequest<voiceModels>({
            method: HttpMethod.GET,
            url: `https://apipie.ai/v1/models?voices&provider=${provider}&model=${route}`,
            headers: {
              Authorization: auth.secret_text,
              Accept: 'application/json',
            },
          });

          if (!response.body || !Array.isArray(response.body.data))
            return disabledState('Voices API returned no data');

          return {
            options: response.body.data
              .map((voice: { name: string; voice_id: string }) => ({
                label: voice.name,
                value: voice.voice_id,
              }))
              .sort((a, b) => a.label.localeCompare(b.label)),
            disabled: false,
          };
        } catch (error) {
          return disabledState(`Couldn't Load Voices:\n${error}`);
        }
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
