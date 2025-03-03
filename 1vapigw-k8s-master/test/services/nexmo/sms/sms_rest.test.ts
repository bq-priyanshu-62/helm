import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//These tests only work on regions with SMS-FE available. Removed qa and dev use1 until sms-fe is deployed there
/**
 * @service sms_rest
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2 apse3 mec1
 * @dev euw1
 * @prodNotifyChannel active:telco-alert passive:telco-alerts-icinga
 */

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo SMS Services REST', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const smsRestDomains = getHostDomainsList(servicesConf.api.sms_rest[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    beforeEach(async () => {
      /* TODO: remove the following once SMS legacy QA have fixed the LB issue.
      (LB pointing to two different instances of SMS on QA, which behave differently)
      */
      await new Promise(f => setTimeout(f, 1000));
    });

    !!smsRestDomains &&
      smsRestDomains.length > 0 &&
      describe('sms', () => {
        describe.each(smsRestDomains)('domain - %s', smsDomain => {
          test('GET /sms/pingwrong - wrong url - Should return 404', async () => {
            const path = `/sms/pingwrong`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-3',
              Authorization: 'Basic INVALID',
            };

            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toEqual(envoy404);
            validateResponseHeaders(response.header);
          });

          test('GET /sms/json - No auth - Should return 200', async () => {
            const path = `/sms/json`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-4',
            };

            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            const respObject = JSON.parse(response.text);
            expect(respObject['message-count']).toEqual('1');
            // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
            //expect(respObject.messages[0]['error-text']).toEqual('Missing api_key');
            //expect(respObject.messages[0].status).toEqual('2');
            validateResponseHeaders(response.header);
          });

          test('POST /sms/json - No auth - Should return 200', async () => {
            const path = `/sms/json`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-5',
            };

            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            const respObject = JSON.parse(response.text);
            expect(respObject['message-count']).toEqual('1');
            // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
            //expect(respObject.messages[0]['error-text']).toEqual('Missing api_key');
            //expect(respObject.messages[0].status).toEqual('2');
            validateResponseHeaders(response.header);
          });

          test('HEAD /sms/json - No auth - Should return 200', async () => {
            const path = `/sms/json`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-6',
            };

            const response = await request.head(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
          });

          test('PUT /sms/json - Should return 404', async () => {
            const path = `/sms/json`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-7',
            };

            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toEqual(envoy404);
            validateResponseHeaders(response.header);
          });

          test('GET /sms/xml - No auth - Should return 200', async () => {
            const path = `/sms/xml`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-8',
            };

            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            if (selectedEnv === 'prod') {
              expect(response.text).toContain("<messages count='1'>");
              // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
              //expect(respObject.messages[0]['error-text']).toEqual('Missing api_key');
              expect(response.text).toContain('<mt-submission-response>');
            }
            validateResponseHeaders(response.header);
          });

          test('HEAD /sms/xml - No auth - Should return 200', async () => {
            const path = `/sms/xml`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-9',
            };

            const response = await request.head(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
          });

          test('POST /sms/xml - No auth - Should return 200', async () => {
            const path = `/sms/xml`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-10',
            };

            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            if (selectedEnv === 'prod') {
              expect(response.text).toContain("<messages count='1'>");
              // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
              //expect(respObject.messages[0]['error-text']).toEqual('Missing api_key');
              expect(response.text).toContain('<mt-submission-response>');
            }
            validateResponseHeaders(response.header);
          });

          test('PUT /sms/xml - Should return 404', async () => {
            const path = `/sms/xml`;
            const headers = {
              Host: smsDomain,
              [TRACE_ID_HEADER]: '1vapigw-sms-rest-test-11',
            };

            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toEqual(envoy404);
            validateResponseHeaders(response.header);
          });
        });
      });
  });
});
