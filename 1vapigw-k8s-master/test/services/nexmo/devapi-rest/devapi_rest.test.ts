import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import qs from 'querystring';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service devapi_rest
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
//  * @qa euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1 use1
 * @prodNotifyChannel api-dashboard-monitoring
 */

const service = 'devapi_rest';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const devapiDomain = getHostDomainsList(servicesConf.api.devapi_rest[selectedRegion]);
    let testAccount;
    let testPassword;
    let testAccountAlt;
    let testPasswordAlt;

    let dtAccount;
    let dtPasswrd;

    beforeAll(async () => {
      testAccount = await getSecret(servicesConf.api.devapi_rest[selectedRegion].testAccount);
      testPassword = await getSecret(servicesConf.api.devapi_rest[selectedRegion].testPassword);
      testAccountAlt = await getSecret(servicesConf.api.devapi_rest[selectedRegion].testAccountAlt);
      testPasswordAlt = await getSecret(servicesConf.api.devapi_rest[selectedRegion].testPasswordAlt);
      dtAccount = await getSecret(servicesConf.api.dtTestAccount);
      dtPasswrd = await getSecret(servicesConf.api.dtTestPassword);
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(devapiDomain)('domain - %s', domain => {
        const TRACE_ID = '1vapigw-devapi-test';
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: TRACE_ID,
        };

        test('GET /account/get-balance - Should return 200', async () => {
          const params = {
            api_key: testAccount,
            api_secret: testPassword,
          };
          const path = `/account/get-balance?` + qs.stringify(params);
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /account/settings - Should return 200', async () => {
          const payload = {
            api_key: testAccountAlt,
            api_secret: testPasswordAlt,
          };
          const path = `/account/settings`;
          const response = await retryFor429(request.post(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.body).not.toBeNull();
          expect(response.text).toContain('mo-callback-url');
          validateResponseHeaders(response.header);
        });

        test('PUT /account/settings - Should return 403', async () => {
          const payload = {
            api_key: testAccount,
            api_secret: testPassword,
          };
          const path = `/account/settings`;
          const response = await retryFor429(request.put(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /search/message - Should return 404', async () => {
          const params = {
            api_key: testAccountAlt,
            api_secret: testPasswordAlt,
            id: 1234,
          };
          const path = `/search/message?` + qs.stringify(params);
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('POST /search/message - Should return 404', async () => {
          const params = {
            id: 1234,
          };
          const payload = {
            api_key: testAccount,
            api_secret: testPassword,
          };
          const path = `/search/message?` + qs.stringify(params);
          const response = await retryFor429(request.post(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('PUT /search/message - Should return 404', async () => {
          const params = {
            id: 1234,
          };
          const payload = {
            api_key: testAccountAlt,
            api_secret: testPasswordAlt,
          };
          const path = `/search/message?` + qs.stringify(params);
          const response = await retryFor429(request.put(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('POST /pricing/gb/jsonp - Should return 405', async () => {
          const path = `/pricing/gb/jsonp`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          validateResponseHeaders(response.header);
        });

        test('PUT /pricing/gb/jsonp - Should return 403', async () => {
          const path = `/pricing/gb/jsonp`;
          const response = await retryFor429(request.put(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /number/buy - Deutsche Telekom Should return 403', async () => {
          const path = `/number/buy/${dtAccount}/${dtPasswrd}/GB/1234`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('403 Forbidden');
          validateResponseHeaders(response.header);
        });
        test('POST /number/buy - NOT - Deutsche Telekom Should return 420', async () => {
          const path = `/number/buy/${testAccount}/${testPassword}/GB/1234`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(420);
          expect(response.text).toContain('420');
          validateResponseHeaders(response.header);
        });

        test('POST /number/cancel - Deutsche Telekom Should return 403', async () => {
          const path = `/number/cancel/${dtAccount}/${dtPasswrd}/GB/1234`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('403 Forbidden');
          validateResponseHeaders(response.header);
        });
        test('POST /number/cancel - NOT-Deutsche Telekom Should return 420', async () => {
          const path = `/number/cancel/${testAccount}/${testPassword}/GB/1234`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(420);
          expect(response.text).toContain('420');
          validateResponseHeaders(response.header);
        });

        test('GET /number/search - Deutsche Telekom Should return 403', async () => {
          const path = `/number/search/${dtAccount}/${dtPasswrd}/GB`;
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('403 Forbidden');
          validateResponseHeaders(response.header);
        });
        test('GET /number/search - Deutsche Telekom Should return 200', async () => {
          const path = `/number/search/${testAccount}/${testPassword}/GB`;
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('count');
          validateResponseHeaders(response.header);
        });

        test('POST /number/update - Deutsche Telekom Should return 403', async () => {
          const path = `/number/update/${dtAccount}/${dtPasswrd}/GB/1234`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('403 Forbidden');
          validateResponseHeaders(response.header);
        });
        test('POST /number/update - NOT - Deutsche Telekom Should return 420', async () => {
          const path = `/number/update/${testAccount}/${testPassword}/GB/1234`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(420);
          expect(response.text).toContain('420');
          validateResponseHeaders(response.header);
        });
        test('GET /account/numbers - Deutsche Telekom Should return 403', async () => {
          const path = `/account/numbers/${dtAccount}/${dtPasswrd}`;
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('403 Forbidden');
          validateResponseHeaders(response.header);
        });
        test('GET /account/numbers - Not-Deutsche Telekom Should return 200', async () => {
          const path = `/account/numbers/${testAccount}/${testPassword}`;
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /number/search - Should return 200', async () => {
          const path = `/number/search/${testAccount}/${testPassword}/GB`;
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /number/update - Should return 401', async () => {
          const path = `/number/update/fakeAccount/fakePassword/GB/1234`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          const decodedJsonResponse = JSON.parse(response.text);
          expect(decodedJsonResponse.title).toEqual('Unauthorized');
          expect(decodedJsonResponse.detail).toEqual('You did not provide correct credentials.');
          validateResponseHeaders(response.header);
        });

        test('PUT /number/update - Should return 403', async () => {
          const path = `/number/update/fakeAccount/fakePassword/GB/1234`;
          const response = await retryFor429(request.put(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /phonebook/check - Should return 401', async () => {
          const path = `/phonebook/check/fakeAccount/fakePassword/GB`;
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          const decodedJsonResponse = JSON.parse(response.text);
          expect(decodedJsonResponse.title).toEqual('Unauthorized');
          expect(decodedJsonResponse.detail).toEqual('You did not provide correct credentials.');
          validateResponseHeaders(response.header);
        });

        test('GET /phonebook/check - Should return 403', async () => {
          const path = `/phonebook/check/fakeAccount/fakePassword/GB`;
          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('PUT /phonebook/check - Should return 403', async () => {
          const path = `/phonebook/check/fakeAccount/fakePassword/GB`;
          const response = await retryFor429(request.put(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
