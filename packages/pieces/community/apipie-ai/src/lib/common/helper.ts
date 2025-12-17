import {
  AuthenticationType,
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';
import { ApiPieModels } from '.';

export function omitUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export async function retrievedModels(url: string, authCode: string) {
  const request: HttpRequest = {
    url: `https://apipie.ai/v1/models?${url}`,
    method: HttpMethod.GET,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: authCode,
    },
  };
  try {
    const data = await httpClient.sendRequest<ApiPieModels>(request);
    const uniqueModels = new Map();
    data.body.data.map((retrievedModel: { id: string; model: string }) => {
      if (!uniqueModels.has(retrievedModel.id)) {
        uniqueModels.set(retrievedModel.id, retrievedModel.model);
      }
    });
    const options = Array.from(uniqueModels.entries())
      .map(([value, label]) => ({
        label,
        value,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return {
      options: options,
      disabled: false,
    };
  } catch (error) {
    return {
      options: [],
      disabled: true,
      placeholder: `Couldn't Load Models:\n${error}`,
    };
  }
}

export async function retriveVectorCollections(authCode: string) {
  const request: HttpRequest = {
    url: `https://apipie.ai/vectors/listcollections`,
    method: HttpMethod.GET,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: authCode,
    },
  };
  try {
    const data = await httpClient.sendRequest<string[]>(request);
    return {
      disabled: false,
      options: (data.body ?? [])
        .sort((a: string, b: string) => a.localeCompare(b))
        .map((collection: string) => ({
          label: collection,
          value: collection,
        })),
    };
  } catch (error) {
    return {
      options: [],
      disabled: true,
      placeholder: `Couldn't Load Collections:\n${error}`,
    };
  }
}

export async function retrieveVectorIDs(authCode: string) {
  const request: HttpRequest = {
    url: 'https://apipie.ai/vectors/list',
    method: HttpMethod.GET,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: authCode,
    },
  };
  try {
    const data = await httpClient.sendRequest<{ vector_ids: string[] }>(request);
    return {
      disabled: false,
      options: (data.body.vector_ids ?? [])
        .sort((a: string, b: string) => a.localeCompare(b))
        .map((vectorID: string) => ({
          label: vectorID,
          value: vectorID,
        })),
    };
  } catch (error) {
    return {
      options: [],
      disabled: true,
      placeholder: `Couldn't Load Vector IDs:\n${error}`,
    };
  }
}

export async function retriveStyles(url: string, authCode: string) {
  try {
    const response = await httpClient.sendRequest({
      method: HttpMethod.GET,
      url,
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: authCode,
      },
    });
    const styles =
      response.body?.data?.[0]?.supported_input_parameters?.style?.enum || [];
    const options = styles
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((style: string) => ({
        label: style,
        value: style,
      }));
    return {
      disabled: false,
      options,
    };
  } catch (error) {
    return {
      options: [],
      disabled: true,
      placeholder: `Couldn't Load Styles:\n${error}`,
    };
  }
}
