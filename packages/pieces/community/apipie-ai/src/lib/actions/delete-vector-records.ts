import { apipieAuth } from '../..';
import { createAction } from '@activepieces/pieces-framework';
import { vectorCommon } from '../common/common';
import { AppConnectionType } from '@activepieces/shared';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const deleteVectorRecords = createAction({
  name: 'deleteVectorRecords',
  auth: apipieAuth,
  displayName: 'Delete Vector Records',
  description:
    'Deletes specific vector records from a collection using their ids. Use "delete-vector-collection" to delete an entire vector collection.',
  props: {
    collection: vectorCommon.collection,
    vectorIDs: vectorCommon.vectorIDs,
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
