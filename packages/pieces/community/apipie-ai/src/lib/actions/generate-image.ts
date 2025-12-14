import { createAction, Property } from '@activepieces/pieces-framework';

export const generateImage = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'generateImage',
  displayName: 'generate image',
  description: 'generates an image based on the provided prompt and parameters',
  props: {},
  async run() {
    // Action logic here
  },
});
