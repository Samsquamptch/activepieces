import { Property, createAction } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { apipieAuth } from '../..';

export const listModels = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'listModels',
  auth: apipieAuth,
  displayName: 'list models',
  description: 'list models based on selected type',
  props: {
    modelType: Property.StaticDropdown({
    displayName: 'Type',
    description: 'Filter by type of model',
    required: false,
    options: {
      options: [
        { label: 'llm', value: 'llm' },
        { label: 'vision', value: 'vision' },
        { label: 'embedding', value: 'embedding' },
        { label: 'image', value: 'image' },
        { label: 'voice', value: 'voice' },
        { label: 'moderation', value: 'moderation' },
        { label: 'coding', value: 'coding' },
        { label: 'free', value: 'free' },
      ],
  },
}),
  modelSubtype: Property.StaticDropdown({
    displayName: 'Subtype',
    description: 'Filter by subtype of model',
    required: false,
    options: {
      options: [
        { label: 'chat', value: 'chat' },
        { label: 'fill-mask', value: 'fill-mask' },
        { label: 'question-answering', value: 'question-answering' },
        { label: 'tts', value: 'tts' },
        { label: 'stt', value: 'stt' },
        { label: 'multimodal', value: 'multimodal' },
      ],
  },
}),
  },
  async run(context) {
    const modelType = context.propsValue.modelType
    const modelSubtype = context.propsValue.modelSubtype
    let getUrl = 'https://apipie.ai/v1/models'
    if (modelType && modelSubtype) {
      getUrl = getUrl + '?type=' + modelType + '&subtype=' + modelSubtype
    } else {
      if (modelType) {
        getUrl = getUrl + '?type=' + modelType 
      }
      if (modelSubtype) {
        getUrl + '?subtype=' + modelSubtype 
      }
    }
    const res = await httpClient.sendRequest<string[]>({
      method: HttpMethod.GET,
      url: getUrl,
      headers: {
        Authorization: context.auth,
        Accept: "application/json"
      },
    });
    return res.body;
  },
});
