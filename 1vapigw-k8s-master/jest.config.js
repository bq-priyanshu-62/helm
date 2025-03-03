const getReporters = () => {
  let reporters = [];

  reporters.push('default');
  
  reporters.push([
    'jest-html-reporters',
    {
      publicPath: './results',
      filename: 'report.html',
      expand: false
    }
  ]);

  reporters.push([
    'jest-junit',
    {
      outputDirectory: 'results',
      outputName: './TEST-junit.xml',
      reportTestSuiteErrors: true
    }
  ]);

  reporters.push([
    'jest-summarizing-reporter',
    {}
  ]);

  reporters.push([
    '<rootDir>/test/jest.customreporter.js',
    {
      outputDirectory: 'results',
      notifyFileName: 'notifications.yaml'
    }
  ]);

  if(process.env.ENABLE_REPORTPORTAL && process.env.ENABLE_REPORTPORTAL == "true") {
    reporters.push([
      '@reportportal/agent-js-jest',
      {
        "apiKey": "2da67f15-4eec-4bbe-835e-5d224b3e5a08",
        "endpoint": "https://reportportal-nexmo-dev-1-euw1.main0.api.nexmo.dev.euw1.vonagenetworks.net/api/v1",
        "project": "test",
        "launch": "APIGW-Sanity-Tests",
        "description": "APIGW Sanity Tests",
        "logLaunchLink": false,
        "rerun": process.env.RERUN && process.env.RERUN == "true" ? true : false,
        "attributes": [
            {
                "key": "type",
                "value": "sanity"
            },
            {
                "key": "service",
                "value": "gateway"
            },
        ],
        "restClientConfig": {
          "timeout": 0
        }
      }
    ]);
  }

  return reporters;
}

module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  cacheDirectory: process.env.CACHE_DIR ? `<rootDir>/jest-cache/${process.env.CACHE_DIR}` : '<rootDir>/jest-cache/tmp',
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
    '^~(.*)$': '<rootDir>/src/$1'
  },
  resolver: null,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*test.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  runner: './test/jest.runner.js',
  testTimeout: 120000,
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  reporters: getReporters()
};
