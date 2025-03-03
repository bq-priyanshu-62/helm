import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
const retry = require('jest-retries');
import { defaultRequest, retryFor429 } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Disabled in QA - this points to the Atmos services now which only exist in dev and prod at the moment
// re-enable this once Atmos QA is up and running
/**
 * @service messages_sandbox
 * @lob nexmo
 * @prod euw1 euc1
//  * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

const service = 'messages_sandbox';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    let authorizationNoQuota = servicesConf.api.authorization;
    let authorization = servicesConf.api.hasQuotaAuthorization;

    const messageV0ValidPayload = {
      to: {
        type: 'sms',
        number: '447722334455',
      },
      from: {
        type: 'sms',
        number: '447722334455',
      },
      message: {
        content: {
          type: 'text',
          text: 'test Text message',
        },
      },
    };

    const messagesV1ValidPayload = {
      to: '447722334455',
      from: '447722334455',
      channel: 'sms',
      message_type: 'text',
      text: 'test Text message',
    };

    const sandboxDomain = getHostDomainsList(servicesConf.api.messagesaws.sandboxHost[selectedRegion]);
    const sandboxRateLimitPerSecond = servicesConf.api.messagesaws.sandboxRateLimitPerSecond;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorizationNoQuota = await getSecret(servicesConf.api.authorization);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe(`${service} Services`, () => {
      describe.each(sandboxDomain)('domain - %s', domain => {
        test('POST /v0.1/messages - Should return 200', async () => {
          const path = `/v0.1/messages`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagessandbox_v01_success_' + uuidv4(),
            Authorization: authorization,
          };

          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /v0.1/messages - Should return 404', async () => {
          const path = `/v0.1/messages`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagessandbox_v01_put_not_found_' + uuidv4(),
            Authorization: authorization,
          };
          const response = await retryFor429(request.put(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/messages - No Quota - Should return 400', async () => {
          const traceId = '1vapigw-messagessandbox_v01_no_quota_' + uuidv4();
          const path = `/v0.1/messages`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorizationNoQuota,
          };

          const response = await request.post(path).send(messageV0ValidPayload).set(headers);

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

        test('POST /v1/messages - No Quota - Should return 402', async () => {
          const traceId = '1vapigw-messagessandbox_v1_no_quota_' + uuidv4();
          const path = `/v1/messages`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorizationNoQuota,
          };

          const response = await request.post(path).send(messagesV1ValidPayload).set(headers);

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

        test('POST /v0.1/messages - Invalid Auth - Should return 401', async () => {
          const traceId = '1vapigw-messagessandbox_v01_invalid_auth_' + uuidv4();

          const path = `/v0.1/messages`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'invalid',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          const expectedResponse = {
            title: 'Unauthorised',
            detail: 'Invalid Token',
            instance: traceId,
          };
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/messages - Invalid Auth - Should return 401', async () => {
          const traceId = '1vapigw-messagessandbox_v1_invalid_auth_' + uuidv4();

          const path = `/v1/messages`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'invalid',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          const expectedResponse = {
            title: 'Unauthorised',
            detail: 'Invalid Token',
            instance: traceId,
          };
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
