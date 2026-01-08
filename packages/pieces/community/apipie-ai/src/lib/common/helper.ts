import {
  AuthenticationType,
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';
import { ApiPieModels, VectorCollection, VectorIDs, voiceModels } from '.';
import {
  ASPECT_RATIO,
  HOME_STATUS,
  HOME_TYPE_OPTIONS,
  IMAGE_QUALITIES,
  IMAGE_RESPONSE_FORMATS,
  IMAGE_SIZES,
  REAL_ESTATE_SORT,
  RENT_TYPE_OPTIONS,
  SPACE_TYPE_OPTIONS,
} from './constants';
import { Property } from '@activepieces/pieces-framework';
import { apipieAuth } from '../..';

export function omitUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value != null)
  ) as Partial<T>;
}

export function joinOrUndefined(arr?: unknown[]): string | undefined {
  return Array.isArray(arr) && arr.length ? arr.join(',') : undefined;
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
    return disabledState(`Couldn't Load Models:\n${error}`)
  }
}

// async function defaultModels(request: HttpRequest) {
//   const data = await httpClient.sendRequest<ApiPieModels>(request);
//   const uniqueModels = new Map();
//   data.body.data.map((retrievedModel: { id: string; model: string }) => {
//     if (!uniqueModels.has(retrievedModel.id)) {
//       uniqueModels.set(retrievedModel.id, retrievedModel.model);
//     }
//   });
//   return Array.from(uniqueModels.entries())
//     .map(([value, label]) => ({
//       label,
//       value,
//     }))
//     .sort((a, b) => a.label.localeCompare(b.label));
// }

// async function ttsModels(request: HttpRequest) {
//   const data = await httpClient.sendRequest<ApiPieModels>(request);
//   const uniqueModels = new Map();
//   data.body.data.map(
//     (retrievedModel: {
//       id: string;
//       model: string;
//       provider: string;
//       route: string;
//     }) => {
//       if (!uniqueModels.has(retrievedModel.id)) {
//         uniqueModels.set(retrievedModel.id, {
//           model: retrievedModel.model,
//           provider: retrievedModel.provider,
//           route: retrievedModel.route,
//         });
//       }
//     }
//   );
//   return Array.from(uniqueModels.entries())
//     .map(([id, info]) => ({
//       label: info.model,
//       value: `${id}|${info.provider}|${info.route}`,
//     }))
//     .sort((a, b) => a.label.localeCompare(b.label));
// }

// export async function retriveVectorCollections(authCode: string) {
//   const request: HttpRequest = {
//     url: `https://apipie.ai/vectors/listcollections`,
//     method: HttpMethod.POST,
//     authentication: {
//       type: AuthenticationType.BEARER_TOKEN,
//       token: authCode,
//     },
//   };
//   try {
//     const data = await httpClient.sendRequest<VectorCollection[]>(request);
//     return {
//       disabled: false,
//       options: (data.body ?? [])
//         .map((vector: { collection: string }) => ({
//           label: vector.collection,
//           value: vector.collection,
//         }))
//         .sort((a, b) => a.label.localeCompare(b.label)),
//     };
//   } catch (error) {
//     return disabledState(`Couldn't Load Collections:\n${error}`)
//   }
// }

export async function retrieveVectorIDs(collection: string, authCode: string) {
  const request: HttpRequest = {
    url: 'https://apipie.ai/vectors/list',
    body: {
      collection_name: collection,
    },
    method: HttpMethod.POST,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: authCode,
    },
  };
  try {
    const data = await httpClient.sendRequest<VectorIDs>(request);
    return {
      disabled: false,
      options: (data.body.vectors ?? [])
        .map((v) => v.id)
        .sort((a: string, b: string) => a.localeCompare(b))
        .map((vectorID: string) => ({
          label: vectorID,
          value: vectorID,
        })),
    };
  } catch (error) {
    return disabledState(`Couldn't Load Vector IDs:\n${error}`)
  }
}

// export async function retrieveEnumOptions(
//   model: string,
//   authCode: string,
//   param: 'style' | 'loras'
// ) {
//   try {
//     const response = await httpClient.sendRequest({
//       method: HttpMethod.GET,
//       url: `https://apipie.ai/v1/models/detailed?model=${model}`,
//       authentication: {
//         type: AuthenticationType.BEARER_TOKEN,
//         token: authCode,
//       },
//     });

