const JestRunner = require('jest-runner');
const TestRunner = Object.prototype.hasOwnProperty.call(JestRunner, 'default') ? JestRunner.default : JestRunner;
const fs = require('fs');
const { parse } = require('jest-docblock');
const yaml = require('js-yaml');
const request = require('syncrequest');
const StatusCodes = require('http-status-codes');

const LOB_ARG_PREFIX = '--lob=';
const TEST_ENV_PREFIX = '--test-env=';
const SERVICE_ARG_PREIX = '--service=';
const QUICK_TEST = '--primary-only=';
const GA_ARG_PREFIX = '--ga-test=';

class CustomRunner extends TestRunner {
  static saveArgvParams(args) {
    const registeredArgs = [
      ['-rr', 'RUN_REGION', 'true'],
      ['-rg', 'RUN_GLOBAL', 'true'],
      ['--test-env=', 'NODE_ENV', null],
      ['--atmos-env=', 'ATMOS_ENV', null],
    ];

    for (const arg of args) {
      if (arg.startsWith(QUICK_TEST)) {
        let primaryTest = arg.substring(QUICK_TEST.length);
        process.env['PRIMARY_ONLY'] = primaryTest === 'false' ? false : true;
      }

      for (const regArg of registeredArgs) {
        if (arg.startsWith(regArg[0])) {
          process.env[regArg[1]] = regArg[2] || arg.substring(regArg[0].length);
        }
      }
    }

    this.addEnvVariables();
  }

  static addEnvVariables() {
    const [env, reg, clus] = process.env.NODE_ENV.split('.');
    const absolutePath = require('path').resolve(__dirname, `./config/${env}.yaml`);
    const doc = yaml.load(fs.readFileSync(absolutePath, 'utf8'));

    const activeClster = this.getActiveCluster(doc.gloo.regions[reg], 'api', 5);
    process.env['TEST_ENV'] = env;
    process.env['REGION'] = activeClster.region;

    if (!['c1', 'c2', 'cactive', 'active'].includes(clus.toLowerCase())) {
      throw 'invalid cluster value';
    }

    if (clus.toLowerCase().includes('active')) {
      process.env['CLUSTER'] = activeClster.cluster;
      process.env['ACTIVE_CLUSTER'] = true;
    } else {
      process.env['CLUSTER'] = `1vapi-${clus.substring(1)}`;
      process.env['ACTIVE_CLUSTER'] = `1vapi-${clus.substring(1)}` == activeClster.cluster;
    }
  }

  static getActiveCluster(regionConf, lob, tries) {
    if (tries < 1) {
      throw 'error finding active cluster';
    }

    try {
      const url = `https://${regionConf.clusters.active.domain}/gateway/ping`;

      const res = request.sync({ url: url });
      if (res.response.statusCode !== StatusCodes.StatusCodes.OK) {
        sleep(1000);
        return this.getActiveCluster(regionConf, lob, tries - 1);
      }

      return JSON.parse(res.body);
    } catch {
      return this.getActiveCluster(regionConf, lob, tries - 1);
    }
  }

  static getLOB(args) {
    let env = '';
    args.forEach(arg => {
      if (arg.startsWith(LOB_ARG_PREFIX)) {
        env = arg.substring(LOB_ARG_PREFIX.length);
        return env;
      }
    });
    return env;
  }

  static getServiceName(args) {
    let service = '';
    args.forEach(arg => {
      if (arg.startsWith(SERVICE_ARG_PREIX)) {
        service = arg.substring(SERVICE_ARG_PREIX.length);
        return service;
      }
    });
    return service;
  }

  static getRegion(args) {
    let params = {};
    args.forEach(arg => {
      if (arg.startsWith(TEST_ENV_PREFIX)) {
        params = arg.substring(TEST_ENV_PREFIX.length).split('.');
        return { env: params[0], region: params[1], cluster: params[2] };
      }
    });
    return { env: params[0], region: params[1], cluster: params[2] };
  }

  static filterTestsByEnvironment(testEnvironment, region, test) {
    let found = testEnvironment.length === 0;

    const parsed = parse(fs.readFileSync(test.path, 'utf8'));
    if (parsed[testEnvironment]) {
      const parsedEnv = Array.isArray(parsed[testEnvironment]) ? parsed[testEnvironment] : [parsed[testEnvironment]];
      for (let i = 0, len = parsedEnv.length; i < len; i++) {
        if (typeof parsedEnv[i] === 'string') {
          if (parsedEnv[i].includes(region)) {
            found = true;
          }
        }
      }
    }
    return found;
  }

  static filterTestsByLOB(lob, test) {
    let found = lob.length === 0;

    const parsed = parse(fs.readFileSync(test.path, 'utf8'));
    if (parsed['lob']) {
      const parsedLob = Array.isArray(parsed['lob']) ? parsed['lob'] : [parsed['lob']];
      for (let i = 0, len = parsedLob.length; i < len; i++) {
        if (typeof parsedLob[i] === 'string') {
          if (parsedLob[i].includes(lob)) {
            found = true;
          }
        }
      }
    }
    return found;
  }

  static filterTestsByService(service, test) {
    let found = service.length === 0;

    const parsed = parse(fs.readFileSync(test.path, 'utf8'));
    if (parsed['service']) {
      const parsedLob = Array.isArray(parsed['service']) ? parsed['service'] : [parsed['service']];
      for (let i = 0, len = parsedLob.length; i < len; i++) {
        if (typeof parsedLob[i] === 'string') {
          if (parsedLob[i].includes(service)) {
            found = true;
          }
        }
      }
    }
    return found;
  }

  static filterGATest(args, test) {
    let gaTest = false;
    const parsed = parse(fs.readFileSync(test.path, 'utf8'));
    const gaArg = args.filter(arg => arg.startsWith(GA_ARG_PREFIX));

    if (gaArg && gaArg.length > 0) {
      if (gaArg[0].startsWith(GA_ARG_PREFIX)) {
        gaTest = gaArg[0].substring(GA_ARG_PREFIX.length) === 'true' ? true : false;
      }
    }

    if (gaTest) {
      if (parsed['ga']) {
        return true;
      } else {
        return false;
      }
    } else {
      if (parsed['ga']) {
        return false;
      } else {
        return true;
      }
    }
  }

  static filterTests(args, tests) {
    //First we filter by environment (qa euw1) then by LOB (nexmo|cc|uc) then by specific service to test
    //If you don't supply the parameter for a particular filter then it returns all test suites.
    const params = this.getRegion(args);
    const lob = this.getLOB(args);
    const serviceName = this.getServiceName(args);

    console.log(
      'found env: ' +
        params.env +
        ' region: ' +
        params.region +
        ' and cluster: ' +
        params.cluster +
        ' with lob: ' +
        lob +
        ' and service: ' +
        serviceName,
    );

    return tests
      .filter(test => CustomRunner.filterTestsByEnvironment(params.env, params.region, test))
      .filter(test => this.filterTestsByLOB(lob, test))
      .filter(test => this.filterTestsByService(serviceName, test))
      .filter(test => this.filterGATest(args, test));
  }

  runTests(tests, watcher, onStart, onResult, onFailure, options) {
    CustomRunner.saveArgvParams(process.argv);
    let filteredTests = CustomRunner.filterTests(process.argv, tests);
    filteredTests.sort(() => Math.random() - 0.5); //create random sequence for each run
    return super.runTests(filteredTests, watcher, onStart, onResult, onFailure, options);
  }
}

module.exports = CustomRunner;
