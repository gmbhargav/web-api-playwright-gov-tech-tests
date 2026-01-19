import { test, expect, request } from '@playwright/test';

test.describe('SWAPI Minimal API Tests', () => {
  let apiContext: any;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: 'https://swapi.dev/api',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Get list of people returns 82 characters', async () => {
    const response = await apiContext.get('https://swapi.dev/api/people/');
    console.log(`Response Status: ${response.status()} ${response.statusText()}`);
    console.log(`Response: ${JSON.stringify(await response.json(), null, 2)}`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.count).toBe(82);
    expect(data.results.length).toBe(10);
    
    // Check each person in first page
    for (const person of data.results) {
      expect(person.name).toBeTruthy();
      expect(person.url).toMatch(/^https:\/\/swapi.dev\/api\/people\/\d+\/$/);
      expect(['male', 'female', 'n/a']).toContain(person.gender.toLowerCase());
    }
  });

  test('Get individual person by ID', async () => {
    // Test first 5 people
    for (let id = 1; id <= 5; id++) {
      const response = await apiContext.get(`https://swapi.dev/api/people/${id}/`);
      console.log(`Response Status: ${response.status()} ${response.statusText()}`);
      console.log(`Response: ${JSON.stringify(await response.json(), null, 2)}`);
      expect(response.ok()).toBeTruthy();
      
      const person = await response.json();
      
      // Required fields
      expect(person.name).toBeTruthy();
      expect(person.height).toBeTruthy();
      expect(person.mass).toBeTruthy();
      expect(person.hair_color).toBeTruthy();
      expect(person.skin_color).toBeTruthy();
      expect(person.eye_color).toBeTruthy();
      expect(person.birth_year).toBeTruthy();
      expect(person.gender).toBeTruthy();
      expect(person.homeworld).toBeTruthy();
      expect(person.url).toBeTruthy();
      
      // Arrays
      expect(Array.isArray(person.films)).toBe(true);
      expect(Array.isArray(person.species)).toBe(true);
      expect(Array.isArray(person.vehicles)).toBe(true);
      expect(Array.isArray(person.starships)).toBe(true);
      
      // Gender validation
      expect(['male', 'female', 'n/a']).toContain(person.gender.toLowerCase());
      
      // URL pattern
      expect(person.url).toBe(`https://swapi.dev/api/people/${id}/`);
    }
  });

  test('Invalid person ID returns 404', async () => {
    const invalidIds = [0, 84, 100, -1];
    
    for (const id of invalidIds) {
      const response = await apiContext.get(`https://swapi.dev/api/people/${id}/`);
      console.log(`Response Status for ID ${id}: ${response.status()} ${response.statusText()}`);
      expect(response.status()).toBe(404);
    }
  });
});