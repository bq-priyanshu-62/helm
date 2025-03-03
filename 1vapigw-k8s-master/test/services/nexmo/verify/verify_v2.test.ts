import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service verify-v2
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @dev euw1
 * @prodNotifyChannel api-verify-alerts
 */

const service = 'verify-v2';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
  expect(header).not.toHaveProperty('x-identity-error-code');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const verifyDomain = getHostDomainsList(servicesConf.api.verify_v2[selectedRegion]);
    let authorizationNoQuota;
    let authorization;

    const TRACE_ID = '1vapigw-verify-v2-test-' + uuidv4();
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorizationNoQuota = await getSecret(servicesConf.api.authorization);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe(`${service} Services`, () => {
      describe.each(verifyDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        const path = `/v2/verify`;

        test('GET /v2/verify - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify - Should return 422 with invalid params', async () => {
          headers['Authorization'] = authorization;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Invalid params');
          validateResponseHeaders(response.header);
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/verify - Wrong Authorization - Should return 404', async () => {
          headers['Authorization'] = authorization;
          const response = await request.delete(path).set(headers);
          const expectedResponse = {
            title: 'No static resource v2/verify.',
            type: 'https://developer.vonage.com/api-errors#not-found',
          };
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/verify - Should return 404', async () => {
          headers['Authorization'] = authorization;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.post(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify - No Quota - Should return 401', async () => {
          headers['Authorization'] = authorizationNoQuota;

          const response = await request.post(path).set(headers);

          const expectedResponse = {
            detail: 'Quota Exceeded - rejected',
            instance: TRACE_ID,
            title: 'Quota Exceeded',
            type: 'https://developer.nexmo.com/api-errors#quota-exceeded',
          };

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);

          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/network-unblock - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.post(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
