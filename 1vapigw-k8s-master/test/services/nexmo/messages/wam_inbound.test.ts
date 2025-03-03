import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// service isn;t available in qa just dev and prod
/**
 * @service messages_inboundWam
 * @lob nexmo
 * @prod euw1 euc1
//  * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

const service = 'messages_inboundWam';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    const wamDedicatedDomain = getHostDomainsList(servicesConf.api.messagesaws.wamHost[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(wamDedicatedDomain)('domain - %s', domain => {
        test('GET /inbound - Should return 404, no auth', async () => {
          const path = `/inbound`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-21',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          if (response.body.title) {
            expect(response.body.title).toEqual('Not Found');
          } else {
            expect(response.text).toContain('"message":"No message available"');
          }
          validateResponseHeaders(response.header);
        });

        test('PUT /inbound - Should return 403, no auth', async () => {
          const path = `/inbound`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-21',
          };
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('GET /public - Should return 404, no auth', async () => {
          const path = `/public`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-22',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('PUT /public - Should return 403, no auth', async () => {
          const path = `/public`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-messagesaws-test-22',
          };
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
