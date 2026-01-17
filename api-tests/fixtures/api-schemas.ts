import { expect } from '@playwright/test';

export const personSchema = {
  type: 'object',
  required: [
    'name', 'height', 'mass', 'hair_color', 'skin_color',
    'eye_color', 'birth_year', 'gender', 'homeworld',
    'films', 'species', 'vehicles', 'starships',
    'created', 'edited', 'url'
  ],
  properties: {
    name: { type: 'string' },
    height: { type: 'string' },
    mass: { type: 'string' },
    hair_color: { type: 'string' },
    skin_color: { type: 'string' },
    eye_color: { type: 'string' },
    birth_year: { type: 'string' },
    gender: { type: 'string', enum: ['male', 'female', 'n/a'] },
    homeworld: { type: 'string', pattern: '^https://swapi.dev/api/planets/\\d+/$' },
    films: { 
      type: 'array', 
      items: { type: 'string', pattern: '^https://swapi.dev/api/films/\\d+/$' } 
    },
    species: { 
      type: 'array', 
      items: { type: 'string', pattern: '^https://swapi.dev/api/species/\\d+/$' } 
    },
    vehicles: { 
      type: 'array', 
      items: { type: 'string', pattern: '^https://swapi.dev/api/vehicles/\\d+/$' } 
    },
    starships: { 
      type: 'array', 
      items: { type: 'string', pattern: '^https://swapi.dev/api/starships/\\d+/$' } 
    },
    created: { type: 'string', format: 'date-time' },
    edited: { type: 'string', format: 'date-time' },
    url: { type: 'string', pattern: '^https://swapi.dev/api/people/\\d+/$' }
  }
};

export function validatePersonSchema(person: any): void {
  // Check required fields
  personSchema.required.forEach(field => {
    expect(person, `Missing required field: ${field}`).toHaveProperty(field);
  });
  
  // Check gender
  expect(personSchema.properties.gender.enum, `Invalid gender: ${person.gender}`)
    .toContain(person.gender.toLowerCase());
  
  // Check URL patterns
  expect(person.homeworld, `Invalid homeworld URL: ${person.homeworld}`)
    .toMatch(personSchema.properties.homeworld.pattern);
  
  expect(person.url, `Invalid person URL: ${person.url}`)
    .toMatch(personSchema.properties.url.pattern);
  
  // Check array items
  ['films', 'species', 'vehicles', 'starships'].forEach(field => {
    if (person[field].length > 0) {
      person[field].forEach((url: string) => {
        expect(url).toMatch(personSchema.properties[field].items.pattern);
      });
    }
  });
  
  // Check date format
  expect(new Date(person.created).toString(), `Invalid created date: ${person.created}`)
    .not.toBe('Invalid Date');
  
  expect(new Date(person.edited).toString(), `Invalid edited date: ${person.edited}`)
    .not.toBe('Invalid Date');
}