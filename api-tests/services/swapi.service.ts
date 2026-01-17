// api-tests/services/swapi.service.ts - Updated
import { ApiClient } from './api-client';
import { Person } from '../models/person.model';
import { 
  ApiResponseWrapper, 
  PeopleApiResponse, 
  PersonApiResponse 
} from '../models/api-response.model';

export class SwapiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async initialize(): Promise<void> {
    await this.apiClient.initialize();
  }

  async dispose(): Promise<void> {
    await this.apiClient.dispose();
  }

  async getAllPeople(page?: number): Promise<ApiResponseWrapper<PeopleApiResponse>> {
    const endpoint = '/people/';
    const params = page ? { page } : undefined;
    
    const response = await this.apiClient.get<PeopleApiResponse>(endpoint, params);
    return response;
  }

  async getPersonById(id: number): Promise<ApiResponseWrapper<PersonApiResponse>> {
    const endpoint = `/people/${id}/`;
    const response = await this.apiClient.get<PersonApiResponse>(endpoint);
    return response;
  }

  async getAllPeoplePaginated(): Promise<Person[]> {
    let allPeople: Person[] = [];
    let nextPage: string | null = '/people/';
    let pageCount = 0;
    
    while (nextPage && pageCount < 10) {
      const endpoint = nextPage.replace(this.apiClient['baseURL'], '');
      const response = await this.apiClient.get<PeopleApiResponse>(endpoint);
      
      allPeople = [...allPeople, ...response.data.results];
      nextPage = response.data.next;
      pageCount++;
      
      if (!nextPage) break;
    }
    
    return allPeople;
  }

  async validatePersonSchema(person: Person): Promise<string[]> {
    const errors: string[] = [];
    const requiredFields = [
      'name', 'height', 'mass', 'hair_color', 'skin_color',
      'eye_color', 'birth_year', 'gender', 'homeworld',
      'films', 'species', 'vehicles', 'starships',
      'created', 'edited', 'url'
    ];
    
    requiredFields.forEach(field => {
      if (!(field in person)) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    const validGenders = ['male', 'female', 'n/a'];
    if (!validGenders.includes(person.gender.toLowerCase())) {
      errors.push(`Invalid gender value: ${person.gender}. Expected: ${validGenders.join(', ')}`);
    }
    
    if (!person.homeworld.startsWith('https://swapi.dev/api/planets/')) {
      errors.push(`Invalid homeworld URL: ${person.homeworld}`);
    }
    
    return errors;
  }

  // Helper method to extract just the data
  async getAllPeopleData(page?: number): Promise<PeopleApiResponse> {
    const response = await this.getAllPeople(page);
    return response.data;
  }

  // Helper method to extract just the person data
  async getPersonDataById(id: number): Promise<Person> {
    const response = await this.getPersonById(id);
    return response.data;
  }
}