//     const values =
//       response.body?.data?.[0]?.supported_input_parameters?.[param]?.enum;

//     if (!Array.isArray(values) || values.length === 0) {
//       return {
//         disabled: true,
//         options: [],
//         placeholder: `No ${param} associated with this model`,
//       };
//     }
//     return {
//       disabled: false,
//       options: values
//         .sort((a: string, b: string) => a.localeCompare(b))
//         .map((value: string) => ({
//           label: value,
//           value,
//         })),
//     };
//   } catch (error) {
//     return {
//       disabled: true,
//       options: [],
//       placeholder: `Couldn't Load ${param}:\n${error}`,
//     };
//   }
// }

// export async function retriveStyles(model: string, authCode: string) {
//   try {
//     const response = await httpClient.sendRequest({
//       method: HttpMethod.GET,
//       url: `https://apipie.ai/v1/models/detailed?model=${model}`,
//       authentication: {
//         type: AuthenticationType.BEARER_TOKEN,
//         token: authCode,
//       },
//     });
//     const styles =
//       response.body?.data?.[0]?.supported_input_parameters?.style?.enum || [];

//     if (!styles.length || !Array.isArray(styles)) {
//       return {
//         disabled: true,
//         options: [],
//         placeholder: 'No styles associated with this model',
//       };
//     }
//     const options = styles
//       .sort((a: string, b: string) => a.localeCompare(b))
//       .map((style: string) => ({
//         label: style,
//         value: style,
//       }));
//     return {
//       disabled: false,
//       options,
//     };
//   } catch (error) {
//     return {
//       options: [],
//       disabled: true,
//       placeholder: `Couldn't Load Styles:\n${error}`,
//     };
//   }
// }

// export async function retriveLoras(model: string, authCode: string) {
//   try {
//     const response = await httpClient.sendRequest({
//       method: HttpMethod.GET,
//       url: `https://apipie.ai/v1/models/detailed?model=${model}`,
//       authentication: {
//         type: AuthenticationType.BEARER_TOKEN,
//         token: authCode,
//       },
//     });
//     const loras =
//       response.body?.data?.[0]?.supported_input_parameters?.loras?.enum || [];

//     if (!loras.length || !Array.isArray(loras)) {
//       return {
//         disabled: true,
//         options: [],
//         placeholder: 'No loras associated with this model',
//       };
//     }
//     const options = loras
//       .sort((a: string, b: string) => a.localeCompare(b))
//       .map((lora: string) => ({
//         label: lora,
//         value: lora,
//       }));
//     return {
//       disabled: false,
//       options,
//     };
//   } catch (error) {
//     return {
//       options: [],
//       disabled: true,
//       placeholder: `Couldn't Load Loras:\n${error}`,
//     };
//   }
// }

// export async function retrieveVoices(data: string, authCode: string) {
//   const [, provider, route] = data.split('|');
//   const request: HttpRequest = {
//     url: `https://apipie.ai/v1/models?voices&provider=${provider}&model=${route}`,
//     method: HttpMethod.GET,
//     authentication: {
//       type: AuthenticationType.BEARER_TOKEN,
//       token: authCode,
//     },
//   };
//   try {
//     const response = await httpClient.sendRequest<voiceModels>(request);

//     if (!response.body || !Array.isArray(response.body.data)) return disabledState('Voices API returned no data')

//     return {
//       options: (response.body.data ?? [])
//         .map((voice: { name: string; voice_id: string }) => ({
//           label: voice.name,
//           value: voice.voice_id,
//         }))
//         .sort((a, b) => a.label.localeCompare(b.label)),
//       disabled: false,
//     };
//   } catch (error) {
//     return disabledState(`Couldn't Load Voices:\n${error}`)
//   }
// }

// export function setHomeType(homeStatus: string) {
//   if (!homeStatus) {
//     return {
//       disabled: true,
//       options: [],
//       placeholder:
//         'Please set the "Home Status" filter before using this option',
//     };
//   }
//   if (homeStatus === 'FOR_SALE') {
//     return {
//       disabled: false,
//       options: HOME_TYPE_OPTIONS,
//     };
//   } else if (homeStatus === 'FOR_RENT') {
//     return {
//       disabled: false,
//       options: RENT_TYPE_OPTIONS,
//     };
//   } else {
//     return {
//       disabled: true,
//       options: [],
//     };
//   }
// }

