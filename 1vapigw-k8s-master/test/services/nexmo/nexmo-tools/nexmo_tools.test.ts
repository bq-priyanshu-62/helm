import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service nexmoTools
 * @lob nexmo
 * @dev euw1 use1
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'nexmoTools';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const vgDomain = getHostDomainsList(servicesConf.api.nexmoTools[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(vgDomain)('domain - %s', domain => {
        test('GET /voice/inspector - Should redirect to Vonage login', async () => {
          const path = '/voice/inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-nexmo-tools-test-1',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        });
        test('GET /sms/inspector - Should return 200 ok', async () => {
          const path = '/sms/inspector';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-nexmo-tools-test-2',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });
        test('GET /sms/inspector - Should return 200 ok', async () => {
          const path = '/sms/inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-nexmo-tools-test-3',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });
        test('GET /wa/partners/onboard - Should return 200 ', async () => {
          const path = '/wa/partners/onboard';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-nexmo-tools-test-4',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });
      });
    });
  });
});
