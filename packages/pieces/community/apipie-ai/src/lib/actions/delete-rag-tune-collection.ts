import { AppConnectionType } from '@activepieces/shared';
import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { omitUndefined } from '../common/helper';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const deleteRagTuneCollection = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'deleteRagTuneCollection',
  auth: apipieAuth,
  displayName: 'Delete RAG Tune Collection',
  description: 'Deletes a RAG Tune collection.',
  props: {
    collection: Property.ShortText({
      displayName: 'Collection Name',
      description: 'The collection to be deleted.',
      required: true,
    }),
    deleteAll: Property.Checkbox({
      displayName: 'Delete All?',
      description:
        'Enable to delete the entire collection. Disable to delete specific IDs.',
      required: false,
    }),
    ids: Property.Array({
      displayName: 'RAG Tune IDs',
      description:
        'Specific RAG Tune IDs to delete. Only works if "Delete Alls" is set to false.',
      required: true,
    }),
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const body = omitUndefined({
      collection_name: context.propsValue.collection,
      delete_all: context.propsValue.deleteAll,
      ids: context.propsValue.ids
    })

    const res = await httpClient.sendRequest<string>({
          method: HttpMethod.POST,
          url: 'https://apipie.ai/ragtune/delete',
          body,
          headers: {
            Authorization: context.auth.secret_text,
            Accept: 'application/json',
          },
        });
    
        return res.body;
  },
});