// export function setSpaceType(homeStatus: string) {
//   if (!homeStatus) {
//     return {
//       disabled: true,
//       options: [],
//       placeholder:
//         'Please set the "Home Status" filter before using this option',
//     };
//   }
//   if (homeStatus === 'FOR_RENT') {
//     return {
//       disabled: false,
//       options: SPACE_TYPE_OPTIONS,
//     };
//   } else {
//     return {
//       disabled: true,
//       options: [],
//     };
//   }
// }

export const chatCommon = {
  model: Property.Dropdown({
    displayName: 'Model',
    description: 'The ID of the LLM model to use for completions.',
    required: true,
    auth: apipieAuth,
    refreshers: [],
    options: async ({ auth }) => {
      if (!auth) return disabledState('Please connect your account first');
      try {
        const request: HttpRequest = {
          url: `https://apipie.ai/v1/models?type=llm`,
          method: HttpMethod.GET,
          headers: {
            Authorization: auth.secret_text,
            Accept: 'application/json',
          },
        };
        const data = await httpClient.sendRequest<ApiPieModels>(request);
        const uniqueModels = new Map();
        data.body.data.map((retrievedModel: { id: string; model: string }) => {
          if (!uniqueModels.has(retrievedModel.id)) {
            uniqueModels.set(retrievedModel.id, retrievedModel.model);
          }
        });
        const options = await Array.from(uniqueModels.entries())
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
        return disabledState(`Couldn't Load Models:\n${error}`)
      }
    },
  }),
  userMessage: Property.LongText({
    displayName: 'User Message',
    required: true,
    description:
      "The content of the message sent to the model with the user role. For example: 'Why is the sky blue?'",
  }),
  systemInstructions: Property.LongText({
    displayName: 'System Instructions',
    required: false,
    description:
      "Instructions to give for the system role. For example 'You are a helpful assistant that speaks only in Swedish.'",
  }),
};

export const imageCommon = {
  prompt: Property.LongText({
    displayName: 'Prompt',
    description: 'Text description of the desired image.',
    required: true,
  }),
  styles: Property.Dropdown({
    displayName: 'Styles',
    description: 'The style to use when generating the image',
    required: false,
    auth: apipieAuth,
    refreshers: ['auth', 'model'],
    options: async ({ auth, model }) => {
      if (!auth) return disabledState('Please connect your account first');
      if (!model) return disabledState('Please select a model first');
      try {
        const response = await httpClient.sendRequest({
          method: HttpMethod.GET,
          url: `https://apipie.ai/v1/models/detailed?model=${model}`,
          headers: {
            Authorization: auth.secret_text,
            Accept: 'application/json',
          },
        });

        const values =
          response.body?.data?.[0]?.supported_input_parameters?.style?.enum;

        if (!Array.isArray(values) || values.length === 0) {
          return disabledState('No style associated with this model')
        }
        return {
          disabled: false,
          options: values
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((value: string) => ({
              label: value,
              value,
            })),
        };
      } catch (error) {
        return disabledState(`Couldn't Load styles:\n${error}`)
      }
    },
  }),
  size: Property.StaticDropdown({
    displayName: 'Image Size',
    description:
      'The size of the image generated. 1024x1024 is supported by all models.',
    required: false,
    options: {
      options: IMAGE_SIZES,
      disabled: false,
    },
  }),
  quality: Property.StaticDropdown({
    displayName: 'Image Quality',
    description: 'The quality of the image that will be generated.',
    required: false,
    options: {
      options: IMAGE_QUALITIES,
      disabled: false,
    },
  }),
  responseFormat: Property.StaticDropdown({
    displayName: 'Format',
    description:
      'The format in which the generated images are returned. Set to url by default.',
    required: false,
    options: {
      options: IMAGE_RESPONSE_FORMATS,
      disabled: false,
    },
  }),
  steps: Property.Number({
    displayName: 'Steps',
    description:
      'Amount of computational iterations to run. More is typically higher quality. Check specific models for compatibility.',
    required: false,
  }),
  loras: Property.MultiSelectDropdown({
    displayName: 'LoRa Models',
    description:
      'Augment the output with up to 3 LoRa models. Check specific models for compatibility.',
    required: false,
    auth: apipieAuth,
    refreshers: ['auth', 'model'],
    options: async ({ auth, model }) => {
      if (!auth) return disabledState('Please connect your account first');
      if (!model) return disabledState('Please select a model first');
      try {
        const response = await httpClient.sendRequest({
          method: HttpMethod.GET,
          url: `https://apipie.ai/v1/models/detailed?model=${model}`,
          headers: {
            Authorization: auth.secret_text,
            Accept: 'application/json',
          },
        });
        const loras =
          response.body?.data?.[0]?.supported_input_parameters?.loras?.enum ||
          [];

        if (!loras.length || !Array.isArray(loras)) {
          return disabledState('No loras associated with this model')
        }
        const options = loras
          .sort((a: string, b: string) => a.localeCompare(b))
          .map((lora: string) => ({
            label: lora,
            value: lora,
          }));
        return {
          disabled: false,
          options,
        };
      } catch (error) {
        return disabledState(`Couldn't Load Loras:\n${error}`)
      }
    },
  }),
  strength: Property.ShortText({
    displayName: 'Strength',
    description:
      'Controls the strength of the applied effect (Range 0-1). Check specific models for compatibility.',
    required: false,
  }),
  aspectRatio: Property.StaticDropdown({
    displayName: 'Aspect Ratio',
    description: 'Aspect Ratio. Check specific models for compatibility.',
    required: false,
    options: {
      options: ASPECT_RATIO,
      disabled: false,
    },
  }),
};

