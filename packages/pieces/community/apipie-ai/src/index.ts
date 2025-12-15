
    import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
    import { listModels } from "./lib/actions/list-models";
    import { chatCompletion } from "./lib/actions/chat-completion";
    import { generateImage } from "./lib/actions/generate-image";

    export const apipieAuth = PieceAuth.SecretText({
          displayName: 'API Key',
          required: true,
          description: 'Please use **test-key** as value for API Key',
        });

    export const apipieAi = createPiece({
      displayName: "Apipie-ai",
      auth: apipieAuth,
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://cdn.activepieces.com/pieces/apipie-ai.png",
      authors: [],
      actions: [listModels, chatCompletion, generateImage],
      triggers: [],
    });
    