import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service messages_wam
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
// * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo WAM', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorization;
    const wamAPIDomains = getHostDomainsList(servicesConf.api.messagesaws.wamApiHost[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
    });

    describe('whatsappManager', () => {
      describe.each(wamAPIDomains)('%s', wamDomain => {
        test('GET /v0.1/whatsapp-manager - Should return 404', async () => {
          const path = `/v0.1/whatsapp-manager`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-wam-test-1',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          if (selectedEnv === 'prod') {
            if (response.body.title) {
              expect(response.body.title).toEqual('Not Found');
            } else {
              // can be remvoved once OTT-4999 is deployed
              expect(response.body.message).toEqual('No message available');
            }
          }
        });

        test('GET /v0.1/whatsapp-manager - Bad auth - should return 401', async () => {
          const path = `/v0.1/whatsapp-manager`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-wam-test-2',
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers).expect(StatusCodes.UNAUTHORIZED);

          // dev is returning 401 with empty body
          if (selectedEnv !== 'dev') {
            expect(response.body.title).toEqual('Unauthorised');
          }
        });

        test('GET /v0.1/whatsapp-manager - Should return 404', async () => {
          const path = `/v0.1/whatsapp-manager`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-19',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          if (selectedEnv === 'prod') {
            if (response.body.title) {
              expect(response.body.title).toEqual('Not Found');
            } else {
              // can be remvoved once OTT-4999 is deployed
              expect(response.text).toContain('"path":"/v0.1/whatsapp-manager"');
              expect(response.text).toContain('"status":404');
            }
          }
          validateResponseHeaders(response.header);
        });

        test('PUT /v0.1/whatsapp-manager - Should return 404', async () => {
          const path = `/v0.1/whatsapp-manager`;
          const headers = {
            Host: wamDomain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-20',
            Authorization: authorization,
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
