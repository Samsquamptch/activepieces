export const EFFORT_OPTIONS = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

export const AUDIO_RESPONSE_FORMATS = [
  { label: 'MP3', value: 'mp3' },
  { label: 'Opus', value: 'opus' },
  { label: 'AAC', value: 'aac' },
  { label: 'FLAC', value: 'flac' },
  { label: 'WAV', value: 'wav' },
  { label: 'PCM', value: 'pcm' },
];

export const IMAGE_RESPONSE_FORMATS = [
  { label: 'URL', value: 'url' },
  { label: 'Base64 JSON', value: 'b64_json' },
];

export const IMAGE_QUALITIES = [
  { label: 'Standard', value: 'standard' },
  { label: 'HD', value: 'hd' },
];

export const IMAGE_STYLES = [
  { label: 'Natural', value: 'natural' },
  { label: 'Vivid', value: 'vivid' },
];

export const IMAGE_SIZES = [
  { label: '256x256', value: '256x256' },
  { label: '512x512', value: '512x512' },
  { label: '1024x1024', value: '1024x1024' },
  { label: '1792x1024', value: '1792x1024' },
  { label: '1024x1792', value: '1024x1792' },
];

export const TOOL_TYPES = [
  { label: 'Code Interpreter', value: 'code_interpreter' },
  { label: 'File Search', value: 'file_search' },
  { label: 'Function', value: 'function' },
];

export const ASPECT_RATIO = [
  { label: '9:21', value: '9:21' },
  { label: '21:9', value: '21:9' },
];

export const VECTOR_PROVIDER = [
  { label: 'Pinecone', value: 'pinecone' },
  { label: 'Qdrant', value: 'qdrant' },
];

export const DATE_POSTED = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: '3 Days', value: '3days' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]

export const EMPLOYMENT_TYPE = [
  { label: 'Fulltime', value: 'FULLTIME' },
  { label: 'Contractor', value: 'CONTRACTOR' },
  { label: 'Parttime', value: 'PARTTIME' },
  { label: 'Intern', value: 'INTERN' },
]

export const JOB_REQUIREMENTS = [
  { label: 'Under 3 Years Experience', value: 'under_3_years_experience' },
  { label: 'More Than 3 Years Experience', value: 'more_than_3_years_experience' },
  { label: 'No Experience', value: 'no_experience' },
  { label: 'No Degree', value: 'no_degree' },
]
