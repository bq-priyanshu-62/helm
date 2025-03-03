import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service cost
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
//  * @qa euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel api-system-services-notify
 */

const service = 'cost';

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

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('HEAD /cost/ping - Should return 200', async () => {
          const path = `/cost/ping`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /cost/ping - Should return 200', async () => {
          const path = `/cost/ping`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /cost/ping - wrong url - Should return 403', async () => {
          const path = `/cost/ping`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /cost/ping-nonsense - wrong url - Should return 404', async () => {
          const path = `/cost/ping-nonsense`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('HEAD /cost/update/json - Should return 403', async () => {
          const path = `/cost/update/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('POST /cost/update/json - Should return 400', async () => {
          const path = `/cost/update/json`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          validateResponseHeaders(response.header);
        });

        test('HEAD /cost/delete/json - Should return 403', async () => {
          const path = `/cost/delete/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('POST /cost/delete/json - Should return 400', async () => {
          const path = `/cost/delete/json`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
