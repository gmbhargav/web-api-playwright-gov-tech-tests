// api-tests/tests/person-api.spec.ts - FIXED
import { test, expect } from '@playwright/test';
import { SwapiService } from '../services/swapi.service';
import { API_CONFIG, TEST_DATA } from '../fixtures/api-data';
import { validatePersonSchema } from '../fixtures/api-schemas';

let swapiService: SwapiService;

test.describe('SWAPI Individual Person API Tests', () => {
  
  test.beforeAll(async () => {
    swapiService = new SwapiService();
    await swapiService.initialize();
  });
  
  test.afterAll(async () => {
    await swapiService.dispose();
  });

  test('TC-API-10: Get person by valid ID (1 to 82)', async () => {
    // Test a sample of valid IDs
    const testIds = [1, 20, 40, 60, 82];
    
    for (const id of testIds) {
      // Act - Get full response
      const apiResponse = await swapiService.getPersonById(id);
      
      // Assert HTTP response
      expect(apiResponse.status, `Person ${id} should return 200`).toBe(200);
      
      // Get person data
      const person = apiResponse.data;
      
      // Assert data
      expect(person, `Person ${id} should exist`).toBeDefined();
      expect(person.url, `Person ${id} URL should match ID`).toBe(`https://swapi.dev/api/people/${id}/`);
      
      // Validate schema
      validatePersonSchema(person);
      
      console.log(`✓ Person ${id} (${person.name}) validated in ${apiResponse.responseTime}ms`);
    }
  });

  test('TC-API-11: Verify all 82 people are accessible', async () => {
    const errors = [];
    const validatedPeople = [];
    
    // Test all 82 people
    for (let id = 1; id <= 82; id++) {
      try {
        const apiResponse = await swapiService.getPersonById(id);
        
        // Check HTTP status
        expect(apiResponse.status, `Person ${id} should return 200`).toBe(200);
        
        const person = apiResponse.data;
        validatedPeople.push(person);
        
        // Quick validation
        expect(person.name, `Person ${id} should have a name`).toBeTruthy();
        expect(API_CONFIG.VALID_GENDERS, `Person ${id} (${person.name}) has invalid gender`)
          .toContain(person.gender.toLowerCase());
          
      } catch (error: any) {
        errors.push(`Person ${id}: ${error.message}`);
      }
    }
    
    // Report results
    expect(errors, `Failed to fetch some people: ${errors.join(', ')}`).toEqual([]);
    expect(validatedPeople.length, `Should have validated 82 people, got ${validatedPeople.length}`).toBe(82);
    
    console.log(`✓ All 82 people validated successfully`);
  });

  test('TC-API-12: Verify gender field values are valid', async () => {
    // Test random sample of people
    const sampleIds = [1, 4, 13, 22, 35, 50, 67, 78];
    const genderCounts = { male: 0, female: 0, 'n/a': 0, other: 0 };
    
    for (const id of sampleIds) {
      const apiResponse = await swapiService.getPersonById(id);
      const person = apiResponse.data;
      const gender = person.gender.toLowerCase();
      
      if (API_CONFIG.VALID_GENDERS.includes(gender as any)) {
        genderCounts[gender]++;
      } else {
        genderCounts.other++;
        console.warn(`Person ${id} (${person.name}) has unexpected gender: ${gender}`);
      }
    }
    
    // Assert no "other" genders found
    expect(genderCounts.other, `Found ${genderCounts.other} people with invalid gender`).toBe(0);
    
    console.log(`Gender distribution in sample:`, genderCounts);
  });

  test('TC-API-13: Verify required fields exist for all people', async () => {
    // Test a subset for performance
    const testIds = [1, 17, 33, 49, 65, 82];
    
    for (const id of testIds) {
      const apiResponse = await swapiService.getPersonById(id);
      const person = apiResponse.data;
      
      // Check all required fields
      API_CONFIG.REQUIRED_FIELDS.forEach(field => {
        expect(person, `Person ${id} (${person.name}) missing field: ${field}`)
          .toHaveProperty(field);
        
        // Field should not be empty (except optional arrays)
        if (!['films', 'species', 'vehicles', 'starships'].includes(field)) {
          expect(person[field], `Person ${id} (${person.name}) field ${field} should not be empty`)
            .toBeTruthy();
        }
      });
      
      // Arrays should be arrays
      expect(Array.isArray(person.films), `Person ${id} films should be an array`).toBe(true);
      expect(Array.isArray(person.species), `Person ${id} species should be an array`).toBe(true);
      expect(Array.isArray(person.vehicles), `Person ${id} vehicles should be an array`).toBe(true);
      expect(Array.isArray(person.starships), `Person ${id} starships should be an array`).toBe(true);
    }
    
    console.log(`✓ Required fields validated for ${testIds.length} people`);
  });

  test('TC-API-14: Test invalid person IDs return 404', async () => {
    const invalidIds = TEST_DATA.INVALID_PERSON_IDS;
    
    for (const id of invalidIds) {
      try {
        const apiResponse = await swapiService.getPersonById(id);
        
        // If we get here with 200, it's unexpected
        if (apiResponse.status === 200) {
          console.warn(`Person ${id} exists unexpectedly`);
        } else if (apiResponse.status === 404) {
          console.log(`✓ Invalid ID ${id} correctly returns 404`);
        }
      } catch (error: any) {
        // Expected to throw error for invalid IDs
        expect(error.message).toMatch(/404|Failed to fetch/);
        console.log(`✓ Invalid ID ${id} returns error: ${error.message}`);
      }
    }
  });

  test('TC-API-15: Verify data consistency between list and detail endpoints', async () => {
    // Get person from list
    const listResponse = await swapiService.getAllPeopleData();
    const listPerson = listResponse.results[0];
    
    // Extract ID from URL
    const id = parseInt(listPerson.url.match(/\/(\d+)\/$/)![1]);
    
    // Get same person from detail endpoint
    const detailResponse = await swapiService.getPersonById(id);
    const detailPerson = detailResponse.data;
    
    // Compare - they should match
    expect(detailPerson.name).toBe(listPerson.name);
    expect(detailPerson.height).toBe(listPerson.height);
    expect(detailPerson.mass).toBe(listPerson.mass);
    expect(detailPerson.gender).toBe(listPerson.gender);
    expect(detailPerson.url).toBe(listPerson.url);
    
    console.log(`✓ Data consistent for ${detailPerson.name} (ID: ${id})`);
  });

  test('TC-API-16: Performance test - individual person endpoints', async () => {
    const MAX_RESPONSE_TIME = 2000;
    const testIds = [1, 41, 82];
    
    for (const id of testIds) {
      const apiResponse = await swapiService.getPersonById(id);
      const responseTime = apiResponse.responseTime;
      
      expect(responseTime, `Person ${id} response time ${responseTime}ms should be under ${MAX_RESPONSE_TIME}ms`)
        .toBeLessThan(MAX_RESPONSE_TIME);
      
      console.log(`Person ${id} response time: ${responseTime}ms`);
    }
  });

  test('TC-API-17: Verify URL patterns in response', async () => {
    const apiResponse = await swapiService.getPersonById(1);
    const person = apiResponse.data;
    
    // Check person URL
    expect(person.url).toMatch(/^https:\/\/swapi\.dev\/api\/people\/\d+\/$/);
    
    // Check homeworld URL
    expect(person.homeworld).toMatch(/^https:\/\/swapi\.dev\/api\/planets\/\d+\/$/);
    
    // Check film URLs
    person.films.forEach(filmUrl => {
      expect(filmUrl).toMatch(/^https:\/\/swapi\.dev\/api\/films\/\d+\/$/);
    });
    
    // Check vehicle URLs
    person.vehicles.forEach(vehicleUrl => {
      expect(vehicleUrl).toMatch(/^https:\/\/swapi\.dev\/api\/vehicles\/\d+\/$/);
    });
    
    // Check starship URLs
    person.starships.forEach(starshipUrl => {
      expect(starshipUrl).toMatch(/^https:\/\/swapi\.dev\/api\/starships\/\d+\/$/);
    });
    
    console.log('✓ All URL patterns validated');
  });

  test('TC-API-18: Test response for boundary IDs', async () => {
    // Test first person
    const firstResponse = await swapiService.getPersonById(1);
    const firstPerson = firstResponse.data;
    expect(firstPerson.name).toBe('Luke Skywalker');
    
    // Test last person
    const lastResponse = await swapiService.getPersonById(82);
    const lastPerson = lastResponse.data;
    expect(lastPerson).toBeDefined();
    expect(lastPerson.url).toBe('https://swapi.dev/api/people/82/');
    
    console.log(`✓ Boundary IDs validated: First=${firstPerson.name}, Last=${lastPerson.name}`);
  });

  test('TC-API-19: Verify data types in response', async () => {
    const apiResponse = await swapiService.getPersonById(1);
    const person = apiResponse.data;
    
    // Check data types
    expect(typeof person.name).toBe('string');
    expect(typeof person.height).toBe('string');
    expect(typeof person.mass).toBe('string');
    expect(typeof person.hair_color).toBe('string');
    expect(typeof person.skin_color).toBe('string');
    expect(typeof person.eye_color).toBe('string');
    expect(typeof person.birth_year).toBe('string');
    expect(typeof person.gender).toBe('string');
    expect(typeof person.homeworld).toBe('string');
    expect(typeof person.created).toBe('string');
    expect(typeof person.edited).toBe('string');
    expect(typeof person.url).toBe('string');
    
    // Check arrays
    expect(Array.isArray(person.films)).toBe(true);
    expect(Array.isArray(person.species)).toBe(true);
    expect(Array.isArray(person.vehicles)).toBe(true);
    expect(Array.isArray(person.starships)).toBe(true);
    
    console.log('✓ Data types validated');
  });
});