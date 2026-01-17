export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  mobile: string;
  dateOfBirth: string;
  subjects: string[];
  hobbies: string[];
  picture: string;
  address: string;
  state: string;
  city: string;
}

export const testData: Record<string, TestUser> = {
  dataSet1: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    gender: 'Male',
    mobile: '1234567890',
    dateOfBirth: '15 May 1990',
    subjects: ['Maths'],
    hobbies: ['Sports', 'Music'],
    picture: 'test-image.jpg',
    address: '123 Test Street, Test City',
    state: 'NCR',
    city: 'Delhi'
  },
  dataSet2: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    gender: 'Female',
    mobile: '9876543210',
    dateOfBirth: '20 August 1995',
    subjects: ['English'],
    hobbies: ['Reading'],
    picture: 'test-image.jpg',
    address: '456 Sample Avenue, Sample City',
    state: 'Uttar Pradesh',
    city: 'Lucknow'
  }
};

export function generateCurrentAddress(blockNumber: number): string {
  return `${blockNumber} Test Street #01-02 Test Building; Singapore Postal code 123456`;
}