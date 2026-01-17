import { Person } from "./person.model";

// api-tests/models/api-response.model.ts
export interface ApiResponse<T> {
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