import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service network-api-reg
 * @lob nexmo
 * @dev euw1
 * @qa euw1 euc1
 * @prod euw1 euc1
 * @prodNotifyChannel vna-alerts
 */

const service = 'network-api-registration';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    const TRACE_ID = '1vapigw-network-api-reg';
    let request;

    const domain = getHostDomainsList(servicesConf.api.network_api_reg[selectedRegion]);
    let authorization;

    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    let headersInvalidAuth = {
      [TRACE_ID_HEADER]: TRACE_ID,
      Authorization: 'Basic INVALID',
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(domain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
          headersInvalidAuth['Host'] = domain;
        });

        test('POST /v0.1/network-api/operate-api-listeners/listeners - Should return 404', async () => {
          const path = `/v0.1/network-api/operate-api-listeners/listeners`;
          console.log(path);
          const response = await request.post(path).set(headers).send('{}');
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('"The requested endpoint does not exist"');
          expect(response.text).toContain('"1vapigw-network-api-reg"');
        });

        test('GET /v0.1/network-api/operate-api-listeners/listeners - Unsupported should return 403', async () => {
          const path = `/v0.1/network-api/operate-api-listeners/listeners`;
          console.log(path);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('GET /v0.1/network-api/operate-api-listeners/listeners - Unauthorized should return 403', async () => {
          const path = `/v0.1/network-api/operate-api-listeners/listeners`;
          console.log(path);
          const response = await request.get(path).set(headersInvalidAuth);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('POST /v1/network-registry/operate-api/listener - Should return 404', async () => {
          const path = `/v1/network-registry/operate-api/listener`;
          console.log(path);
          const response = await request.post(path).set(headers).send('{}');
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('"The requested endpoint does not exist"');
          expect(response.text).toContain('"1vapigw-network-api-reg"');
        });

        test('GET /v1/network-registry/operate-api/listener - Unsupported should be translated to 404', async () => {
          const path = `/v1/network-registry/operate-api/listener`;
          console.log(path);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('"The requested endpoint does not exist"');
          expect(response.text).toContain('"1vapigw-network-api-reg"');
        });

        test('GET /v1/network-registry/operate-api/listener - Unauthorized should be translated to 401', async () => {
          const path = `/v1/network-registry/operate-api/listener`;
          console.log(path);
          const response = await request.get(path).set(headersInvalidAuth);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /v1/network-registry/business-profiles - Should return 200', async () => {
          const path = `/v1/network-registry/business-profiles`;
          console.log(path);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });
      });
    });
  });
});
