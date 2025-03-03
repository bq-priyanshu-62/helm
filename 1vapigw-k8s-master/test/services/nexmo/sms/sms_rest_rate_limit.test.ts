import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

const retry = require('jest-retries');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// The account we use for this must have some balance to be able to get past the quota/balance check
// We make an invalid call to SMS service so that it doesn't spend anything

/**
 * @service sms_rest_rate_limit
 * @lob nexmo
 // * @prod euw1 euc1 use1 usw2 // disable for prod, this creates unnecessary load constantly
 // * @qa euw1 euc1 use1 usw2 apse1 apse2 // no sms-fe available in qa now
 * @dev euw1 // use1 // no account in us now
 * @prodNotifyChannel active:telco-alert passive:telco-alerts-icinga
 */

async function validateRateLimitResponse({ request, method, path, headers, query, rate }) {
  let responses = [];
  for (let i = 0; i < rate; i++) {
    responses.push(request[method](path).set(headers).query(query));
  }
  const rawResponses = await Promise.all(responses);
  const filteredResponses = rawResponses.filter(x => x.text.includes('Throttled; You are sending SMS faster than the account'));
  expect(filteredResponses.length).toBeGreaterThan(0);
}

async function validateSMPPRateLimitResponse({ request, method, path, headers, query, rate }) {
  let responses = [];
  for (let i = 0; i < rate; i++) {
    responses.push(request[method](path).set(headers).query(query));
  }
  const rawResponses = await Promise.all(responses);
  const filteredResponses = rawResponses.filter(x => x.status == StatusCodes.TOO_MANY_REQUESTS);
  expect(filteredResponses.length).toBeGreaterThan(0);
}

describe('Nexmo SMS Services REST', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const smsRestDomains = getHostDomainsList(servicesConf.api.sms_rest[selectedRegion]);
    const smsApiDomains = getHostDomainsList(servicesConf.api.sms_api[selectedRegion]);
    const throttlingServiceDomains = getHostDomainsList(servicesConf.api.sms_rest_throttling[selectedRegion]);

    const numbOfRetries = 3;
    const rps = servicesConf.api.sms.rateLimitTest.rps;
    let apiKey;
    let apiSecret;

    beforeAll(async () => {
      apiKey = await getSecret(servicesConf.api.sms.rateLimitTest.api_key);
      apiSecret = await getSecret(servicesConf.api.sms.rateLimitTest.api_secret);
    });

    const _testConfig = (domain, path) => ({
      request,
      method: 'get',
      path: path,
      headers: {
        Host: domain,
        [TRACE_ID_HEADER]: '1vapigw-sms-rest-rate-limit-test',
      },
      // with the from and to parameters missing the call will fail im sms and so no balance will be used
      query: {
        api_key: apiKey,
        api_secret: apiSecret,
        text: 'HelloWorld',
      },
      rate: rps,
    });

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    beforeEach(async () => {
      /* TODO: remove the following once SMS legacy QA have fixed the LB issue.
      (LB pointing to two different instances of SMS on QA, which behave differently)
      */
      await new Promise(f => setTimeout(f, 1000));
    });

    !!smsRestDomains &&
      smsRestDomains.length > 0 &&
      describe('sms', () => {
        describe.each(smsRestDomains)('domain - %s', smsDomain => {
          retry('SMS Rate Limit - GET /sms/json', numbOfRetries, async () => {
            await validateRateLimitResponse(_testConfig(smsDomain, '/sms/json'));
          });
        });
      });

    !!smsApiDomains &&
      smsApiDomains.length > 0 &&
      describe('/v1/sms', () => {
        describe.each(smsApiDomains)('domain - %s', smsApiDomain => {
          retry('SMS Rate Limit - GET /sms/json', numbOfRetries, async () => {
            await validateRateLimitResponse(_testConfig(smsApiDomain, '/v1/sms/json'));
          });
        });
      });

    !!throttlingServiceDomains &&
      throttlingServiceDomains.length > 0 &&
      describe('/sms/throttling', () => {
        describe.each(throttlingServiceDomains)('domain - %s', smsDomain => {
          retry('SMS Rate Limit - GET /sms/throttling', numbOfRetries, async () => {
            await validateSMPPRateLimitResponse(_testConfig(smsDomain, '/sms/throttling'));
          });
        });
      });
  });
});
