import { AppConnectionType } from '@activepieces/shared';
import { apipieAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';
import FormData from 'form-data';
import { omitUndefined } from '../common/common';
import { ParseDocumentResponse } from '../common/interfaces';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const parseDocument = createAction({
  name: 'parseDocument',
  auth: apipieAuth,
  displayName: 'Parse Document',
  description:
    'Extracts metadata and/or content from supported document types using Apache Tika server. Returns text content and/or metadata.',
  props: {
    file: Property.File({
      displayName: 'File',
      description:
        'Document to Parse. Max size 5MB. Supported file types:\nPDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, RTF, ODT, ODP, ODS, EPUB, HTML & XML',
      required: true,
    }),
    metadata: Property.Checkbox({
      displayName: 'Metadata',
      description: 'Whether you wish to extract metadata from the document',
      required: false,
    }),
    content: Property.Checkbox({
      displayName: 'Content',
      description: 'Whether you wish to extract text content from the document',
      required: false,
    }),
  },
  async run(context) {
    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
      throw new Error('API key is required');
    }

    const optionalParams = omitUndefined({
      metadata: context.propsValue.metadata,
      content: context.propsValue.content,
    });

    const form = new FormData();
    const file = context.propsValue.file;

    form.append('file', file.data, {
      filename: file.filename,
    });

    Object.entries(optionalParams).forEach(([key, value]) => {
      form.append(key, String(value));
    });

    const res = await httpClient.sendRequest<ParseDocumentResponse>({
      method: HttpMethod.POST,
      url: 'https://apipie.ai/v1/parser',
      body: form,
      headers: {
        Authorization: context.auth.secret_text,
        ...form.getHeaders(),
      },
    });

    return res.body;
  },
});
