// api-tests/fixtures/api-data.ts
export const API_CONFIG = {
  BASE_URL: 'https://swapi.dev/api',
  ENDPOINTS: {
    PEOPLE: '/people/',
    PERSON: (id: number) => `/people/${id}/`
  },
  EXPECTED_PEOPLE_COUNT: 82,
  VALID_GENDERS: ['male', 'female', 'n/a'] as const,
  REQUIRED_FIELDS: [
    'name', 'height', 'mass', 'hair_color', 'skin_color',
    'eye_color', 'birth_year', 'gender', 'homeworld',
    'films', 'species', 'vehicles', 'starships',
    'created', 'edited', 'url'
  ]
} as const;

export const TEST_DATA = {
  VALID_PERSON_IDS: Array.from({ length: 82 }, (_, i) => i + 1),
  INVALID_PERSON_IDS: [0, 83, 100, -1, 999],
  BOUNDARY_IDS: [1, 82],
  RANDOM_IDS: () => Math.floor(Math.random() * 82) + 1
};