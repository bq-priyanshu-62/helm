import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service nii_rest
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @dev euw1
 * @prodNotifyChannel oss-alerts
 */

const service = 'nii_rest';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const TRACE_ID = '1vapigw-ni-rest-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };
    const niDomain = getHostDomainsList(servicesConf.api.ni_rest[selectedRegion]);
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(niDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /ni/json - Should return 200', async () => {
          const path = `/ni/json`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Invalid');
          validateResponseHeaders(response.header);
        });

        test('HEAD /ni/json - Should return 200', async () => {
          const path = `/ni/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('POST /ni/json - Should return 200', async () => {
          const path = `/ni/json`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Invalid');
          validateResponseHeaders(response.header);
        });

        test('PATCH /ni/json - Should return 403', async () => {
          const path = `/ni/json`;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /ni/xml - Should return 200', async () => {
          const path = `/ni/xml`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Invalid');
          validateResponseHeaders(response.header);
        });

        test('HEAD /ni/xml - Should return 200', async () => {
          const path = `/ni/xml`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('POST /ni/xml - Should return 200', async () => {
          const path = `/ni/xml`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Invalid');
          validateResponseHeaders(response.header);
        });

        test('PATCH /ni/xml - Should return 403', async () => {
          const path = `/ni/xml`;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
