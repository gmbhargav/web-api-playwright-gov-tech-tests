import { test, expect } from '@playwright/test';
import { PracticeFormPage } from '../pages/practice-form-page';
import { testData, generateCurrentAddress } from '../fixtures/test-data';

test.describe('DemoQA Practice Form Tests', () => {
  let practiceFormPage: PracticeFormPage;

  test.beforeEach(async ({ page }) => {
    practiceFormPage = new PracticeFormPage(page);
    await practiceFormPage.navigate();
  });

  test('TC1: Submit form with Data Set 1 @smoke', async () => {
    const user = testData.dataSet1;
    const currentAddress = generateCurrentAddress(123);
    
    await practiceFormPage.fillForm(user, currentAddress);
    await practiceFormPage.submitForm();
    
    // Verify submission success
    await practiceFormPage.verifySubmissionSuccess();
    
    // Verify form data in modal
    await practiceFormPage.verifyFormData(user, currentAddress);
    
    await practiceFormPage.closeModal();
  });

  test('TC2: Submit form with Data Set 2 @smoke', async () => {
    const user = testData.dataSet2;
    const currentAddress = generateCurrentAddress(456);
    
    await practiceFormPage.fillForm(user, currentAddress);
    await practiceFormPage.submitForm();
    
    // Verify submission success
    await practiceFormPage.verifySubmissionSuccess();
    
    // Verify form data in modal
    await practiceFormPage.verifyFormData(user, currentAddress);
    
    await practiceFormPage.closeModal();
  });

  test('TC3: Submit form with both data sets @regression', async ({ page }) => {
    // Test with Data Set 1
    const user1 = testData.dataSet1;
    const currentAddress1 = generateCurrentAddress(123);
    
    await practiceFormPage.fillForm(user1, currentAddress1);
    await practiceFormPage.submitForm();
    await practiceFormPage.verifySubmissionSuccess();
    await practiceFormPage.verifyFormData(user1, currentAddress1);
    await practiceFormPage.closeModal();
    
    // Refresh page for next test
    await page.reload();
    
    // Test with Data Set 2
    const user2 = testData.dataSet2;
    const currentAddress2 = generateCurrentAddress(456);
    
    await practiceFormPage.fillForm(user2, currentAddress2);
    await practiceFormPage.submitForm();
    await practiceFormPage.verifySubmissionSuccess();
    await practiceFormPage.verifyFormData(user2, currentAddress2);
    await practiceFormPage.closeModal();
  });
});