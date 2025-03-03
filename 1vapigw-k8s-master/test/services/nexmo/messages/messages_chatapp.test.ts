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
 * @service messages_chatapp
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
//  * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

const service = 'messages_chatapp';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const messagesDomain = getHostDomainsList(servicesConf.api.messagesaws.host[selectedRegion]);
    const messagesDomains = Array.from(new Set(messagesDomain));
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
    });

    describe(`${service} Services`, () => {
      describe.each(messagesDomains)('domain - %s', domain => {
        // ##### /beta/chatapp-accounts
        test('GET /beta/chatapp-accounts - Should return 200', async () => {
          const path = `/beta/chatapp-accounts`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messages-test-10',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);

          if (selectedEnv != 'qa') {
            expect(response.status).toEqual(StatusCodes.OK);
            expect(response.text).toContain('"page_size":20,');
          } else {
            if (domain == 'api-eu-4.qa.v1.vonagenetworks.net') {
              //Service is not availble for this host
              expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
              expect(response.text).toContain('<title>503 Service Temporarily Unavailable</title>');
            } else {
              expect(response.text).toEqual('{"title":"Unauthorised","detail":"Invalid Token"}');
              expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            }
          }

          validateResponseHeaders(response.header);
        });

        test('POST /beta/chatapp-accounts/foo - Should return 401', async () => {
          const path = `/beta/chatapp-accounts/foo`;
          const traceId = '1vapigw-messagesaws-test-' + uuidv4();
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'Basic invalid',
          };

          const response = await request.post(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            detail: 'You did not provide correct credentials.',
            instance: traceId,
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('COPY /beta/chatapp-accounts - Should return 403', async () => {
          const path = `/beta/chatapp-accounts`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-14',
            Authorization: authorization,
          };
          const response = await request.copy(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        // ##### /beta/chatapp-accounts/ping

        test('GET /beta/chatapp-accounts/ping - Should return 200', async () => {
          const path = `/beta/chatapp-accounts/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-13',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);

          if (domain == 'api-eu-4.qa.v1.vonagenetworks.net') {
            //Service is not availble for this host
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            expect(response.text).toContain('<title>503 Service Temporarily Unavailable</title>');
          } else {
            expect(response.status).toEqual(StatusCodes.OK);
            //expect(response.text).toContain('pong');
          }

          validateResponseHeaders(response.header);
        });

        test('POST /beta/chatapp-accounts/ping - Should return 403', async () => {
          const path = `/beta/chatapp-accounts/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-13',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        // ##### /chatapp/profiles

        test('GET /chatapp/profiles - Should return 404', async () => {
          const path = `/chatapp/profiles`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-15',
            Authorization: authorization,
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('GET /chatapp/profiles/123 - Invalid Auth - Should return 401', async () => {
          const path = `/chatapp/profiles`;
          const traceId = '1vapigw-messagesaws-test-chatapp-profiles-401-' + uuidv4();
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'Basic invalid',
          };

          const response = await request.get(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            detail: 'You did not provide correct credentials.',
            instance: traceId,
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /chatapp/profiles - Should return 403', async () => {
          const path = `/chatapp/profiles`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-16',
            Authorization: authorization,
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        // ##### /chatapp/profiles/ping

        test('GET /chatapp/profiles/ping - Should return 200', async () => {
          const path = `/chatapp/profiles/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-15',
            Authorization: authorization,
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /chatapp/profiles/ping - Should return 403', async () => {
          const path = `/chatapp/profiles/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-15',
            Authorization: authorization,
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
