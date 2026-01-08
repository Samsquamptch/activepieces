import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { vectorCommon } from '../common/helper';
import { AppConnectionType } from '@activepieces/shared';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const deleteVectorCollection = createAction({
  name: 'deleteVectorCollection',
  auth: apipieAuth,
  displayName: 'Delete Vector Collection',
  description:
    'Deletes the entire vector collection. Use "delete-vector-record" to delete specific vectors by id.',
  props: {
    // collection: Property.Dropdown({
    //   displayName: 'Collection Name',
    //   description: 'The collection to be deleted.',
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
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = {
      collection_name: context.propsValue.collection,
      delete_all: true,
    };

    const res = await httpClient.sendRequest<string>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/vectors/delete',
      body,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body;
  },
});
