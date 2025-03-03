import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service conversations_rate_limit
 * @lob nexmo
 * @dev euw1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
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

describe('Nexmo Conversations Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const conversationDomain = getHostDomainsList(servicesConf.api.conversations.host[selectedRegion]);

    const conversationsPingRateLimitPerSecond = servicesConf.api.conversations.conversationsPingRateLimitPerSecond;

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe('', () => {
      describe.each(conversationDomain)('domain - %s', conversationDomain => {
        it.each([
          ['/beta/conversations/ping', conversationsPingRateLimitPerSecond + 10, conversationDomain],
          ['/beta2/conversations/ping', conversationsPingRateLimitPerSecond + 10, conversationDomain],
          ['/v0.1/conversations/ping', conversationsPingRateLimitPerSecond + 10, conversationDomain],
          ['/v0.2/conversations/ping', conversationsPingRateLimitPerSecond + 10, conversationDomain],
          ['/v0.3/conversations/ping', conversationsPingRateLimitPerSecond + 10, conversationDomain],
          ['/v1/conversations/ping', conversationsPingRateLimitPerSecond + 10, conversationDomain],
        ])('Conversations Rate Limit - Rate Limited Requests %s %s %s', async (path, rate, domain) => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-ratelimit-test-' + uuidv4(),
          };

          await validateRateLimitResponse({
            request,
            method: 'get',
            path: path,
            headers,
            rate: rate,
          });
        });

        it.each([
          ['/beta/conversations/ping', conversationsPingRateLimitPerSecond - 10, conversationDomain],
          ['/beta2/conversations/ping', conversationsPingRateLimitPerSecond - 10, conversationDomain],
          ['/v0.1/conversations/ping', conversationsPingRateLimitPerSecond - 10, conversationDomain],
          ['/v0.2/conversations/ping', conversationsPingRateLimitPerSecond - 10, conversationDomain],
          ['/v0.3/conversations/ping', conversationsPingRateLimitPerSecond - 10, conversationDomain],
          ['/v1/conversations/ping', conversationsPingRateLimitPerSecond - 10, conversationDomain],
        ])('Conversations Rate Limit - No Rate Limited Requests %s %s %s', async (path, rate, domain) => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-ratelimit-test-' + uuidv4(),
          };

          await validateNoRateLimitResponse({
            request,
            method: 'get',
            path: path,
            headers,
            rate: rate,
          });
        });
      });
    });
  });
});
