import { getHostList, servicesConf } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
const retry = require('jest-retries');
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service rate_limit_sanity
 * @lob nexmo
 * @dev euw1
 * @prodNotifyChannel api-gw-notify
 */

async function validateRateLimitResponse({ request, method, path, headers, rate }) {
  let responses: any = [];
  for (let i = 0; i < rate; i++) {
    responses.push(request[method](path).set(headers));
  }
  responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);
  expect(responses.length).toBeGreaterThan(0);
}

describe('Nexmo Rate-limiting Sanity Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.rateLimitAuthorization);
    });

    describe('Nexmo Rate-limiting Sanity Services', () => {
      retry('generic-1-rpm', 3, async () => {
        const headers = {
          [TRACE_ID_HEADER]: '1vapigw-rate-limiting-sanity-generic-1-rpm',
          Authorization: authorization,
        };
        await validateRateLimitResponse({
          request,
          method: 'get',
          path: '/rate-limiting-sanity/generic-1-rpm',
          headers,
          rate: 3,
        });
      });

      retry('Multiple host in an upstream - 50:50 ratio', 3, async () => {
        const headers = {
          [TRACE_ID_HEADER]: '1vapigw-multiple-host-in-an-upstream-50-50-ratio',
          Authorization: authorization,
        };
        let responses: any = [];
        for (let i = 0; i < 50; i++) {
          responses.push(request.get('/rate-limiting-sanity/no-limit').set(headers));
        }
        responses = await Promise.all(responses);
        const vccResponses = responses.filter(r => r.body.requestHeaders.host.includes('vcc'));
        const nexmoResponses = responses.filter(r => r.body.requestHeaders.host.includes('nexmo'));
        expect(Math.abs(vccResponses.length - nexmoResponses.length)).toBeLessThanOrEqual(2);
      });
    });
  });
});
