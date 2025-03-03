const fs = require('fs');
const { parse } = require('jest-docblock');
const yaml = require('js-yaml');
const request = require('syncrequest');

class CustomReporter {
  constructor(globalConfig, reporterOptions, reporterContext) {
    this._globalConfig = globalConfig;
    this._options = reporterOptions;
    this._context = reporterContext;
    this._atv_errors = [];
    this._jenkins = process.env['JENKINS_HOME'] ? true : false; //Set if Jenkins
  }

  setConfig(env) {
    if (!this._config) {
      const absolutePath = require('path').resolve(__dirname, `./config/${env}.yaml`);
      this._config = yaml.load(fs.readFileSync(absolutePath, 'utf8'));
    }
  }

  onTestResult(testRunConfig, testResults, runResults) {
    const [environment] = process.env.NODE_ENV.split('.');
    this.setConfig(environment);

    if (!this._jenkins || !this._config.reporter.atv.enabled) {
      console.log('Custom reporter - ATV logging disabled');
      return;
    }

    const filePath = testResults.testFilePath.replace(`${__dirname}/services/`, '');

    try {
      const atvDomain = this._config.reporter.atv.domain;
      const awsAccount = this._config.reporter.atv.awsAccount;
      const parsed = parse(fs.readFileSync(testResults.testFilePath, 'utf8'));
      const value = testResults.numFailingTests > 0 || testResults.failureMessage ? 0 : 1;
      let tags = [];

      //SRE Mandatory Tags
      tags.push(new ATVTag('cloud_provider', 'aws'));
      tags.push(new ATVTag('aws_account', awsAccount));
      tags.push(new ATVTag('region', process.env['REGION']));

      //Test Tags
      tags.push(new ATVTag('env', process.env['TEST_ENV']));
      tags.push(new ATVTag('cluster', process.env['CLUSTER']));
      tags.push(new ATVTag('active', process.env['ACTIVE_CLUSTER']));
      tags.push(new ATVTag('lob', parsed['lob']));
      tags.push(new ATVTag('service', parsed['service']));
      tags.push(new ATVTag('filepath', filePath));

      request.post.sync(`http://${atvDomain}/events/new`, {
        json: new ATVGauge(value, tags, parsed['team']),
      });
    } catch (err) {
      //Added just to eat any errors.
      this._atv_errors.push(filePath);
    }
  }

  onRunComplete(testContexts, results) {
    if (!this._jenkins) {
      console.log('Custom reporter logging disabled');
      return;
    }

    const [environment, region, cluster] = process.env.NODE_ENV.split('.');
    this.setConfig(environment);
    const notifyBloc = this._config.reporter.channel.bloc;
    const defaultChannel = this._config.reporter.channel.default;
    const activeCluster = process.env['ACTIVE_CLUSTER'] === 'true';
    const failedSuites = results.testResults.filter(suite => suite.numFailingTests > 0 || suite.failureMessage);
    let notifcations = [];

    failedSuites.forEach(suite => {
      const parsed = parse(fs.readFileSync(suite.testFilePath, 'utf8'));
      const filePath = suite.testFilePath.replace(`${__dirname}/services/`, '');

      if (notifcations.some(no => no.channel == defaultChannel)) {
        notifcations.find(no => no.channel == defaultChannel).addSuite(filePath);
      } else {
        let slackNotification = new SlackNotification(defaultChannel);
        slackNotification.addSuite(filePath);
        notifcations.push(slackNotification);
      }

      if (this._config.reporter.channel.enabled && parsed[notifyBloc]) {
        const parsedChannels = parsed[notifyBloc].split(' ').filter(e => e);
        let notifyChannels = [];

        if (activeCluster && parsedChannels.some(no => no.includes('active:'))) {
          notifyChannels = parsedChannels
            .filter(no => no.includes('active:'))
            .map(no => no.replace('active:', ''))
            .filter(e => e != defaultChannel);
        } else if (!activeCluster && parsedChannels.some(no => no.includes('passive:'))) {
          notifyChannels = parsedChannels
            .filter(no => no.includes('passive:'))
            .map(no => no.replace('passive:', ''))
            .filter(e => e != defaultChannel);
        } else {
          notifyChannels = parsedChannels.filter(no => !no.includes('passive:') || no.includes('active:')).filter(e => e != defaultChannel);
        }

        for (let i = 0, len = notifyChannels.length; i < len; i++) {
          if (notifcations.some(no => no.channel == notifyChannels[i])) {
            notifcations.find(no => no.channel == notifyChannels[i]).addSuite(filePath);
          } else {
            let slackNotification = new SlackNotification(notifyChannels[i]);
            slackNotification.addSuite(filePath);
            notifcations.push(slackNotification);
          }
        }
      }
    });

    fs.writeFileSync(
      `${this._options.outputDirectory}/${environment}-${region}-${cluster}-${this._options.notifyFileName}`,
      yaml.dump(new Notifications(notifcations, activeCluster)),
    );

    this._atv_errors.forEach(fp => console.log(`Error updating atv results for ${fp}`));
  }

  // // Optionally, reporters can force Jest to exit with non zero code by returning
  // // an `Error` from `getLastError()` method.
  // getLastError() {
  //   if (this._shouldFail) {
  //     return new Error('Custom error reported!');
  //   }
  // }
}

class ATVGauge {
  constructor(value, tags, team) {
    this.type = 'gauge';
    this.name = 'apigw_sanity_test';
    this.team = team ? team : 'api-gw';
    this.service = 'apigw-sanity-test';
    this.description = 'APIGW sanity test suite result';
    this.value = value;
    this.tags = tags;
  }
}

class ATVTag {
  constructor(key, value) {
    this[key] = value;
  }
}

class Notifications {
  constructor(slackNotifications, clusterActive) {
    this.active = clusterActive;
    this.notifications = slackNotifications;
  }
}

class SlackNotification {
  constructor(channel) {
    this.channel = channel;
    this.suites = [];
  }

  addSuite(suite) {
    this.suites.push(suite);
  }
}

module.exports = CustomReporter;
