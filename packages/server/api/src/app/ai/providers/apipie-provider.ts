import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import {
  AIProviderModel,
  AIProviderModelType,
  ApiPieProviderConfig,
  ApiPieProviderAuthConfig,
} from '@activepieces/shared';
import { AIProviderStrategy } from './ai-provider';

export const apiPieProvider: AIProviderStrategy<
  ApiPieProviderAuthConfig,
  ApiPieProviderConfig
> = {
  name: 'APIpie.ai',
  async listModels(
    _authConfig: ApiPieProviderAuthConfig,
    _config: ApiPieProviderConfig
  ): Promise<AIProviderModel[]> {
    const res = await httpClient.sendRequest<{ data: ApipieModel[] }>({
      url: 'https://apipie.ai/v1/models',
      method: HttpMethod.GET,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { data } = res.body;

    const uniqueModels = new Map();
    data.forEach((retrievedModel) => {
      const subtype = retrievedModel.subtype ?? '';
      const type = retrievedModel.type ?? '';

      if (
        !uniqueModels.has(retrievedModel.id) &&
        (subtype.includes('text-to-image') || type.includes('llm'))
      ) {
        uniqueModels.set(retrievedModel.id, {
          model: retrievedModel.model,
          subtype,
        });
      }
    });
    return Array.from(uniqueModels.entries())
      .map(([id, info]) => ({
        id,
        name: info.model,
        type: info.subtype.includes('text-to-image')
          ? AIProviderModelType.IMAGE
          : AIProviderModelType.TEXT,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  },
};

type ApipieModel = {
  id: string;
  model: string;
  subtype?: string | null;
  type?: string | null;
};
