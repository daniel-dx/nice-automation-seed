module.exports = {
  use: {
    // Browser options
    headless: true,
    slowMo: 50,

    // Context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Artifacts
    screenshot: "only-on-failure",
    video: "retry-with-video",
  },

  // Look for test files in the "tests" directory, relative to this configuration file
  testDir: "tests",

  // Each test is given 30 seconds
  timeout: 30000,

  // Forbid test.only on CI
  forbidOnly: !!process.env.CI,

  // Two retries for each test
  retries: 0,

  // Limit the number of workers on CI, use default locally
  workers: process.env.CI ? 2 : undefined,

  globalSetup: "./global-setup.js",

  reporter: [["junit", { outputFile: "report/results.xml" }], ["list"]],
};
