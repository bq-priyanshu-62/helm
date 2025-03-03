import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//The AWS services don't exist in QA at the moment only dev and prod so don't try and test the wrong region
/**
 * @service messages_aws
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
//  * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

const service = 'messages_aws';

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
    let authorizationNoQuota;
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorizationNoQuota = await getSecret(servicesConf.api.authorization);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe(`${service} Services`, () => {
      describe.each(messagesDomain)('domain - %s', messagesDomain => {
        test('GET /v0.1/messages/ping - Should return 200', async () => {
          const path = `/v0.1/messages/ping`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_v0_get_ping_' + uuidv4(),
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/messages/ping - Invalid Method - Should return 403', async () => {
          const path = `/v0.1/messages/ping`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_v0_post_ping_' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/wrongpath - wrong url - Should return 404', async () => {
          const path = `/v0.1/wrongpath`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_v0_wrong_url_' + uuidv4(),
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/messages - Invalid Auth - Should return 401', async () => {
          const traceId = '1vapigw-messagesaws_v0_invalid_auth_' + uuidv4();
          const path = `/v0.1/messages`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'invalid',
          };

          const response = await request.post(path).set(headers);

          const expectedResponse = {
            title: 'Unauthorised',
            detail: 'Invalid Token',
            instance: traceId,
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/messages - Invalid Payload - Service Should return 400', async () => {
          const path = `/v0.1/messages`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_v0_post_invalid_payload_' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.text).toContain("Your request parameters didn't validate.");
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/messages - Should return 403', async () => {
          const path = `/v0.1/messages`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_v0_get_403' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/messages - No Quota - Should return 400', async () => {
          const traceId = '1vapigw-messagesaws_v01_no_quota_' + uuidv4();
          const path = `/v0.1/messages`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorizationNoQuota,
          };

          const response = await request.post(path).set(headers);

          const expectedResponse = {
            title: 'Bad Request',
            detail: 'Insufficient balance, please check your nexmo account.',
            instance: traceId,
            type: 'https://developer.vonage.com/api-errors#low-balance',
          };
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.body).toMatchObject(expectedResponse);

          validateResponseHeaders(response.header);
        });

        test('POST /v1/messages - Invalid Payload - Should return 422', async () => {
          const path = `/v1/messages`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_invalid_payload' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('"type":"https://developer.nexmo.com/api-errors/messages#1150"');
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/messages - Should return 403', async () => {
          const path = `/v1/messages`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_v1_put_403' + uuidv4(),
            Authorization: authorization,
          };
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/messages - No Quota - Should return 402', async () => {
          const traceId = '1vapigw-messagesaws_v1_no_quota_' + uuidv4();
          const path = `/v1/messages`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorizationNoQuota,
          };

          const response = await request.post(path).set(headers);

          const expectedResponse = {
            title: 'Low balance',
            detail: 'This request could not be performed due to your account balance being low.',
            instance: traceId,
            type: 'https://developer.vonage.com/api-errors#low-balance',
          };
          expect(response.status).toEqual(StatusCodes.PAYMENT_REQUIRED);
          expect(response.body).toMatchObject(expectedResponse);

          validateResponseHeaders(response.header);
        });

        test('PATCH /v1/messages/ID - Unknown message - Should return 404', async () => {
          const path = `/v1/messages/unknown-message-id`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws_patch_unknown' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.patch(path).send({ status: 'read' }).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('Message with ID unknown-message-id not found');
          validateResponseHeaders(response.header);
        });

        test('GET /v1/messages/ping - GET Should return 200', async () => {
          const path = `/v1/messages/ping`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-v1_ping_get_200_' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/messages/ping - POST Should return 403', async () => {
          const path = `/v1/messages/ping`;
          const headers = {
            Host: messagesDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-v1_ping_post_403_' + uuidv4(),
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
