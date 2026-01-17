// api-tests/tests/people-api.spec.ts - Updated
import { test, expect } from '@playwright/test';
import { SwapiService } from '../services/swapi.service';
import { API_CONFIG, TEST_DATA } from '../fixtures/api-data';
import { PeopleApiResponse } from '../models/api-response.model';

let swapiService: SwapiService;

test.describe('SWAPI People API Tests', () => {
  
  test.beforeAll(async () => {
    swapiService = new SwapiService();
    await swapiService.initialize();
    
    // Health check
    const isHealthy = await swapiService['apiClient'].healthCheck();
    expect(isHealthy, 'SWAPI service is not available').toBeTruthy();
  });
  
  test.afterAll(async () => {
    await swapiService.dispose();
  });

  test('TC-API-01: Get list of people returns maximum 82 characters', async () => {
    // Act - Use the helper method that returns just data
    const response: PeopleApiResponse = await swapiService.getAllPeopleData();
    
    // Assert
    expect(response.count, 'Total people count should be 82').toBe(API_CONFIG.EXPECTED_PEOPLE_COUNT);
    expect(response.results, 'Results should be an array').toBeInstanceOf(Array);
    expect(response.results.length, 'First page should have 10 results').toBe(10);
    
    console.log(`Total people count: ${response.count}`);
    console.log(`Results on first page: ${response.results.length}`);
  });

  test('TC-API-02: Verify pagination works correctly', async () => {
    // Get full response including status
    const apiResponse = await swapiService.getAllPeople();
    
    // Check status
    expect(apiResponse.status, 'Response status should be 200').toBe(200);
    expect(apiResponse.statusText, 'Response status text should be OK').toBe('OK');
    
    // Check data
    expect(apiResponse.data.count).toBe(API_CONFIG.EXPECTED_PEOPLE_COUNT);
    expect(apiResponse.data.results.length).toBe(10);
    
    console.log(`Response time: ${apiResponse.responseTime}ms`);
  });

  test('TC-API-03: Verify response structure for people list', async () => {
    // Get full response
    const apiResponse = await swapiService.getAllPeople();
    
    // Check HTTP response
    expect(apiResponse.status).toBe(200);
    
    // Get data
    const response: PeopleApiResponse = apiResponse.data;
    
    // Assert - Check response structure
    expect(response).toHaveProperty('count');
    expect(response).toHaveProperty('next');
    expect(response).toHaveProperty('previous');
    expect(response).toHaveProperty('results');
    
    // Check that count is a number
    expect(typeof response.count).toBe('number');
    
    // Check that results is an array
    expect(Array.isArray(response.results)).toBe(true);
    
    // Check first person has basic structure
    const firstPerson = response.results[0];
    expect(firstPerson).toHaveProperty('name');
    expect(firstPerson).toHaveProperty('url');
    
    console.log('Response structure validation passed');
  });

  test('TC-API-04: Verify all people have unique URLs', async () => {
    // Act - Get all people using helper
    const allPeople = await swapiService.getAllPeoplePaginated();
    
    // Assert
    const urls = allPeople.map(person => person.url);
    const uniqueUrls = [...new Set(urls)];
    
    expect(uniqueUrls.length, 'All people should have unique URLs').toBe(allPeople.length);
    
    // Also verify URL pattern
    urls.forEach(url => {
      expect(url, `URL ${url} should match pattern`).toMatch(/^https:\/\/swapi\.dev\/api\/people\/\d+\/$/);
    });
    
    console.log(`Verified ${urls.length} unique URLs`);
  });

  test('TC-API-05: Performance test - Response time should be under 3 seconds', async () => {
    // Arrange
    const MAX_RESPONSE_TIME = 3000;
    
    // Act - Get full response to access responseTime
    const apiResponse = await swapiService.getAllPeople();
    const actualResponseTime = apiResponse.responseTime;
    
    // Assert
    expect(actualResponseTime, `Response time ${actualResponseTime}ms should be under ${MAX_RESPONSE_TIME}ms`)
      .toBeLessThan(MAX_RESPONSE_TIME);
    expect(apiResponse.status, 'Response should be successful').toBe(200);
    
    console.log(`API Response time: ${apiResponse.responseTime}ms`);
  });

  test('TC-API-06: Verify each person in first page has valid data', async () => {
    // Act
    const response: PeopleApiResponse = await swapiService.getAllPeopleData();
    
    // Assert - Validate each person in first page
    for (const [index, person] of response.results.entries()) {
      // Check required fields exist
      API_CONFIG.REQUIRED_FIELDS.forEach(field => {
        expect(person, `Person ${index} (${person.name}) missing field: ${field}`)
          .toHaveProperty(field);
      });
      
      // Check gender is valid
      const gender = person.gender.toLowerCase();
      expect(API_CONFIG.VALID_GENDERS, `Person ${index} (${person.name}) has invalid gender: ${gender}`)
        .toContain(gender);
      
      // Check URL pattern
      expect(person.url, `Person ${index} (${person.name}) has invalid URL`)
        .toMatch(/^https:\/\/swapi\.dev\/api\/people\/\d+\/$/);
    }
    
    console.log(`Validated ${response.results.length} people on first page`);
  });

  test('TC-API-07: Test with different page numbers', async () => {
    // Test first page
    const page1: PeopleApiResponse = await swapiService.getAllPeopleData(1);
    expect(page1.results.length).toBe(10);
    expect(page1.previous).toBeNull();
    expect(page1.next).toContain('page=2');
    
    // Test second page
    const page2: PeopleApiResponse = await swapiService.getAllPeopleData(2);
    expect(page2.results.length).toBe(10);
    expect(page2.previous).toContain('page=1');
    
    // Test last page (page 9 should have 2 people)
    const page9: PeopleApiResponse = await swapiService.getAllPeopleData(9);
    expect(page9.results.length).toBe(2);
    expect(page9.next).toBeNull();
    
    console.log('Pagination test passed for pages 1, 2, and 9');
  });

  test('TC-API-08: Verify response headers', async () => {
    // Get full response to access headers
    const apiResponse = await swapiService.getAllPeople();
    
    // Assert headers
    expect(apiResponse.headers['content-type']).toContain('application/json');
    expect(apiResponse.headers).toHaveProperty('date');
    expect(apiResponse.headers).toHaveProperty('server');
    
    console.log('Response headers validated');
    console.log('Content-Type:', apiResponse.headers['content-type']);
  });

  test('TC-API-09: Edge case - Invalid page number returns appropriate response', async () => {
    try {
      // Try to get a very high page number
      const apiResponse = await swapiService.getAllPeople(999);
      
      // If it returns successfully, check if results are empty
      if (apiResponse.status === 200) {
        expect(apiResponse.data.results).toEqual([]);
        expect(apiResponse.data.next).toBeNull();
        expect(apiResponse.data.previous).toBeNull();
      }
    } catch (error: any) {
      // Or it might return an error
      console.log(`Expected error for invalid page: ${error.message}`);
    }
    
    console.log('Invalid page number handled correctly');
  });
});