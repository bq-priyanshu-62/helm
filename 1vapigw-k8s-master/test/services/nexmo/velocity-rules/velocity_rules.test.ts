import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service velocity-rules
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

const service = 'velocity-rules';

function validateResponseHeaders(header) {
  expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const vrDomain = getHostDomainsList(servicesConf.api.velocity_rules[selectedRegion]);
    let authorization;
    const TRACE_ID = '1vapigw-velocity-rules-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(vrDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /verify/network-unblock - Should return 403', async () => {
          const path = `/verify/network-unblock`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain(envoy403);
          validateResponseHeaders(response.header);
        });

        test('DELETE /verify/network-unblock - Should return 403', async () => {
          const path = `/verify/network-unblock`;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain(envoy403);
          validateResponseHeaders(response.header);
        });

        test('PATCH /verify/network-unblock - Should return 403', async () => {
          const path = `/verify/network-unblock`;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /verify/network-unblock, body {} - Should return 422 with invalid params', async () => {
          const path = `/verify/network-unblock`;
          // notice that empty payload gives 422, while incorrect fields give 400
          const payload = {};
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Submitted parameters were invalid');
          validateResponseHeaders(response.header);
        });

        test('POST /verify/network-unblock, body {foo:bar} - Should return 400 with invalid params', async () => {
          const path = `/verify/network-unblock`;
          // notice that empty payload gives 422, while incorrect fields give 400
          const payload = { foo: 'bar' };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.text).toContain('Invalid JSON');
          validateResponseHeaders(response.header);
        });

        test('POST /verify/network-unblock, body {network:xxx} - Should not unblock because of lack of capability', async () => {
          const path = `/verify/network-unblock`;
          const payload = {
            network: 11111,
          };
          const response = await request.post(path).set(headers).send(payload);
          // The capability is checked by the service, so receiving 403 here confirms that the request reached the service
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Your account does not have permission to perform this action');
          // and make sure it's not envoy replying to us
          expect(response.text).not.toContain(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
