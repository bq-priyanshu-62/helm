import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service tokboxTools
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @qa euw1 euc1 use1
 * @dev euw1 use1
 * @prodNotifyChannel ecosystem
 */

const service = 'tokboxTools';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const tokboxDomain = getHostDomainsList(servicesConf.api.tokboxTools[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Video Services`, () => {
      describe.each(tokboxDomain)('domain - %s', domain => {
        test('OPTIONS /video/inspector - Should redirect to Vonage login', async () => {
          const path = '/video/inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-1',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        });

        test('GET /video/inspector - Should redirect to Vonage login', async () => {
          const path = '/video/inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-2',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        });

        test('POST /video/inspector - Should redirect to Vonage login', async () => {
          const path = '/video/inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-3',
          };
          const response = await request.post(path).set(headers);
          //For toxbox envoy returns 405 in case the methods are not allowed
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        });

        test('OPTIONS /video/archive-inspector - Should redirect to Vonage login', async () => {
          const path = '/video/archive-inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-4',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /video/archive-inspector - Should redirect to Vonage login', async () => {
          const path = '/video/archive-inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-5',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        });

        test('OPTIONS /video/insights-api - Should redirect to Vonage login', async () => {
          const path = '/video/insights-api/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-6',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /video/insights-api - Should redirect to Vonage login', async () => {
          const path = '/video/insights-api/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-7',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        });

        test('OPTIONS /video/insights-api/graphql - Should redirect to Vonage login', async () => {
          const path = '/video/insights-api/graphql';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-8',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });
      });
    });
  });
});
