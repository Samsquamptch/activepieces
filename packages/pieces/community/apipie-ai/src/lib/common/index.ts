export interface ApiPieModel {
  id: string;
  route: string;
  model: string;
  provider: string;
  description: string;
  type: string;
  subtype: string;
  enabled: number;
  available: number;
  max_tokens: number;
  max_response_tokens: number;
  latency: string;
  query_count: string;
  img_price: null;
  img_json: null;
  avg_cost: string;
  price_type: string;
  input_cost: string;
  output_cost: string;
}

export interface ApiPieModels {
  data: ApiPieModel[];
}

export interface voiceModels {
  data: {
    provider: string;
    model: string;
    voice_id: string;
    name: string;
    description: string;
  } []
}

export interface promptResponse {
  choices: {
    text: string;
  }[];
  model: string;
  id: string;
}

export interface BaseResponse {
  id: string;
  model: string;
}

export interface CompletionResponse extends BaseResponse {
  choices: {
    text: string;
  }[];
}

export interface EmbeddingResponse extends BaseResponse {
  data: {
    embedding: number[];
  }[];
}

type VectorRecord = {
  id: string;
  embedding: number[];
  metatag?: string;
  data: string;
};

export type GetVectorResponse = {
  namespace: string;
  vectors: Record<string, VectorRecord>;
};