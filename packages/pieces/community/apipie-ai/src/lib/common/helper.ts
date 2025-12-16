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
  } catch (e) {
    return {
      options: [],
      disabled: true,
      placeholder: `Couldn't Load Models`,
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
      .map((s: string) => ({
        label: s,
        value: s,
      }));
    return {
      disabled: false,
      options,
    };
  } catch (e) {
    return {
      options: [],
      disabled: true,
      placeholder: `Couldn't Load Models`,
    };
  }
}
