import { httpClient, HttpMethod } from '@activepieces/pieces-common'
import { AIProviderModel, AIProviderModelType, OpenRouterProviderConfig } from '@activepieces/shared'
import { AIProviderStrategy } from './ai-provider'

export const apiPieProvider: AIProviderStrategy<OpenRouterProviderConfig> = {
    name: 'APIpie.ai',
    async listModels(config: OpenRouterProviderConfig): Promise<AIProviderModel[]> {
        const res = await httpClient.sendRequest<{ data: ApipieModel[] }>({
            url: 'https://apipie.ai/v1/models',
            method: HttpMethod.GET,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
        })

        const { data } = res.body

        const uniqueModels = new Map()
        data.map((retrievedModel: ApipieModel) => {
            if (!uniqueModels.has(retrievedModel.id) && (retrievedModel.subtype.includes('text-to-image') || retrievedModel.type.includes('llm'))) {
                uniqueModels.set(retrievedModel.id, {
                    model: retrievedModel.model,
                    subtype: retrievedModel.subtype,
                })
            }
        })
        return Array.from(uniqueModels.entries())
            .map(([id, info]) => ({
                id,
                name: info.model,
                type: info.subtype.includes('text-to-image') ? AIProviderModelType.IMAGE : AIProviderModelType.TEXT,
            }))
            .sort((a, b) => a.id.localeCompare(b.id))
    },
}

type ApipieModel = {
    id: string
    model: string
    subtype: string
    type: string
}