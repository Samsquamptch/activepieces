export interface ApiPieModels {
  data: {
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
  }[];
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

export interface ImageResponse extends BaseResponse {
  data: {
    text: string;
  }[];
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

export interface JobSearchResponse {
  dataResults: {
    jobs: {
      employer_name: string;
      employer_logo: string;
      job_publisher: string;
      job_id: string;
      job_employment_type: string;
      job_title: string;
      job_apply_link: string;
      job_description: string;
      job_is_remote: boolean;
      job_posted_at_timestamp: number;
      job_city: string;
      job_state: string;
      job_country: string;
      rank: number;
    }[];
  };
  general: {
    query: string;
    results_cnt: number;
    total_jobs: number;
    page: number;
    num_pages: number;
  };
}

export interface PropertySearchResponse {
  dataResults: {
    properties: {
      zpid: string;
      homeStatus: string;
      detailUrl: string;
      address: string;
      streetAddress: string;
      city: string;
      state: string;
      country: string;
      zipcode: string;
      latitude: number;
      longitude: number;
      homeType: string;
      price: number;
      currency: string;
      zestimate: number;
      rentZestimate: number;
      taxAssessedValue: number;
      lotAreaValue: number;
      lotAreaUnit: string;
      bathrooms: number;
      bedrooms: number;
      livingArea: number;
      daysOnZillow: number;
      isFeatured: boolean;
      isPreforeclosureAuction: boolean;
      timeOnZillow: number;
      isNonOwnerOccupied: boolean;
      isPremierBuilder: boolean;
      isZillowOwned: boolean;
      unit: string;
      isShowcaseListing: boolean;
      listingSubType: {
        is_FSBA: boolean;
        is_openHouse: boolean;
      };
      imgSrc: string;
      hasImage: boolean;
      brokerName: string;
      openHouse: string;
      priceChange: number;
      datePriceChanged: number;
      priceReduction: string;
      newConstructionType: string;
      is_newHome: boolean;
      rank: number;
    }[];
  };
}

export interface PropertyDetailsResponse {
  dataResults: {
    property: Record<string, unknown>;
  };
  general: {
    address: string;
    request_id: string;
    parameters: Record<string, unknown>;
  };
}


export interface VectorCollection {
  collection: string;
  provider: string;
  index: string;
};

export interface VectorIDs {
  vectors: { 
    id: string }[];
  namespace: string;
  usage: {
    readUnits: number;
  };
}