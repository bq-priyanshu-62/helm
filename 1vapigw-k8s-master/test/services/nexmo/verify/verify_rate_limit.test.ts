import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import retry from 'jest-retries';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service verify_aws_rate_limit
 * @lob nexmo
 // * @prod apse1 apse2 euc1 euw1 // disable for prod, this creates unnecessary load constantly
//  * @qa apse1 apse2 euc1 euw1
 * @dev euw1
 * @prodNotifyChannel api-verify-alerts
 */

async function validateRateLimitResponse({ request, method, path, headers, rate }) {
  let responses = [];
  for (let i = 0; i < rate; i++) {
    responses.push(request[method](path).set(headers));
  }
  responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);
  // console.log(`number of 429 response: ${responses.length}`);

  expect(responses.length).toBeGreaterThan(0);
}

async function validateRateLimitResponseLegacy({ request, method, path, headers, rate }) {
  let responses = [];
  for (let i = 0; i < rate; i++) {
    responses.push(request[method](path).set(headers));
  }
  responses = (await Promise.all(responses)).filter(
    x => x.status === StatusCodes.OK && (x.body.status == 1 || x.text.includes('<status>1</status>')),
  ); // Status 1 is rate limit on Verify V1
  //console.log(`number of 429 response ${method}  - ${path}: ${JSON.stringify(responses[0])}`);

  expect(responses.length).toBeGreaterThan(0);
}

describe('Nexmo Verify Rate Limit Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const verifyV1Domain = getHostDomainsList(servicesConf.api.verify[selectedRegion])[0];
    const verifyV2Domain = getHostDomainsList(servicesConf.api.verify_v2[selectedRegion])[0];

    let authorization;
    let authorizationNoCustomRateLimit;

    const accountMaxMTConfigured = 5;
    const velocityRulesRateLimit = 5;
    const searchRateLimit = 5;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.rateLimitAuthorization);
      authorizationNoCustomRateLimit = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe('Verify Rate limit', () => {
      it.each([['/v2/verify', accountMaxMTConfigured, verifyV2Domain]])(
        'Verify Rate Limit - Max MT Rate Limit %s %s',
        async (path, rate, domain, method = 'post') => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-ratelimit-verify-test-' + uuidv4(),
            Authorization: authorization,
          };

          await validateRateLimitResponse({
            request,
            method: method,
            path: path,
            headers,
            rate: rate + 5,
          });
        },
      );

      it.each([
        ['/verify/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/xml', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/psd2/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/check/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/check/xml', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/confirm/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/confirm/xml', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/control/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/control/xml', accountMaxMTConfigured, verifyV1Domain],
      ])('Verify V1 Rate Limit POST - Max MT Rate Limit %s %s', async (path, rate, domain, method = 'post') => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: '1vapigw-ratelimit-verify-test-' + uuidv4(),
          Authorization: authorization,
        };

        await validateRateLimitResponseLegacy({
          request,
          method: method,
          path: path,
          headers,
          rate: rate + 5,
        });
      });

      it.each([
        ['/verify/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/xml', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/psd2/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/check/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/check/xml', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/confirm/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/confirm/xml', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/control/json', accountMaxMTConfigured, verifyV1Domain],
        ['/verify/control/xml', accountMaxMTConfigured, verifyV1Domain],
      ])('Verify V1 Rate Limit GET - Max MT Rate Limit %s %s', async (path, rate, domain, method = 'get') => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: '1vapigw-ratelimit-verify-test-' + uuidv4(),
          Authorization: authorization,
        };

        await validateRateLimitResponseLegacy({
          request,
          method: method,
          path: path,
          headers,
          rate: rate + 5,
        });
      });

      it.each([
        ['/verify/network-unblock', velocityRulesRateLimit, verifyV1Domain],
        ['/v2/verify/network-unblock', velocityRulesRateLimit, verifyV1Domain],
      ])('Verify Rate Limit - Default Rate Limit %s %s', async (path, rate, domain, method = 'post') => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: '1vapigw-ratelimit-verify-test-' + uuidv4(),
          Authorization: authorizationNoCustomRateLimit,
        };

        await validateRateLimitResponse({
          request,
          method: method,
          path: path,
          headers,
          rate: rate + 5,
        });
      });

      it.each([
        ['/verify/search/json', searchRateLimit, verifyV1Domain],
        ['/verify/search/xml', searchRateLimit, verifyV1Domain],
      ])('Verify Legacy Search Rate Limit POST - Default Rate Limit %s %s', async (path, rate, domain, method = 'post') => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: '1vapigw-ratelimit-verify-test-' + uuidv4(),
          Authorization: authorizationNoCustomRateLimit,
        };

        await validateRateLimitResponseLegacy({
          request,
          method: method,
          path: path,
          headers,
          rate: rate + 10,
        });
      });

      it.each([
        ['/verify/search/json', searchRateLimit, verifyV1Domain],
        ['/verify/search/xml', searchRateLimit, verifyV1Domain],
      ])('Verify Legacy Search Rate Limit GET - Default Rate Limit %s %s', async (path, rate, domain, method = 'get') => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: '1vapigw-ratelimit-verify-test-' + uuidv4(),
          Authorization: authorizationNoCustomRateLimit,
        };

        await validateRateLimitResponseLegacy({
          request,
          method: method,
          path: path,
          headers,
          rate: rate + 5,
        });
      });
    });
  });
});
