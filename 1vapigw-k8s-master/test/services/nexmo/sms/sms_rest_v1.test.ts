import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//These tests only work in environments with SMS-FE deployed. Removed from QA until sms-fe is released there.
/**
 * @service sms_rest_v1
 * @lob nexmo
 * @prod euw1 euc1
 * @dev euw1
 * @prodNotifyChannel active:telco-alert passive:telco-alerts-icinga
 */

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo SMS v1', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const smsApiDomains = getHostDomainsList(servicesConf.api.sms_api[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    beforeEach(async () => {
      /* TODO: remove the following once SMS legacy QA have fixed the LB issue.
      (LB pointing to two different instances of SMS on QA, which behave differently)
      */
      await new Promise(f => setTimeout(f, 1000));
    });

    describe('/v1/sms', () => {
      describe.each(smsApiDomains)('domain - %s', smsApiDomain => {
        test('GET /v1/sms/xml - No auth - Should return 200', async () => {
          const path = `/v1/sms/xml`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-1',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          if (selectedEnv === 'prod') {
            expect(response.text).toContain("<messages count='1'>");
            // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
            // expect(response.text).toContain('<errorText>Missing api_key</errorText>');
            expect(response.text).toContain('<mt-submission-response>');
          }
          validateResponseHeaders(response.header);
        });

        test('HEAD /v1/sms/xml - No auth - Should return 200', async () => {
          const path = `/v1/sms/xml`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-2',
          };

          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/sms/xml - No auth - Should return 200', async () => {
          const path = `/v1/sms/xml`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-3',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          if (selectedEnv === 'prod') {
            expect(response.text).toContain("<messages count='1'>");
            // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
            // expect(response.text).toContain('<errorText>Missing api_key</errorText>');
            expect(response.text).toContain('<mt-submission-response>');
          }
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/sms/xml - Should return 404', async () => {
          const path = `/v1/sms/xml`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-4',
          };

          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        //###### /v1/sms/json

        test('GET /v1/sms/json - No auth - Should return 200', async () => {
          const path = `/v1/sms/json`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-5',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          const respObject = JSON.parse(response.text);
          expect(respObject['message-count']).toEqual('1');
          // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
          // expect(respObject.messages[0]['error-text']).toEqual('Missing api_key');
          // expect(respObject.messages[0].status).toEqual('2');
          validateResponseHeaders(response.header);
        });

        test('HEAD /v1/sms/json - No auth - Should return 200', async () => {
          const path = `/v1/sms/json`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-2',
          };

          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/sms/json - No auth - Should return 200', async () => {
          const path = `/v1/sms/json`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-6',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          const respObject = JSON.parse(response.text);
          expect(respObject['message-count']).toEqual('1');
          // Bug in Legacy SMS it toggles the response between status Missing api_key and Bad credentials
          // expect(respObject.messages[0]['error-text']).toContain('Missing api_key');
          // expect(respObject.messages[0].status).toEqual('2');
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/sms/json - Should return 404', async () => {
          const path = `/v1/sms/json`;
          const headers = {
            Host: smsApiDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-1v-test-4',
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
