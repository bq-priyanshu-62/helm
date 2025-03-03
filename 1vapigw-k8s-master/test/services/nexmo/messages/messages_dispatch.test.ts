import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service messages_dispatch
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
//  * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

const service = 'messages_dispatch';

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
    let authorizationNoQuota;
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorizationNoQuota = await getSecret(servicesConf.api.authorization);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe(`${service} Services`, () => {
      describe.each(messagesDomains)('domain - %s', domain => {
        test('GET /v0.1/dispatch/ping - Should return 200', async () => {
          const path = `/v0.1/dispatch/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-dispatch_v01_valid_ping_' + uuidv4(),
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/dispatch/ping - Should return 403', async () => {
          const path = `/v0.1/dispatch/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-dispatch_v01_invalid_method_ping_' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/dispatch - Invalid Auth - Should return 401', async () => {
          const traceId = '1vapigw-dispatch_v01_invalid_auth_' + uuidv4();
          const path = `/v0.1/dispatch`;
          const headers = {
            Host: domain,
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

        test('POST /v0.1/dispatch - Passes API GW checks - Should reach service and return 400', async () => {
          const path = `/v0.1/dispatch`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-dispatch_v01_valid_checks_' + uuidv4(),
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.text).toContain('"reason":"The workflow JSON Object cannot be empty"');
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/dispatch - Should return 403', async () => {
          const path = `/v0.1/dispatch`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-dispatch_v01_invalid_method_' + uuidv4(),
            Authorization: authorization,
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/dispatch - No Quota - Should return 400', async () => {
          const traceId = '1vapigw-dispatch_v01_no_quota_' + uuidv4();
          const path = `/v0.1/dispatch`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorizationNoQuota,
          };

          const response = await request.post(path).set(headers);

          const expectedResponse = {
            type: 'https://developer.vonage.com/api-errors',
            title: "Your request parameters didn't validate.",
            detail: 'Found errors validating 1 of your submitted parameters.',
            instance: traceId,
            invalid_parameters: [
              {
                name: 'balance',
                reason: 'Insufficient balance, please check your nexmo account.',
              },
            ],
          };
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.body).toMatchObject(expectedResponse);

          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
