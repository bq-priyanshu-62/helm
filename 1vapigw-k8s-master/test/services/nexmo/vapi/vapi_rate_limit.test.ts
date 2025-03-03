import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service vapi_rate_limit
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

describe('Nexmo VAPI Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const vapiDomain = getHostDomainsList(servicesConf.api.vapi[selectedRegion]);

    const vapiPingRateLimitPerSecond = servicesConf.api.vapi.vapiPingRateLimitPerSecond;

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe('', () => {
      describe.each(vapiDomain)('domain - %s', vapiDomain => {
        it.each([
          ['/v1/calls/ping', vapiPingRateLimitPerSecond + 10, vapiDomain],
          ['/v2/calls/ping', vapiPingRateLimitPerSecond + 10, vapiDomain],
        ])('VAPI Rate Limit - Rate Limited Requests %s %s %s', async (path, rate, domain) => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-ratelimit-test-' + uuidv4(),
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
          ['/v1/calls/ping', vapiPingRateLimitPerSecond - 10, vapiDomain],
          ['/v2/calls/ping', vapiPingRateLimitPerSecond - 10, vapiDomain],
        ])('VAPI Rate Limit - No Rate Limited Requests %s %s %s', async (path, rate, domain) => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-ratelimit-test-' + uuidv4(),
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
