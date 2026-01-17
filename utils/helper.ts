import { Page, Locator, expect } from '@playwright/test';

export async function selectDateFromPicker(page: Page, day: string, month: string, year: string) {
  await page.locator('#dateOfBirthInput').click();
  await page.locator('.react-datepicker__month-select').selectOption(month);
  await page.locator('.react-datepicker__year-select').selectOption(year);
  await page.locator(`.react-datepicker__day:not(.react-datepicker__day--outside-month):has-text("${day}")`).click();
}

export function formatDateForInput(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
