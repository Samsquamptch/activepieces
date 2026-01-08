import { createAction, Property } from '@activepieces/pieces-framework';
import { DATE_POSTED, EMPLOYMENT_TYPE, JOB_REQUIREMENTS } from '../common/constants';
import z from 'zod';
import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import { joinOrUndefined, omitUndefined } from '../common/helper';
import { AppConnectionType } from '@activepieces/shared';
import { JobSearchResponse } from '../common/interfaces';

export const jobSearch = createAction({
  name: 'jobSearch',
  displayName: 'Job Search',
  description: 'Search for jobs using JSearch API through RapidAPI.',
  props: {
    query: Property.LongText({
      displayName: 'Query',
      description:
        'Free-form jobs search query. It is highly recommended to include job title and location (e.g. "web development jobs in chicago").',
      required: true,
    }),
    page: Property.Number({
      displayName: 'Page',
      description:
        'Page to return (each page includes up to 10 results). Possible values between 1-50.',
      required: false,
    }),
    numPages: Property.Number({
      displayName: 'Number of Pages',
      description:
        'Number of pages to return, starting from page 1. Possible values between 1-50.',
      required: false,
    }),
    country: Property.ShortText({
      displayName: 'Country',
      description:
        'Country code of the country from which to return job postings. Defaults to "us".',
      required: false,
    }),
    language: Property.ShortText({
      displayName: 'Language',
      description:
        'Language code in which to return job postings. Defaults to "en".',
      required: false,
    }),
    datePosted: Property.StaticDropdown({
      displayName: 'Date Posted',
      description:
        'Find jobs posted within the time you specify.',
      required: false,
      options: {
        options: DATE_POSTED,
        disabled: false,
      },
    }),
    remote: Property.Checkbox({
      displayName: 'Remote',
      description: 'Only return remote/"work from home" jobs.',
      required: false,
      defaultValue: false,
    }),
    employmentType: Property.StaticMultiSelectDropdown({
      displayName: 'Employment Type',
      description:
        'Find jobs of particular employment types.',
      required: false,
      options: {
        options: EMPLOYMENT_TYPE,
        disabled: false,
      },
    }),
    jobRequirements: Property.StaticMultiSelectDropdown({
      displayName: 'Job Requirements',
      description:
        'Find jobs with specific requirements.',
      required: false,
      options: {
        options: JOB_REQUIREMENTS,
        disabled: false,
      },
    }),
    radius: Property.Number({
      displayName: 'Distance',
      description:
        'Return jobs within a certain distance from location (in km).',
      required: false,
    }),
    exclude: Property.Array({
      displayName: 'Exclude Job Publishers',
      description:
        'Exclude jobs published by specific publishers.',
      required: false,
    }),
    fields: Property.Array({
      displayName: 'Fields',
      description:
        'A list of job fields to include in the response. By default all fields are returned.',
      required: false,
    })
  },
  async run(context) {
    await propsValidation.validateZod(context.propsValue, {
          exclude: z.string().array().optional(),
          fields: z.string().array().optional(),
          page: z.number().int().min(1).max(50).optional(),
          numPages: z.number().int().min(1).max(50).optional(),
          radius: z.number().int().min(0).optional(),
        });

    if (!context.auth || context.auth.type !== AppConnectionType.SECRET_TEXT) {
          throw new Error('API key is required');
        }
    
    const employmentType = joinOrUndefined(context.propsValue.employmentType)
    const jobRequirements = joinOrUndefined(context.propsValue.jobRequirements)
    const excludePublisher = joinOrUndefined(context.propsValue.exclude)
    const returnFields = joinOrUndefined(context.propsValue.fields)

    const body = omitUndefined({
      query: context.propsValue.query,
      page: context.propsValue.page,
      num_pages: context.propsValue.numPages,
      country: context.propsValue.country,
      language: context.propsValue.language,
      date_posted: context.propsValue.datePosted,
      work_from_home: context.propsValue.remote,
      employment_types: employmentType,
      job_requirements: jobRequirements,
      radius: context.propsValue.radius,
      exclude_job_publishers: excludePublisher,
      fields: returnFields,
    })
    
    const res = await httpClient.sendRequest<JobSearchResponse>({
          method: HttpMethod.POST,
          url: 'https://apipie.ai/v1/data/jsearch',
          body,
          headers: {
            Authorization: context.auth.secret_text,
            Accept: 'application/json',
          },
        });

    return res.body
  },
});