export const vectorCommon = {
  collection: Property.Dropdown({
    displayName: 'Collection Name',
    description: 'The vector collection you wish to select.',
    required: true,
    auth: apipieAuth,
    refreshers: ['auth'],
    options: async ({ auth }) => {
      if (!auth) return disabledState('Please connect your account first');
      const request: HttpRequest = {
        url: `https://apipie.ai/vectors/listcollections`,
        method: HttpMethod.POST,
        headers: {
          Authorization: auth.secret_text,
          Accept: 'application/json',
        },
      };
      try {
        const data = await httpClient.sendRequest<VectorCollection[]>(request);
        if (!data.body || !Array.isArray(data.body)) {
          return disabledState(
            'No vector collections associated with this account.'
          );
        }
        return {
          disabled: false,
          options: data.body
            .map((vector: { collection: string }) => ({
              label: vector.collection,
              value: vector.collection,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        };
      } catch (error) {
        return disabledState(`Couldn't Load Collections:\n${error}`);
      }
    },
  }),
  vectorIDs: Property.MultiSelectDropdown({
    displayName: 'Vector IDs',
    description: 'The IDs of the vectors from the collection.',
    required: true,
    auth: apipieAuth,
    refreshers: ['auth', 'collection'],
    options: async ({ auth, collection }) => {
      try {
        if (!auth) return disabledState('Please connect your account first');
        if (!collection)
          return disabledState('Please select a collection first');
        const request: HttpRequest = {
          url: 'https://apipie.ai/vectors/list',
          body: {
            collection_name: collection,
          },
          method: HttpMethod.POST,
          headers: {
            Authorization: auth.secret_text,
            Accept: 'application/json',
          },
        };
        const data = await httpClient.sendRequest<VectorIDs>(request);
        if (!data.body || !Array.isArray(data.body.vectors)) {
          return disabledState(
            'No vector ids associated with this collection.'
          );
        }
        return {
          disabled: false,
          options: data.body.vectors
            .map((v) => v.id)
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((vectorID: string) => ({
              label: vectorID,
              value: vectorID,
            })),
        };
      } catch (error) {
        return disabledState(`Couldn't Load Vector IDs:\n${error}`);
      }
    },
  }),
};

export const propertyCommon = {
  page: Property.Number({
    displayName: 'Page',
    description: 'Page to return (each page includes up to 41 results)',
    required: false,
  }),
  homeStatus: Property.StaticDropdown({
    displayName: 'Home Status',
    description: 'Filters properties based on their status',
    required: false,
    options: {
      options: HOME_STATUS,
    },
  }),
  homeType: Property.MultiSelectDropdown({
    displayName: 'Home Type',
    description:
      'Find properties with specified home type (works for "For Sale" option in Home Status).',
    required: false,
    auth: apipieAuth,
    refreshers: ['homeStatus'],
    options: async ({ auth, homeStatus }) => {
      if (!auth) return disabledState('Please connect your account first');
      if (!homeStatus)
        return disabledState(
          'Please set the "Home Status" filter before using this option'
        );
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
      } else return disabledState('No options available');
    },
  }),
  spaceType: Property.MultiSelectDropdown({
    displayName: 'Space Type',
    description:
      'Find properties with specified rental type (works for "For Rent" option in Home Status).',
    required: false,
    auth: apipieAuth,
    refreshers: ['homeStatus'],
    options: async ({ auth, homeStatus }) => {
      if (!auth) return disabledState('Please connect your account first');
      if (!homeStatus)
        return disabledState(
          'Please set the "Home Status" filter before using this option'
        );
      if (homeStatus === 'FOR_RENT') {
        return {
          disabled: false,
          options: SPACE_TYPE_OPTIONS,
        };
      } else return disabledState('No options available');
    },
  }),
  sort: Property.StaticDropdown({
    displayName: 'Sort Order',
    description: 'Return results in a specific order',
    required: false,
    options: {
      options: REAL_ESTATE_SORT,
    },
  }),
  minPrice: Property.Number({
    displayName: 'Min Price',
    required: false,
  }),
  maxPrice: Property.Number({
    displayName: 'Max Price',
    required: false,
  }),
  minMonthlyPayment: Property.Number({
    displayName: 'Min Monthly Payment',
    required: false,
  }),
  maxMonthlyPayment: Property.Number({
    displayName: 'Max Monthly Payment',
    required: false,
  }),
  minBedrooms: Property.Number({
    displayName: 'Min Bedrooms',
    required: false,
  }),
  maxBedrooms: Property.Number({
    displayName: 'Max Bedrooms',
    required: false,
  }),
  minBathrooms: Property.Number({
    displayName: 'Min Bathrooms',
    required: false,
  }),
  maxBathrooms: Property.Number({
    displayName: 'Max Bathrooms',
    required: false,
  }),
  minSqft: Property.Number({
    displayName: 'Min Square Feet',
    required: false,
  }),
  maxSqft: Property.Number({
    displayName: 'Max Square Feet',
    required: false,
  }),
  minLotSize: Property.Number({
    displayName: 'Min Lot Size (sqft)',
    required: false,
  }),
  maxLotSize: Property.Number({
    displayName: 'Max Lot Size (sqft)',
    required: false,
  }),
  listingType: Property.StaticDropdown({
    displayName: 'Listing Type',
    required: false,
    defaultValue: 'BY_AGENT',
    options: {
      options: [
        { label: 'By Agent', value: 'BY_AGENT' },
        { label: 'By Owner / Other', value: 'BY_OWNER_OTHER' },
      ],
    },
  }),
  saleByAgent: Property.Checkbox({
    displayName: 'For Sale by Agent',
    required: false,
    defaultValue: true,
  }),
  saleByOwner: Property.Checkbox({
    displayName: 'For Sale by Owner',
    required: false,
    defaultValue: true,
  }),
  isNewConstruction: Property.Checkbox({
    displayName: 'New Construction',
    required: false,
    defaultValue: true,
  }),
  isForeclosure: Property.Checkbox({
    displayName: 'Foreclosure',
    description: 'Filters for properties that are foreclosures',
    required: false,
    defaultValue: true,
  }),
  isAuction: Property.Checkbox({
    displayName: 'Auction',
    required: false,
    defaultValue: true,
  }),
  wasForeclosed: Property.Checkbox({
    displayName: 'Previously Foreclosed',
    required: false,
    defaultValue: false,
  }),
  isPreforeclosure: Property.Checkbox({
    displayName: 'Pre-Foreclosure',
    required: false,
    defaultValue: false,
  }),
  maxHoaFee: Property.Number({
    displayName: 'Max HOA Fee',
    required: false,
  }),
  noHoaData: Property.Checkbox({
    displayName: 'Include Homes Without HOA Data',
    required: false,
    defaultValue: true,
  }),
};
