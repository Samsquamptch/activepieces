import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { vectorCommon } from '../common/common';
import { AppConnectionType } from '@activepieces/shared';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const processDocumentRagTune = createAction({
  name: 'processDocumentRagTune',
  auth: apipieAuth,
  displayName: 'Process Document RAG Tune',
  description:
    'Processes a document by extracting its content and generating embeddings to be used for RAG tuning. Supported file types: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX.',
  props: {
    // collection: Property.Dropdown({
    //   displayName: 'Collection Name',
    //   description:
    //     'The collection you wish to add the document to. If you wish to make a new collection, please use the "Create Vector Collection" action.',
    //   required: true,
    //   auth: apipieAuth,
    //   refreshers: ['auth'],
    //   options: async ({ auth }) => {
    //     if (!auth) {
    //       return {
    //         disabled: true,
    //         options: [],
    //         placeholder: 'Please connect your account first',
    //       };
    //     }
    //     const modelResponse = await retriveVectorCollections(auth.secret_text);
    //     return {
    //       options: modelResponse.options,
    //       disabled: modelResponse.disabled,
    //       ...(modelResponse.placeholder && {
    //         placeholder: modelResponse.placeholder,
    //       }),
    //     };
    //   },
    // }),
    collection: vectorCommon.collection,
    url: Property.ShortText({
      displayName: 'User Message',
      required: true,
      description:
        'URL of the document to process. Supported file types: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX',
    }),
    metaTag: Property.ShortText({
      displayName: 'Meta Tag',
      description: 'The Meta Tag associated with the vector.',
      required: true,
    }),
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = {
      collection_name: context.propsValue.collection,
      url: context.propsValue.url,
      metatag: context.propsValue.metaTag,
      vector_provider: "qdrant"
    };

    const res = await httpClient.sendRequest<string>({
      method: HttpMethod.POST,
      url: 'https://dev.apipie.ai/ragtune',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
