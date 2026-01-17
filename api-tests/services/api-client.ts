// api-tests/services/api-client.ts - Updated
import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { ApiResponseWrapper } from '../models/api-response.model';

export class ApiClient {
  private requestContext: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = 'https://swapi.dev/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async initialize(): Promise<void> {
    this.requestContext = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: this.defaultHeaders
    });
  }

  async dispose(): Promise<void> {
    if (this.requestContext) {
      await this.requestContext.dispose();
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponseWrapper<T>> {
    const startTime = Date.now();
    
    try {
      const response: APIResponse = await this.requestContext.get(endpoint, {
        params,
        headers: this.defaultHeaders
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: await response.json() as T,
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        status: 0,
        statusText: 'Request Failed',
        headers: {},
        data: null as any,
        responseTime,
        error: error.message
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}