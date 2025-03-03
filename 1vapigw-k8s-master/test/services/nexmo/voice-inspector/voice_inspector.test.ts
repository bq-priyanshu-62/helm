import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service voiceInspector
 * @lob nexmo
 * @dev euw1 use1
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'voiceInspector';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const tokboxDomain = getHostDomainsList(servicesConf.api.tokboxTools[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(tokboxDomain)('domain - %s', domain => {
        test('GET /voice/inspector - Should redirect to Vonage login', async () => {
          const path = '/voice/inspector/';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-voice-inspector-test-2',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        });
      });
    });
  });
});
