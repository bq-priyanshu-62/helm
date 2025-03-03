import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service messages_wam_ca
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
// * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo WAM Cloud API', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorization;
    const wamAPIDomains = getHostDomainsList(servicesConf.api.messagesaws.wamCaApiHost[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
    });

    describe('whatsappManagerCloudApi', () => {
      describe.each(wamAPIDomains)('%s', wamDomain => {
        test('GET /v1/channel-manager/whatsapp/numbers/987123/profile - Should return 404', async () => {
          const path = `/v1/channel-manager/whatsapp/numbers/987123/profile`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-wam-ca-test-' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('"detail":"Number 987123 was not found"');
        });

        test('PATCH /v1/channel-manager/whatsapp/numbers/987123/profile - Should return 404', async () => {
          const path = `/v1/channel-manager/whatsapp/numbers/987123/profile`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-wam-ca-test-' + uuidv4(),
            Authorization: authorization,
          };
          const payload = {
            address: 'address',
            about: 'about',
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('"detail":"Number 987123 was not found"');
        });

        test('GET /v2/whatsapp-manager/wabas/222/templates - Should return 404', async () => {
          const path = `/v2/whatsapp-manager/wabas/222/templates`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-wam-ca-test-' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          if (selectedEnv === 'prod') {
            expect(response.text).toContain('"detail":"Waba was not found"');
          }
        });

        test('GET /v2/whatsapp-manager/wabas/222/templates - Bad auth - should return 401', async () => {
          const path = `/v2/whatsapp-manager/wabas/222/templates`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-wam-ca-test-get-401-' + uuidv4(),
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers).expect(StatusCodes.UNAUTHORIZED);

          // dev is returning 401 with empty body
          if (selectedEnv !== 'dev') {
            expect(response.body.title).toEqual('Unauthorised');
          }
        });

        test('POST /v2/whatsapp-manager/media/uploads - success - should reach the service and return 422', async () => {
          const path = `/v2/whatsapp-manager/media/uploads`;
          const traceId = '1vapigw-wam-ca-test-post-upload' + uuidv4();
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorization,
            Accept: '*/*',
          };

          const response = await request.post(path).set(headers).attach('mediafile', 'test/data/big-file.png');

          const expectedResponse = {
            detail: 'The required query parameter "file_type" is missing.',
            title: 'Missing required parameter',
            instance: traceId,
          };

          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.body).toMatchObject(expectedResponse);
        });

        test('POST /v2/whatsapp-manager/media/uploads - unauthorized - should return 401', async () => {
          const path = `/v2/whatsapp-manager/media/uploads`;
          const traceId = '1vapigw-wam-ca-test-post-upload-401-' + uuidv4();
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'Basic Invalid',
            'Content-Type': 'multipart/form-data',
            Accept: '*/*',
          };

          const response = await request.post(path).set(headers);

          const expectedResponse = {
            title: 'Unauthorized',
            detail: 'You did not provide correct credentials.',
            instance: traceId,
          };

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
        });

        test('POST /v2/whatsapp-manager/solutions/123/wabas/222/numbers - should return 404', async () => {
          const path = `/v2/whatsapp-manager/solutions/123/wabas/222/numbers`;
          const traceId = '1vapigw-wam-ca-test-post-isv-404-' + uuidv4();
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorization,
            'Content-Type': 'application/json',
            Accept: '*/*',
          };

          const payload = {
            phone_number: '447900000000',
            api_key: 'abc123',
          };

          const response = await request.post(path).set(headers).send(payload);

          const expectedResponse = {
            title: 'Not Found',
            detail: 'Solution 123 was not found',
            instance: traceId,
          };

          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.body).toMatchObject(expectedResponse);
        });

        test('POST /v2/whatsapp-manager/solutions/123/wabas/222/numbers - unauthorized - should return 401', async () => {
          const path = `/v2/whatsapp-manager/solutions/123/wabas/222/numbers`;
          const traceId = '1vapigw-wam-ca-test-post-isv-401-' + uuidv4();
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'Basic Invalid',
            'Content-Type': 'application/json',
            Accept: '*/*',
          };

          const response = await request.post(path).set(headers);

          const expectedResponse = {
            title: 'Unauthorised',
            detail: 'Invalid Token',
          };

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
        });

        test('DELETE /v2/whatsapp-manager/solutions/123/wabas/222/numbers/333 - should return 404', async () => {
          const path = `/v2/whatsapp-manager/solutions/123/wabas/222/numbers/333`;
          const traceId = '1vapigw-wam-ca-test-sol-waba-number-del-404-' + uuidv4();
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorization,
          };

          const response = await request.delete(path).set(headers);

          const expectedResponse = {
            title: 'Not Found',
            detail: 'Number 333 was not found',
            instance: traceId,
          };

          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.body).toMatchObject(expectedResponse);
        });
      });
    });
  });
});
