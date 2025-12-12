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