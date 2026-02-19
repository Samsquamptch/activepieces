import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import { AppConnectionType } from '@activepieces/shared';
import FormData from 'form-data';

export const uploadFile = createAction({
  name: 'uploadFile',
  auth: apipieAuth,
  displayName: 'Upload File',
  description:
    'Uploads a file to the server and returns a URL where the uploaded file can be accessed temporarily. Max file size 5MB.',
  props: {
    file: Property.File({
      displayName: 'File',
      description: 'File to be uploaded. Supported formats: .png, .jpg, .jpeg, .svg, .gif, .bmp, .tif, .tiff, .webp',
      required: true,
    }),
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const form = new FormData();
    const file = context.propsValue.file;

    form.append('file', file.data, {
      filename: file.filename,
    });

    const res = await httpClient.sendRequest<{ url: string }>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/urlshare',
      body: form,
      headers: {
        Authorization: context.auth.secret_text,
        ...form.getHeaders(),
      },
    });

    return res.body;
  },
});
