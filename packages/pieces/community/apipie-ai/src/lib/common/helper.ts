import {
  AuthenticationType,
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';
import { ApiPieModels, voiceModels } from '.';
import { HOME_TYPE_OPTIONS, RENT_TYPE_OPTIONS, SPACE_TYPE_OPTIONS } from './constants';

export function omitUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export function joinOrUndefined(arr?: unknown[]): string | undefined {
  return Array.isArray(arr) && arr.length
    ? arr.join(',')
    : undefined;
}

export function disabledState(placeholder: string) {
  return {
    disabled: true,
    options: [],
    placeholder,
  };
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
    // const data = await httpClient.sendRequest<ApiPieModels>(request);
    // const uniqueModels = new Map();
    // data.body.data.map((retrievedModel: { id: string; model: string }) => {
    //   if (!uniqueModels.has(retrievedModel.id)) {
    //     uniqueModels.set(retrievedModel.id, retrievedModel.model);
    //   }
    // });
    // const options = Array.from(uniqueModels.entries())
    //   .map(([value, label]) => ({
    //     label,
    //     value,
    //   }))
    //   .sort((a, b) => a.label.localeCompare(b.label));
    let options;

    if (url === 'subtype=text-to-speech') {
      options = await ttsModels(request);
    } else {
      options = await defaultModels(request);
    }
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

async function defaultModels(request: HttpRequest) {
  const data = await httpClient.sendRequest<ApiPieModels>(request);
  const uniqueModels = new Map();
  data.body.data.map((retrievedModel: { id: string; model: string }) => {
    if (!uniqueModels.has(retrievedModel.id)) {
      uniqueModels.set(retrievedModel.id, retrievedModel.model);
    }
  });
  return Array.from(uniqueModels.entries())
    .map(([value, label]) => ({
      label,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

async function ttsModels(request: HttpRequest) {
  const data = await httpClient.sendRequest<ApiPieModels>(request);
  const uniqueModels = new Map();
  data.body.data.map(
    (retrievedModel: {
      id: string;
      model: string;
      provider: string;
      route: string;
    }) => {
      if (!uniqueModels.has(retrievedModel.id)) {
        uniqueModels.set(retrievedModel.id, {
          model: retrievedModel.model,
          provider: retrievedModel.provider,
          route: retrievedModel.route,
        });
      }
    }
  );
  return Array.from(uniqueModels.entries())
    .map(([id, info]) => ({
      label: info.model,
      value: `${id}|${info.provider}|${info.route}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// export async function retrieveTTSModels(url: string, authCode: string) {
//   const request: HttpRequest = {
//     url: `https://apipie.ai/v1/models?${url}`,
//     method: HttpMethod.GET,
//     authentication: {
//       type: AuthenticationType.BEARER_TOKEN,
//       token: authCode,
//     },
//   };
//   try {
//     const data = await httpClient.sendRequest<ApiPieModels>(request);
//     const uniqueModels = new Map();
//     data.body.data.map(
//       (retrievedModel: {
//         id: string;
//         model: string;
//         provider: string;
//         route: string;
//       }) => {
//         if (!uniqueModels.has(retrievedModel.id)) {
//           uniqueModels.set(retrievedModel.id, {
//             model: retrievedModel.model,
//             provider: retrievedModel.provider,
//             route: retrievedModel.route,
//           });
//         }
//       }
//     );
//     const options = Array.from(uniqueModels.entries())
//       .map(([id, info]) => ({
//         label: info.model,
//         value: `${id}|${info.provider}|${info.route}`,
//       }))
//       .sort((a, b) => a.label.localeCompare(b.label));
//     return {
//       options: options,
//       disabled: false,
//     };
//   } catch (error) {
//     return {
//       options: [],
//       disabled: true,
//       placeholder: `Couldn't Load TTS Models:\n${error}`,
//     };
//   }
// }

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

export async function retrieveVectorIDs(collection: string, authCode: string) {
  const request: HttpRequest = {
    url: 'https://apipie.ai/vectors/list',
    body: {
      collection_name: collection,
    },
    method: HttpMethod.GET,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: authCode,
    },
  };
  try {
    const data = await httpClient.sendRequest<{ vector_ids: string[] }>(
      request
    );
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

export async function retrieveVoices(data: string, authCode: string) {
  const [, provider, route] = data.split('|');
  const request: HttpRequest = {
    url: `https://apipie.ai/models?voices&provider=${provider}&model=${route}`,
    method: HttpMethod.GET,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: authCode,
    },
  };
  try {
    const data = await httpClient.sendRequest<voiceModels>(request);

    const options = data.body.data
      .map((voice: { name: string; voice_id: string }) => ({
        label: voice.name,
        value: voice.voice_id,
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
      placeholder: `Couldn't Load Voices:\n${error}`,
    };
  }
}

export function setHomeType(homeStatus: string) {
          if (!homeStatus) {
            return {
              disabled: true,
              options: [],
              placeholder:
                'Please set the "Home Status" filter before using this option',
            };
          }
          if (homeStatus === 'FOR_SALE') {
            return {
              disabled: false,
              options: HOME_TYPE_OPTIONS,
            };
          } else if (homeStatus === 'FOR_RENT') {
            return {
              disabled: false,
              options: RENT_TYPE_OPTIONS,
            };
          } else {
            return {
              disabled: true,
              options: [],
            };
          }
}

export function setSpaceType(homeStatus: string) {
  if (!homeStatus) {
            return {
              disabled: true,
              options: [],
              placeholder:
                'Please set the "Home Status" filter before using this option',
            };
          }
          if (homeStatus === 'FOR_RENT') {
            return {
              disabled: false,
              options: SPACE_TYPE_OPTIONS,
            };
          } else {
            return {
              disabled: true,
              options: [],
            };
          }
}