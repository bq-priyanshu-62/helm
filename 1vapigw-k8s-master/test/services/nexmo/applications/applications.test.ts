import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import qs from 'querystring';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
//Applications service is currently deployed to Atmos in dev. This changes some of the test results so we split the test scripts.
//As the Atmos version is rolled out and the Softlayer version is deprecated we should migrate the other regions to this test set and deprecate the SL one

/**
 * @service applications
 * @lob nexmo
 * @prod apse1 apse2 euc1 euw1 use1 usw2
//  * @qa apse1 apse2 euc1 euw1 use1 usw2
 * @dev euw1
 * @prodNotifyChannel api-dashboard-monitoring
 */

const service = 'applications';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

function validateGatewayAuthFailure(response) {
  expect(response.detail).toEqual('You did not provide correct credentials.');
  expect(response.type).toEqual('https://developer.nexmo.com/api-errors#unauthorized');
  expect(response.title).toEqual('Unauthorized');
}

function validateApplicationAuthFailure(response) {
  expect(response.detail).toEqual('You did not provide correct credentials.');
  expect(response.type).toEqual('https://developer.nexmo.com/api-errors#unauthorized');
  expect(response.title).toEqual('Invalid credentials supplied');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const applicationsDomain = getHostDomainsList(servicesConf.api.applications.host[selectedRegion]);
    let authorization;
    let testAccount;
    let testPassword;

    beforeAll(async () => {
      authorization = await getSecret(servicesConf.api.applications.host[selectedRegion].authorization);
      testAccount = await getSecret(servicesConf.api.applications.host[selectedRegion].testAccount);
      testPassword = await getSecret(servicesConf.api.applications.host[selectedRegion].testPassword);
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(applicationsDomain)('domain - %s', domain => {
        test('GET /v1/applications - Should return 200', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const params = {
              api_key: testAccount,
              api_secret: testPassword,
            };
            const path = `/v1/applications?` + qs.stringify(params);
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-1',
            };
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toContain('page_size":50');
            validateResponseHeaders(response.header);
          }
        });

        test('POST /v1/applications - Invalid body - Should return 400', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const params = {
              api_key: testAccount,
              api_secret: testPassword,
            };
            const path = `/v1/applications?` + qs.stringify(params);
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-2',
              'Content-Type': 'application/json',
            };
            const body = '{}';
            const response = await request.post(path).set(headers).send(body);
            expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
            expect(response.text).toContain('"error_title":"Not a valid JSON format');
            validateResponseHeaders(response.header);
          }
        });

        test('PUT /v1/applications - Should return 405', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const params = {
              api_key: testAccount,
              api_secret: testPassword,
            };
            const path = `/v1/applications?` + qs.stringify(params);
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-3',
              'Content-Type': 'application/json',
            };
            const body = '{}';
            const response = await request.put(path).set(headers).send(body);
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            validateResponseHeaders(response.header);
          }
        });

        test('DELETE /v1/applications - Should return 405', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const params = {
              api_key: testAccount,
              api_secret: testPassword,
            };
            const path = `/v1/applications?` + qs.stringify(params);
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-4',
            };
            const response = await request.delete(path).set(headers);
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            validateResponseHeaders(response.header);
          }
        });

        test('GET /v1/applications - No auth - Should return 401', async () => {
          const path = `/v1/applications`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-5',
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers);
          const respObject = JSON.parse(response.text);
          validateGatewayAuthFailure(respObject);
          validateResponseHeaders(response.header);
        });

        test('LOCK /v1/applications - wrong method - Should return 403', async () => {
          const path = `/v1/applications`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-6',
            Authorization: 'Basic INVALID',
          };

          const response = await request.lock(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v1/application - wrong url - Should return 404', async () => {
          const path = `/v1/application`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-7',
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/applications - No auth - Should return 401', async () => {
          const path = `/v2/applications`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-8',
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          const respObject = JSON.parse(response.text);
          validateGatewayAuthFailure(respObject);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/applications - Valid auth - Should return 200', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const path = `/v2/applications`;
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-9',
              Authorization: authorization,
            };

            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
          }
        });

        test('POST /v2/applications - Invalid body - Should return 400', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const path = `/v2/applications?`;
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-10',
              Authorization: authorization,
              'Content-Type': 'application/json',
            };
            const body = '{}';
            const response = await request.post(path).set(headers).send(body);
            expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
            expect(response.text).toContain('"title":"Bad Request"');
            validateResponseHeaders(response.header);
          }
        });

        test('PUT /v2/applications - Should return 405', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const path = `/v2/applications?`;
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-11',
              Authorization: authorization,
              'Content-Type': 'application/json',
            };
            const body = '{}';
            const response = await request.put(path).set(headers).send(body);
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            validateResponseHeaders(response.header);
          }
        });

        test('DELETE /v2/applications - Should return 405', async () => {
          //auth tests can't work on dev use1 but will work everywhere else
          //The issue isthat the service relies on gateway auth and use is pointing to the service in prod
          //the gateway auth can't work across environments because of the auth signature
          if (selectedEnv == 'prod' || (selectedEnv == 'dev' && selectedRegion == 'euw1')) {
            const path = `/v2/applications?`;
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: '1vapigw-applications-test-12',
              Authorization: authorization,
            };
            const response = await request.delete(path).set(headers);
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            validateResponseHeaders(response.header);
          }
        });

        test('LOCK /v2/applications - wrong method - Should return 403', async () => {
          const path = `/v2/applications`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-13',
            Authorization: 'Basic INVALID',
          };

          const response = await request.lock(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/application - wrong url - Should return 404', async () => {
          const path = `/v2/application`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-14',
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('GET /v1/applications/ping -  Should return 200', async () => {
          const path = `/v1/applications/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-15',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/applications/ping - wrong method - Should return 403', async () => {
          const path = `/v1/applications/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-16',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/applications/ping -  Should return 200', async () => {
          const path = `/v2/applications/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-17',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/applications/ping - wrong method - Should return 403', async () => {
          const path = `/v2/applications/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-applications-test-18',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
