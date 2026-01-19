Playwright Testing Framework - Web & API Tests

Quick Start Guide
1. Install & Setup
`
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Verify installation
npx playwright --version
2. Run Tests
Web UI Tests (DemoQA Form)
bash
# Run all UI tests
npm run test:web

# Run all API tests
npm run test:api

# Run all tests (UI + API)
npm run test:all

# View test report
npm run show:report`

# Project Structure

project/
> ├── api-tests/tests         # API tests

> ├── web-tests/tests/        # Web UI tests  

> ├── web-tests/pages/        # Page objects

> ├── web-tests/fixtures/     # Test data

> └── playwright.config.ts
> └── playwright-report/index.html  # html report

**What We Test**

Web Tests (DemoQA)
1. Fill and submit practice form
2. Test with 2 different user datasets
3. Upload files, select dates
4. Validate form submission
5. Take screenshots

API Tests (SWAPI)
1. Get list of 82 Star Wars characters
2. Test each character endpoint
3. Validate gender fields (male/female/n/a)
4. Check response structure
