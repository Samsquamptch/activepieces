import { createAction, Property } from '@activepieces/pieces-framework';

export const createEmbeddings = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'createEmbeddings',
  displayName: 'create embeddings',
  description: 'Generate embeddings for the given input text using the specified model.',
  props: {},
  async run() {
    // Action logic here
  },
});
