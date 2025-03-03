import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import qs from 'querystring';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//NOTE: These tests have been added to validate that the sms application returns status 200 through gateway even for invalid auth
//This functionality was moved out of identity into gloo, the sms response behaviour should be same and these tests check through the gateway
//Separate tests will be written for identity for the same request

/**
 * @service sms_rest_fe_auth
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

function expectedJsonResponse(code, message) {
  return `{
    "message-count": "1",
    "messages": [{
        "status": "${code}",
        "error-text": "${message}"
    }]
  }`;
}

function expectedXmlResponse(code, message) {
  return (
    "<?xml version='1.0' encoding='UTF-8' ?>" +
    '<mt-submission-response>' +
    "<messages count='1'>" +
    '<message>' +
    `<status>${code}</status>` +
    `<errorText>${message}</errorText>` +
    '</message>' +
    '</messages>' +
    '</mt-submission-response>'
  );
}

describe('Nexmo SMS-FE', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const smsRestDomains = getHostDomainsList(servicesConf.api.sms_rest[selectedRegion]);
    let noQuotaApiKey;

    beforeAll(async () => {
      request = defaultRequest(host);
      noQuotaApiKey = await getSecret(servicesConf.api.testAccount);
    });

    beforeEach(async () => {
      /* TODO: remove the following once SMS legacy QA have fixed the LB issue.
      (LB pointing to two different instances of SMS on QA, which behave differently)
      */
      await new Promise(f => setTimeout(f, 1000));
    });

    !!smsRestDomains &&
      smsRestDomains.length > 0 &&
      describe('Invalid Auth', () => {
        describe.each(smsRestDomains)('domain - %s', smsDomain => {
          const headers = {
            Host: smsDomain,
            'x-original-client-ip-address': '0.0.0.0',
            'x-api': 'sms-fe',
            'x-sms-compatibility-mode': 'TRUE',
            'Content-Type': 'text/html',
          };

          // ##### /sms/json

          test('POST /sms/json - Should return 200', async () => {
            const params = {
              username: 'test',
            };
            const path = `/sms/json?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(JSON.stringify(JSON.parse(response.text))).toEqual(
              JSON.stringify(JSON.parse(expectedJsonResponse(2, 'Your request is incomplete and missing some mandatory parameters'))),
            );
            validateResponseHeaders(response.header);
          });

          test('POST /sms/json - Should return 200', async () => {
            const params = {
              username: 'test',
              password: '',
            };
            const path = `/sms/json?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(JSON.stringify(JSON.parse(response.text))).toEqual(
              JSON.stringify(JSON.parse(expectedJsonResponse(2, 'Your request is incomplete and missing some mandatory parameters'))),
            );
            validateResponseHeaders(response.header);
          });

          test('POST /sms/json - Wrong password - Should return 200', async () => {
            const params = {
              username: 'test',
              password: 'wrong pass',
            };
            const path = `/sms/json?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(JSON.stringify(JSON.parse(response.text))).toEqual(JSON.stringify(JSON.parse(expectedJsonResponse(4, 'Bad Credentials'))));
            validateResponseHeaders(response.header);
          });

          test('POST /sms/json - Wrong password - Should return 200', async () => {
            const params = {
              username: 'test',
              password: 'test',
            };
            const path = `/sms/json?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(JSON.stringify(JSON.parse(response.text))).toEqual(JSON.stringify(JSON.parse(expectedJsonResponse(4, 'Bad Credentials'))));
            validateResponseHeaders(response.header);
          });

          test('POST /sms/json - with sig - Should return 200', async () => {
            const params = {
              username: 'test',
              password: 'test',
              from: '1234',
              sig: 'inv',
            };
            const path = `/sms/json?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(JSON.stringify(JSON.parse(response.text))).toEqual(JSON.stringify(JSON.parse(expectedJsonResponse(14, 'Invalid Signature'))));
            validateResponseHeaders(response.header);
          });

          // ##### /sms/xml

          test('POST /sms/xml sss - Should return 200', async () => {
            const params = {
              username: 'test',
            };
            const path = `/sms/xml?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toEqual(expectedXmlResponse(2, 'Your request is incomplete and missing some mandatory parameters'));
            validateResponseHeaders(response.header);
          });

          test('POST /sms/xml - Should return 200', async () => {
            const params = {
              username: 'test',
              password: '',
            };
            const path = `/sms/xml?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toEqual(expectedXmlResponse(2, 'Your request is incomplete and missing some mandatory parameters'));
            validateResponseHeaders(response.header);
          });

          test('POST /sms/xml - Wrong password - Should return 200', async () => {
            const params = {
              username: 'test',
              password: 'wrong pass',
            };
            const path = `/sms/xml?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toEqual(expectedXmlResponse(4, 'Bad Credentials'));
            validateResponseHeaders(response.header);
          });

          test('POST /sms/xml - Wrong password - Should return 200', async () => {
            const params = {
              username: 'test',
              password: 'test',
            };
            const path = `/sms/xml?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toEqual(expectedXmlResponse(4, 'Bad Credentials'));
            validateResponseHeaders(response.header);
          });

          test('POST /sms/xml - Wrong password with 0 balance - Should return 200', async () => {
            const params = {
              username: noQuotaApiKey,
              password: 'invalid',
              from: '12345',
            };
            const path = `/sms/xml?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toEqual(expectedXmlResponse(4, 'Bad Credentials'));
            validateResponseHeaders(response.header);
          });

          test('POST /sms/xml - with sig - Should return 200', async () => {
            const params = {
              username: 'test',
              password: 'test',
              from: '1234',
              sig: 'inv',
            };
            const path = `/sms/xml?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toEqual(expectedXmlResponse(14, 'Invalid Signature'));
            validateResponseHeaders(response.header);
          });
        });
      });
  });
});
