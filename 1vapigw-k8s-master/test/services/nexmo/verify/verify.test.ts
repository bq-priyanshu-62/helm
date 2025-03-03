import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Note that Verify in QA/Dev is moving to an Atmos account. At the moment it doesn't exist in Atmos so the tests here all fail
//re-enable as verify becomes available
/**
 * @service verify
 * @lob nexmo
 * @prod apse1 apse2 euw1 euc1 use1 usw2
//  * @qa apse1 apse2 euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-verify-alerts
 */

const service = 'verify';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const verifyDomain = getHostDomainsList(servicesConf.api.verify[selectedRegion]);
    let authorization;
    let api_key;
    let api_secret;

    const TRACE_ID = '1vapigw-verify-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      api_key = await getSecret(servicesConf.api.testAccount);
      api_secret = await getSecret(servicesConf.api.testPassword);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(verifyDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /verify/ping - Should return 200', async () => {
          const path = `/verify/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/ping - Should return 403', async () => {
          const path = `/verify/ping`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /verify - wrong url - Should return 404', async () => {
          const path = `/verify`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /verify/json - Should return 200', async () => {
          const path = `/verify/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/json - Should return 200', async () => {
          const path = `/verify/json`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/json - Should return 200', async () => {
          const path = `/verify/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/json - Should return 403', async () => {
          const path = `/verify/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/json - credentials in body Should return 200', async () => {
          const path = `/verify/json`;
          //credentials are in the payload this time
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };

          const response = await request.post(path).send(payload).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('POST /verify/json - no credentials Should return 200', async () => {
          const path = `/verify/json`;
          //no credentials
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('"error_text": "Missing api_key"');
          validateResponseHeaders(response.header);
        });

        test('POST /verify/xml - credentials in body Should return 200', async () => {
          const path = `/verify/xml`;
          //credentials are in the payload this time
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };

          const response = await request.post(path).send(payload).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('POST /verify/xml - no credentials Should return 200', async () => {
          const path = `/verify/xml`;
          //no credentials
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('<error_text>Missing api_key</error_text>');
          validateResponseHeaders(response.header);
        });

        test('GET /verify/xml - Should return 200', async () => {
          const path = `/verify/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/xml - Should return 200', async () => {
          const path = `/verify/xml`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/xml - Should return 200', async () => {
          const path = `/verify/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
        });

        test('PATCH /verify/xml - Should return 403', async () => {
          const path = `/verify/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /verify/psd2/json - Should return 200', async () => {
          const path = `/verify/psd2/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/psd2/json - Should return 200', async () => {
          const path = `/verify/psd2/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/psd2/json - Should return 200', async () => {
          const path = `/verify/psd2/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/psd2/json - Should return 403', async () => {
          const path = `/verify/psd2/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /verify/check/json - Should return 200', async () => {
          const path = `/verify/check/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/check/json - Should return 200', async () => {
          const path = `/verify/check/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/check/json - Should return 200', async () => {
          const path = `/verify/check/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/check/json - Should return 403', async () => {
          const path = `/verify/check/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /verify/check/xml - Should return 200', async () => {
          const path = `/verify/check/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/check/xml - Should return 200', async () => {
          const path = `/verify/check/xml`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/check/xml - Should return 200', async () => {
          const path = `/verify/check/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Your request is incomplete and missing the mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/check/xml - Should return 403', async () => {
          const path = `/verify/check/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /verify/confirm/json - Should return 200', async () => {
          const path = `/verify/confirm/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('<title>Error 404 </title>');
          expect(response.text).toContain('Powered by Jetty');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/confirm/json - Should return 200', async () => {
          const path = `/verify/confirm/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          //requires no auth
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toBeUndefined();
          validateResponseHeaders(response.header);
        });

        test('POST /verify/confirm/json - Should return 405', async () => {
          const path = `/verify/confirm/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          expect(response.text).toContain('HTTP method POST is not supported by this URL');
          expect(response.text).toContain('Powered by Jetty');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/confirm/json - Should return 403', async () => {
          const path = `/verify/confirm/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /verify/confirm/xml - Should return 404', async () => {
          const path = `/verify/confirm/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('<title>Error 404 </title>');
          expect(response.text).toContain('Powered by Jetty');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/confirm/xml - Should return 404', async () => {
          const path = `/verify/confirm/xml`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toBeUndefined();
          validateResponseHeaders(response.header);
        });

        test('POST /verify/confirm/xml - Should return 405', async () => {
          const path = `/verify/confirm/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          expect(response.text).toContain('HTTP method POST is not supported by this URL');
          expect(response.text).toContain('Powered by Jetty');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/confirm/xml - Should return 403', async () => {
          const path = `/verify/confirm/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /verify/control/json - Should return 200', async () => {
          const path = `/verify/control/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/control/json - Should return 200', async () => {
          const path = `/verify/control/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/control/json - Should return 200', async () => {
          const path = `/verify/control/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/control/json - Should return 403', async () => {
          const path = `/verify/control/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /verify/control/xml - Should return 200', async () => {
          const path = `/verify/control/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/control/xml - Should return 200', async () => {
          const path = `/verify/control/xml`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/control/xml - Should return 400', async () => {
          const path = `/verify/control/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing mandatory parameter');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/control/xml - Should return 403', async () => {
          const path = `/verify/control/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /verify/search/json - Should return 200', async () => {
          const path = `/verify/search/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('The Nexmo platform was unable to process this message');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/search/json - Should return 200', async () => {
          const path = `/verify/search/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/search/json - Should return 200', async () => {
          const path = `/verify/search/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('The Nexmo platform was unable to process this message');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/search/json - Should return 403', async () => {
          const path = `/verify/search/json`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /verify/search/xml - Should return 200', async () => {
          const path = `/verify/search/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.get(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('The Nexmo platform was unable to process this message');
          validateResponseHeaders(response.header);
        });

        test('HEAD /verify/search/xml - Should return 200', async () => {
          const path = `/verify/search/xml`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/search/xml - Should return 200', async () => {
          const path = `/verify/search/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('The Nexmo platform was unable to process this message');
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/search/xml - Should return 403', async () => {
          const path = `/verify/search/xml`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.patch(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
