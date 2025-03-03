import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service utilities
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @qa euw1 euc1 use1
 * @dev euw1 use1
 * @prodNotifyChannel api-gw-notify
 */

const service = 'utilities';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const utilitiesDomains = getHostDomainsList(servicesConf.api.utilities.host[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(utilitiesDomains)('domain - %s', domain => {
        test('GET /tlsverification - Should return 200', async () => {
          const path = `/tlsverification`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-utilities-test-1',
          };

          await request.get(path).set(headers).expect(StatusCodes.OK);
        });

        test('GET /ips-v4 - Should return 200', async () => {
          const path = `/ips-v4`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-utilities-test-2',
          };

          await request.get(path).set(headers).expect(StatusCodes.OK);
        });
      });
    });
  });
});
