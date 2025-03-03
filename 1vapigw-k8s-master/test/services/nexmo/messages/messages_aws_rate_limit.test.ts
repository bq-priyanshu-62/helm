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
 * @service messages_aws_rate_limit
 * @lob nexmo
// * @prod apse1 apse2 euc1 euw1 // disable for prod, this creates unnecessary load constantly
//  * @qa apse1 apse2 euc1 euw1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

async function validateRateLimitResponse({ request, method, path, headers, rate }) {
  let responses: any = [];

  for (let i = 0; i <= rate; i++) {
    responses.push(request[method](path).set(headers));
  }
  responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

  expect(responses.length).toBeGreaterThan(0);
}

async function validateNoRateLimitResponse({ request, method, path, headers, rate }) {
  let responses: any = [];

  for (let i = 0; i <= rate; i++) {
    responses.push(request[method](path).set(headers));
  }
  responses = await Promise.all(responses);
  expect(responses.length).toBeGreaterThan(0);

  responses = responses.filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

  expect(responses.length).toBe(0);
}

describe('Nexmo Messages-AWS Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const messageDomains = getHostDomainsList(servicesConf.api.messagesaws.host[selectedRegion]);
    const messagesDomain = [messageDomains[0]]; //test rate limit with one domain just like before
    let authorization;
    let authorizationNoRateLimit;

    const chatappRateLimitPerSecond = servicesConf.api.messagesaws.chatappRateLimitPerSecond;
    const dispatchRateLimitPerSecond = servicesConf.api.messagesaws.dispatchRateLimitPerSecond;

    const sandboxDomain = getHostDomainsList(servicesConf.api.messagesaws.sandboxHost[selectedRegion])[0];
    const sandboxRateLimitPerSecond = servicesConf.api.messagesaws.sandboxRateLimitPerSecond;

    const authorisationCapabilityRateLimit = 'Basic ' + Buffer.from('verify23:Verify23').toString('base64');

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.rateLimitAuthorization);
      authorizationNoRateLimit = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe('', () => {
      describe.each(messagesDomain)('domain - %s', messagesDomain => {
        it.each([
          ['/v0.1/messages', 15, sandboxDomain],
          ['/v1/messages', 15, sandboxDomain],
          ['/v0.1/messages', 5, messagesDomain],
          ['/v1/messages', 5, messagesDomain],
          ['/v0.1/dispatch', 5, messagesDomain],
        ])('Messages Rate Limit - Capability Rate Limit %s %s', async (path, rate, domain) => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-ratelimit-test-' + uuidv4(),
            Authorization: authorisationCapabilityRateLimit,
          };

          await validateRateLimitResponse({
            request,
            method: 'post',
            path: path,
            headers,
            rate: rate,
          });
        });

        it.each([
          ['/v0.1/messages', sandboxRateLimitPerSecond, sandboxDomain],
          ['/v1/messages', sandboxRateLimitPerSecond, sandboxDomain],
          ['/v0.1/messages', chatappRateLimitPerSecond, messagesDomain],
          ['/v1/messages', chatappRateLimitPerSecond, messagesDomain],
          ['/v0.1/dispatch', dispatchRateLimitPerSecond, messagesDomain],
        ])('Messages Rate Limit - Default Rate Limit %s %s', async (path, rate, domain) => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-ratelimit-default-test-' + uuidv4(),
            Authorization: authorization,
          };

          await validateRateLimitResponse({
            request,
            method: 'post',
            path: path,
            headers,
            rate: rate + 20,
          });
        });

        it.each([
          ['/v0.1/messages', sandboxRateLimitPerSecond, sandboxDomain],
          ['/v1/messages', sandboxRateLimitPerSecond, sandboxDomain],
          ['/v0.1/messages', chatappRateLimitPerSecond - 5, messagesDomain],
          ['/v1/messages', chatappRateLimitPerSecond - 5, messagesDomain],
          ['/v0.1/dispatch', dispatchRateLimitPerSecond - 5, messagesDomain],
        ])('Messages Rate Limit - No Config applied should not return any 429 %s %s', async (path, rate, domain) => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-ratelimit-no-config-test-' + uuidv4(),
            Authorization: authorizationNoRateLimit,
          };

          await validateNoRateLimitResponse({
            request,
            method: 'post',
            path: path,
            headers,
            rate: rate,
          });
        });
      });
    });
  });
});
