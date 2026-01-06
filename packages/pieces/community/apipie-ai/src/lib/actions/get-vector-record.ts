import { apipieAuth } from '../../index';
import { createAction, Property } from '@activepieces/pieces-framework';
import { retrieveVectorIDs, retriveVectorCollections } from '../common/helper';
import { AppConnectionType } from '@activepieces/shared';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { GetVectorResponse } from '../common';

export const getVectorRecord = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getVectorRecord',
  auth: apipieAuth,
  displayName: 'Get Vector Record',
  description:
    'Fetch the content of a specific record in a selected vector collection by ID.',
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
        const collectionResponse = await retriveVectorCollections(
          auth.secret_text
        );
        return {
          options: collectionResponse.options,
          disabled: collectionResponse.disabled,
          ...(collectionResponse.placeholder && {
            placeholder: collectionResponse.placeholder,
          }),
        };
      },
    }),
    vectorIDs: Property.Dropdown({
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
        const modelResponse = await retrieveVectorIDs(
          String(collection),
          auth.secret_text
        );
        return {
          options: modelResponse.options,
          disabled: modelResponse.disabled,
          ...(modelResponse.placeholder && {
            placeholder: modelResponse.placeholder,
          }),
        };
      },
    }),
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const vectorCollection = context.propsValue.collection;
    const vectorID = context.propsValue.vectorIDs;

    const url = `https://apipie.ai/vectors/fetch?collection_name=${vectorCollection}&${vectorID}`;

    const res = await httpClient.sendRequest<GetVectorResponse>({
      method: HttpMethod.GET,
      url,
      headers: {
        Authorization: context.auth.secret_text,
        Accept: 'application/json',
      },
    });

    return res.body.vectors[vectorID];
  },
});
