import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service auditevent
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1 use1
 * @prodNotifyChannel api-dashboard-monitoring
 */

const service = 'auditevent';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const costDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);
    let authorization;
    let headers = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };

    beforeAll(async () => {
      authorization = await getSecret(servicesConf.api.authorization);
      request = defaultRequest(host);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('HEAD /beta/audit/ping - Should return 200/404', async () => {
          const path = `/beta/audit/ping`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/audit/ping - Should return 200/404', async () => {
          const path = `/beta/audit/ping`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('DELETE /beta/audit/ping - Should return 403', async () => {
          const path = `/beta/audit/ping`;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/audit/ping-nonsense - wrong url - Should return 404', async () => {
          const path = `/beta/audit/ping-nonsense`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('HEAD /beta/audit/events - Should return 200', async () => {
          const path = `/beta/audit/events`;
          const response = await request.head(path).set(headers);
          expect([StatusCodes.OK, StatusCodes.UNAUTHORIZED]).toContain(response.status);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/audit/events - Should return 200', async () => {
          const path = `/beta/audit/events`;
          const response = await request.get(path).set(headers);
          // expect(response.status).toEqual(StatusCodes.OK);
          expect([StatusCodes.OK, StatusCodes.UNAUTHORIZED]).toContain(response.status);
          if (response.status === StatusCodes.UNAUTHORIZED) {
            expect(response.text).toContain('Quota Exceeded');
          }
          validateResponseHeaders(response.header);
        });

        test('OPTIONS /beta/audit/events - Should return 200', async () => {
          const path = `/beta/audit/events`;
          const response = await request.options(path).set(headers);
          expect([StatusCodes.OK, StatusCodes.UNAUTHORIZED]).toContain(response.status);

          validateResponseHeaders(response.header);
        });

        test('DELETE /beta/audit/events - Should return 403', async () => {
          const path = `/beta/audit/events`;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
