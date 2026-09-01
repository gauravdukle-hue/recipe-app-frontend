// The 22 scheduled languages of India, which is what IndicConformer covers.
// Codes are what the model expects as its second argument.
// English is deliberately absent — it is not one of the 22, and choosing a
// nearby language transcribes English phonetically into that script.
export const LANGUAGES = [
  { code: 'kok', label: 'Konkani' },
  { code: 'mr', label: 'Marathi' },
  { code: 'hi', label: 'Hindi' },
  { code: 'as', label: 'Assamese' },
  { code: 'bn', label: 'Bengali' },
  { code: 'brx', label: 'Bodo' },
  { code: 'doi', label: 'Dogri' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ks', label: 'Kashmiri' },
  { code: 'mai', label: 'Maithili' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mni', label: 'Manipuri' },
  { code: 'ne', label: 'Nepali' },
  { code: 'or', label: 'Odia' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'sa', label: 'Sanskrit' },
  { code: 'sat', label: 'Santali' },
  { code: 'sd', label: 'Sindhi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ur', label: 'Urdu' }
];

export const DEFAULT_LANGUAGE = 'kok';
