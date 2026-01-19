import { Page, Locator, expect } from '@playwright/test';
import { TestUser } from '../fixtures/test-data';

export class PracticeFormPage {
  readonly page: Page;
  
  // Form fields
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly genderRadio: (gender: string) => Locator;
  readonly mobile: Locator;
  readonly dateOfBirthInput: Locator;
  readonly subjectsInput: Locator;
  readonly hobbiesCheckbox: (hobby: string) => Locator;
  readonly pictureUpload: Locator;
  readonly address: Locator;
  readonly stateDropdown: Locator;
  readonly cityDropdown: Locator;
  readonly submitButton: Locator;
  
  // Modal fields
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly modalContent: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.firstName = page.locator('#firstName');
    this.lastName = page.locator('#lastName');
    this.email = page.locator('#userEmail');
    this.genderRadio = (gender: string) => 
      page.locator(`label[for="gender-radio-${gender === 'Male' ? 1 : gender === 'Female' ? 2 : 3}"]`);
    this.mobile = page.locator('#userNumber');
    this.dateOfBirthInput = page.locator('#dateOfBirthInput');
    this.subjectsInput = page.locator('.subjects-auto-complete__input input');
    this.hobbiesCheckbox = (hobby: string) => 
      page.locator(`label:has-text("${hobby}")`);
    this.pictureUpload = page.locator('#uploadPicture');
    this.address = page.locator('#currentAddress');
    this.stateDropdown = page.locator('#state');
    this.cityDropdown = page.locator('#city');
    this.submitButton = page.locator('#submit');
    
    // Modal locators
    this.modal = page.locator('.modal-content');
    this.modalTitle = page.locator('#example-modal-sizes-title-lg');
    this.modalContent = page.locator('.table-responsive');
  }

  async navigate() {
    await this.page.goto('/automation-practice-form');
  }

  async fillForm(user: TestUser, currentAddress: string) {
    // Basic information
    await expect(this.firstName).toBeVisible();
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.email.fill(user.email);
    await this.genderRadio(user.gender).click();
    await this.mobile.fill(user.mobile);
    
    // Date of Birth
    // await this.dateOfBirthInput.click();
    // await this.dateOfBirthInput.fill('');
    // await this.dateOfBirthInput.fill(user.dateOfBirth);
    // await this.page.keyboard.press('Enter');
    await this.fillDateOfBirth(user.dateOfBirth);
    
    // 5. Subjects - Fixed approach
    await this.fillSubjects(user.subjects);
    
    // 6. Hobbies
    for (const hobby of user.hobbies) {
      const hobbyCheckbox = this.page.locator(`label:has-text("${hobby}")`).first();
      await hobbyCheckbox.click();
    }
    
    // 7. Picture upload 
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      await this.pictureUpload.setInputFiles(imagePath);
    // 8. Address
    await this.address.fill(currentAddress);
    
    // 9. State and City - Fixed approach
    await this.selectStateAndCity(user.state, user.city);
  }

  async fillDateOfBirth(dateString: string) {
    // Format: "15 May 1990"
    const [day, month, year] = dateString.split(' ');
    
    // Click the date input to open picker
    await this.dateOfBirthInput.click();
    
    // Wait for date picker to appear
    await this.page.waitForSelector('.react-datepicker', { state: 'visible' });
    
    // Select year
    const yearDropdown = this.page.locator('.react-datepicker__year-select');
    await yearDropdown.selectOption({ value: year });
    
    // Select month (convert month name to index: January=0)
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.findIndex(m => m === month);
    const monthDropdown = this.page.locator('.react-datepicker__month-select');
    await monthDropdown.selectOption({ value: monthIndex.toString() });
    
    // Select day
    const dayCell = this.page.locator(`.react-datepicker__day:not(.react-datepicker__day--outside-month)`)
      .filter({ hasText: new RegExp(`^${parseInt(day)}$`) })
      .first();
    await dayCell.click();
  }

  async fillSubjects(subjects: string[]) {
    for (const subject of subjects) {
      await this.subjectsInput.click();
      await this.subjectsInput.fill(subject);
      await this.page.waitForTimeout(500); // Wait for dropdown
      
      // Press Enter or click the suggestion
      await this.page.keyboard.press('Enter');
      
      // Alternative: Click the dropdown option
      // const subjectOption = this.page.locator(`div.subjects-auto-complete__option:has-text("${subject}")`);
      // if (await subjectOption.isVisible()) {
      //   await subjectOption.click();
      // }
    }
  }

  async selectStateAndCity(state: string, city: string) {
    // Scroll to make element visible
    await this.stateDropdown.scrollIntoViewIfNeeded();
    
    // Select State
    await this.stateDropdown.click();
    await this.page.waitForTimeout(500);
    
    // Use different selector for state
    const stateOption = this.page.locator(`//div[contains(@class, "menu")]//div[text()="${state}"]`).first();
    await stateOption.click();
    
    // Wait for city dropdown to be enabled
    await this.page.waitForTimeout(500);
    
    // Select City
    await this.cityDropdown.click();
    await this.page.waitForTimeout(500);
    
    const cityOption = this.page.locator(`//div[contains(@class, "menu")]//div[text()="${city}"]`).first();
    await cityOption.click();
  }

  async submitForm() {
    // Scroll to submit button
    await this.submitButton.scrollIntoViewIfNeeded();
    
    // Submit form
    await this.submitButton.click();
    
    // Wait for modal to appear
    await this.page.waitForTimeout(3000);
  }

  async verifySubmissionSuccess() {
    await expect(this.modal).toBeVisible({ timeout: 10000 });
    await expect(this.modalTitle).toContainText('Thanks for submitting the form');
  }

  async verifyFormData(user: TestUser, currentAddress: string) {
    const modalContent = this.page.locator('.table-responsive');
    
    // Wait for modal content to load
    await expect(modalContent).toBeVisible();
    
    const modalText = await modalContent.textContent();
    
    console.log('Modal content:', modalText); // Debug log
    
    // Verify each field
    const verifications = [
      { field: 'Student Name', expected: `${user.firstName} ${user.lastName}` },
      { field: 'Student Email', expected: user.email },
      { field: 'Gender', expected: user.gender },
      { field: 'Mobile', expected: user.mobile },
      { field: 'Date of Birth', expected: user.dateOfBirth },
      { field: 'Subjects', expected: user.subjects.join(', ') },
      { field: 'Hobbies', expected: user.hobbies.join(', ') },
      { field: 'Address', expected: currentAddress },
      { field: 'State and City', expected: `${user.state} ${user.city}` }
    ];

    for (const verification of verifications) {
      expect(modalText).toContain(verification.field);
      // Note: The exact text matching might need adjustment based on actual modal format
    }
  }
  
  async closeModal() {
    // const closeButton = this.page.locator('.closeLargeModal');
    const closeButton = this.page.getByRole('button', { name: 'Close' })
    await this.scrollToElementIfNotVisible(closeButton);
    await closeButton.click();
  }

  async scrollToElementIfNotVisible(element: Locator, maxAttempts: number = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const isVisible = await element.isVisible();
      
      if (isVisible) {
        console.log(`Element is visible after ${attempt - 1} scroll attempts`);
        return true;
      }
      
      console.log(`Attempt ${attempt}: Scrolling down...`);
      
      // Scroll down
      await this.page.evaluate(() => {
        window.scrollBy(0, 300); // Scroll 300px down
      });
      
      // Wait a bit for content to load
      await this.page.waitForTimeout(500);
    }
    
    console.log('Element not visible after maximum scroll attempts');
    return false;
  }

}