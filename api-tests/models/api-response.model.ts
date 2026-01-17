import { Person } from './person.model';

export interface ApiResponseWrapper<T> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  responseTime: number;
  error?: string;
}

export interface PeopleApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Person[];
}

export interface PersonApiResponse extends Person {}

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  duration: number;
  data?: any;
  error?: string;
}