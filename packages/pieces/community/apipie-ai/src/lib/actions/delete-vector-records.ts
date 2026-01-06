import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { retrieveVectorIDs, retriveVectorCollections } from '../common/helper';
import { AppConnectionType } from '@activepieces/shared';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const deleteVectorRecords = createAction({
  name: 'deleteVectorRecords',
  auth: apipieAuth,
  displayName: 'Delete Vector Records',
  description:
    'Deletes specific vector records from a collection using their ids. Use "delete-vector-collection" to delete an entire vector collection.',
  props: {
    collection: Property.Dropdown({
      displayName: 'Collection Name',
      description: 'The collection to be deleted.',
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
        const collectionResponse = await retriveVectorCollections(auth.secret_text);
        return {
          options: collectionResponse.options,
          disabled: collectionResponse.disabled,
          ...(collectionResponse.placeholder && {
            placeholder: collectionResponse.placeholder,
          }),
        };
      },
    }),
    vectorIDs: Property.MultiSelectDropdown({
      displayName: 'Vector IDs',
      description: 'The IDs to be deleted.',
      required: true,
      auth: apipieAuth,
      refreshers: ['auth', 'collection'],
      options: async ({ auth, collection }) => {
        if (!auth) {
          return {
            disabled: true,
            options: [],
            placeholder: 'Please connect your account first',
          };
        }
        if (!collection) {
          return {
            disabled: true,
            options: [],
            placeholder: 'Please select a collection first',
          };
        }
        const modelResponse = await retrieveVectorIDs(String(collection), auth.secret_text);
        return {
          options: modelResponse.options,
          disabled: modelResponse.disabled,
          ...(modelResponse.placeholder && {
            placeholder: modelResponse.placeholder,
          }),
        };
      },
    })
  },
  async run(context) {
      if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
        throw new Error('API key is required');
      }
  
      const body = {
        collection_name: context.propsValue.collection,
        delete_all: false,
        ids: context.propsValue.vectorIDs,
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
