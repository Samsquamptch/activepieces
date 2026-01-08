import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import {
  disabledState,
  omitUndefined,
  retrievedModels,
} from '../common/common';
import {
  httpClient,
  HttpMethod,
  propsValidation,
} from '@activepieces/pieces-common';
import FormData from 'form-data';
import z from 'zod';
import { TranscribeAudioResponse } from '../common/interfaces';
import { AppConnectionType } from '@activepieces/shared';

export const transcribeAudio = createAction({
  name: 'transcribeAudio',
  auth: apipieAuth,
  displayName: 'Transcribe Audio',
  description:
    'Transcribes audio files using OpenAI-compatible models. Supported file types: mp3, mp4, mpeg, mpga, m4a, wav, webm',
  props: {
    model: Property.Dropdown({
      displayName: 'Model',
      description: 'The ID of the Model to use for transcription.',
      required: true,
      auth: apipieAuth,
      refreshers: [],
      options: async ({ auth }) => {
        if (!auth) return disabledState('Please connect your account first');
        return retrievedModels('subtype=speech-to-text', auth.secret_text);
      },
    }),
    file: Property.File({
      displayName: 'File',
      description:
        'The audio file to be transcribed. Supported file types: mp3, mp4, mpeg, mpga, m4a, wav, webm.',
      required: true,
    }),
    prompt: Property.LongText({
      displayName: 'Prompt',
      description: 'Optional prompt to improve transcription quality.',
      required: false,
    }),
    temperature: Property.Number({
      displayName: 'Temperature',
      description: 'Sampling temperature, between 0 and 1.',
      required: false,
    }),
    language: Property.ShortText({
      displayName: 'Language',
      description: 'ISO 639-1 or 639-3 language code.',
      required: false,
    }),
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
      temperature: z.number().min(0).max(1).optional(),
    });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const optionalParams = omitUndefined({
      prompt: context.propsValue.prompt,
      temperature: context.propsValue.temperature,
      language: context.propsValue.language,
    });

    const form = new FormData();
    const file = context.propsValue.file;

    form.append('file', file.data, {
      filename: file.filename,
    });
    form.append('model', context.propsValue.model);
    form.append('response_format', 'json');

    Object.entries(optionalParams).forEach(([key, value]) => {
      form.append(key, String(value));
    });

    const res = await httpClient.sendRequest<TranscribeAudioResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/audio/transcriptions',
      body: form,
      headers: {
        Authorization: context.auth.secret_text,
        ...form.getHeaders(),
      },
    });

    return res.body;
  },
});
