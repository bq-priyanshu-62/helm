import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service 10dlc
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel oss-alerts
 */

const service = '10dlc';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const tendlcDomain = getHostDomainsList(servicesConf.api.tendlc.host[selectedRegion]);
    let authorization;
    const testHeader = 'X-Api-GTW-Test';
    let signature;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      signature = await getSecret(servicesConf.api.tendlc.signature);
    });

    describe(`${service} Services`, () => {
      describe.each(tendlcDomain)('domain - %s', domain => {
        test('GET /v1/10dlc - Should return 404', async () => {
          const path = `/v1/10dlc`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-10dlc-test-1',
            Authorization: authorization,
          };

          await request.get(path).set(headers).expect(StatusCodes.NOT_FOUND);
        });

        test('GET /v1/10dlc - No auth - Should return 404', async () => {
          const path = `/v1/10dlc`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-10dlc-test-2',
            Authorization: 'Basic INVALID',
          };

          await request.get(path).set(headers).expect(StatusCodes.NOT_FOUND);
        });

        test('GET /v1/10dlc/ping - Should return 200', async () => {
          const path = `/v1/10dlc/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-10dlc-test-4',
            Authorization: authorization,
          };

          await request.get(path).set(headers).expect(StatusCodes.OK);
        });

        // auth is disabled on the gateway, 10dlc performs its own auth
        test('POST /v1/10dlc/tcr/webhook- Should return 202', async () => {
          const path = `/v1/10dlc/tcr/webhook`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-10dlc-test-3',
            'X-Registry-Signature': signature,
            [testHeader]: '1vapigw-10dlc-tcr-webhook-test',
          };
          const payload = {
            eventType: 'NOOP',
          };

          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
        });

        test('POST /v1/10dlc/sinch/webhook - Should return 204', async () => {
          const path = `/v1/10dlc/sinch/webhook`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-10dlc-test-4',
            [testHeader]: '1vapigw-10dlc-sinch-webhook-test',
          };

          const response = await request.post(path).set(headers).send('');
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
        });

        test('POST /v1/10dlc/brands/XXXX/appeal/evidence - Should return 204', async () => {
          const path = `/v1/10dlc/brands/XXXX/appeal/evidence`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-10dlc-test-5',
            [testHeader]: '1vapigw-10dlc-upload-evidence-test',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers).send('');
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
        });
      });
    });
  });
});
