import { createAction, Property } from '@activepieces/pieces-framework';
import { chatCommon, omitUndefined } from '../common/common';
import { AppConnectionType } from '@activepieces/shared';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { CompletionResponse } from '../common/interfaces';

export const chatRagTune = createAction({
  name: 'chatRagTune',
  displayName: 'Chat RAG Tune',
  description:
    'Send a chat to a selected LLM model using data stored in a RAG tune collection.',
  props: {
    model: chatCommon.model,
    userMessage: chatCommon.userMessage,
    ragTune: Property.ShortText({
      displayName: 'RAG Tune Collection',
      description: 'The RAG Tune collection for the model to use.',
      required: true,
    }),
    systemInstructions: chatCommon.systemInstructions,
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const messages = [
      omitUndefined({
        role: 'system',
        content: context.propsValue.systemInstructions,
      }),
      {
        role: 'user',
        content: context.propsValue.userMessage,
      },
    ].filter((msg) => msg.content !== undefined);

    const body = {
      model: context.propsValue.model,
      messages,
      rag_tune: context.propsValue.ragTune,
    };

    const res = await httpClient.sendRequest<CompletionResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/chat/completions',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body.choices;
  },
});
