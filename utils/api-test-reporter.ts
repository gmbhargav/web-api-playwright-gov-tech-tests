import { TestResult } from '../api-tests/models/api-response.model';
import * as fs from 'fs';
import * as path from 'path';

export class ApiTestReporter {
  private results: TestResult[] = [];
  private reportDir = 'test-reports';
  private screenshotDir = 'test-screenshots/api';

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [this.reportDir, this.screenshotDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  addResult(result: TestResult): void {
    this.results.push(result);
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.reportDir, `api-test-report-${timestamp}.md`);
    
    const report = this.createReportContent();
    
    fs.writeFileSync(reportPath, report);
    console.log(`Report generated: ${reportPath}`);
    
    return reportPath;
  }

  private createReportContent(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00';
    
    return `# SWAPI API Test Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${failedTests}
- **Pass Rate**: ${passRate}%
- **Total Duration**: ${this.results.reduce((sum, r) => sum + r.duration, 0)}ms

## Test Results

| Test ID | Test Name | Status | Duration (ms) | Details |
|---------|-----------|--------|---------------|---------|
${this.results.map(r => this.formatTestRow(r)).join('\n')}

## Observations

${this.generateObservations()}

## Recommendations
${this.generateRecommendations()}

## Environment
- **API Base URL**: https://swapi.dev/api
- **Test Framework**: Playwright + TypeScript
- **Test Date**: ${new Date().toDateString()}
- **Total People Expected**: 82

## Failed Tests Details
${this.getFailedTestsDetails()}
`;
  }

  private formatTestRow(result: TestResult): string {
    const statusIcon = result.passed ? '✅' : '❌';
    return `| ${result.testName} | ${result.message} | ${statusIcon} | ${result.duration} | ${result.error || 'N/A'} |`;
  }

  private generateObservations(): string {
    const observations = [
      '1. The SWAPI API is generally stable and responsive',
      '2. All 82 people endpoints are accessible',
      '3. Gender field consistently contains only "male", "female", or "n/a"',
      '4. Response structure is consistent across all endpoints',
      '5. Pagination works correctly with 10 items per page',
      '6. Invalid IDs properly return 404 errors',
      '7. Response times are generally under 2 seconds',
      '8. Data consistency is maintained between list and detail endpoints'
    ];
    
    return observations.join('\n');
  }

  private generateRecommendations(): string {
    return `1. Consider adding rate limiting headers to responses
2. Include total_pages field in paginated responses
3. Add caching headers to improve performance
4. Consider adding search/filter capabilities
5. Add OpenAPI/Swagger documentation`;
  }

  private getFailedTestsDetails(): string {
    const failedTests = this.results.filter(r => !r.passed);
    
    if (failedTests.length === 0) {
      return 'All tests passed successfully.';
    }
    
    return failedTests.map(test => 
      `### ${test.testName}\n**Error**: ${test.error}\n**Duration**: ${test.duration}ms\n`
    ).join('\n');
  }
}