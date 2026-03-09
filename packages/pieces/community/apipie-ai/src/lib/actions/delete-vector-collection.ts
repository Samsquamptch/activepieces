import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { vectorCommon } from '../common/common';
import { AppConnectionType } from '@activepieces/shared';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const deleteVectorCollection = createAction({
  name: 'deleteVectorCollection',
  auth: apipieAuth,
  displayName: 'Delete Vector Collection',
  description:
    'Deletes the entire vector collection. Use "delete-vector-record" to delete specific vectors by id.',
  props: {
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
