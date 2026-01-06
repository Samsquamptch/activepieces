import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { listModels } from './lib/actions/list-models';
import { chatCompletion } from './lib/actions/chat-completion';
import { generateImage } from './lib/actions/generate-image';
import { modifyImage } from './lib/actions/modify-image';
import { createEmbeddings } from './lib/actions/create-embeddings';
import { createVectorCollection } from './lib/actions/create-vector-collection';
import { listVectorCollections } from './lib/actions/list-vector-collections';
import { upsertVectorCollection } from './lib/actions/upsert-vector-collection';
import { deleteVectorCollection } from './lib/actions/delete-vector-collection';
import { deleteVectorRecords } from './lib/actions/delete-vector-records';
import { getVectorRecord } from './lib/actions/get-vector-record';
import { listVectorIds } from './lib/actions/list-vector-ids';
import { uploadFile } from './lib/actions/upload-file';
import { textToSpeech } from './lib/actions/text-to-speech';
import { transcribeAudio } from './lib/actions/transcribe-audio';
import { realEstateSearchCoordinates } from './lib/actions/real-estate-search-coordinates';
import { realEstateSearchLocation } from './lib/actions/real-estate-search-location';
import { realEstateSearchPolygon } from './lib/actions/real-estate-search-polygon';
import { jobSearch } from './lib/actions/job-search';
import { propertyDetails } from './lib/actions/property-details';
import { chatFunctions } from './lib/actions/chat-functions';
import { chatWebSearch } from './lib/actions/chat-web-search';
import { processDocumentRagTune } from './lib/actions/process-document-rag-tune';

export const apipieAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  required: true,
  description: 'Please use **test-key** as value for API Key',
});

export const apipieAi = createPiece({
  displayName: 'Apipie-ai',
  auth: apipieAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/apipie-ai.png',
  authors: [],
  actions: [
    listModels,
    chatCompletion,
    chatFunctions,
    chatWebSearch,
    generateImage,
    modifyImage,
    createEmbeddings,
    createVectorCollection,
    listVectorCollections,
    upsertVectorCollection,
    createVectorCollection,
    deleteVectorCollection,
    deleteVectorRecords,
    getVectorRecord,
    listVectorIds,
    uploadFile,
    textToSpeech,
    transcribeAudio,
    realEstateSearchCoordinates,
    realEstateSearchLocation,
    realEstateSearchPolygon,
    jobSearch,
    propertyDetails,
    processDocumentRagTune,
  ],
  triggers: [],
});
