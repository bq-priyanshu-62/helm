import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service docs
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
 * @prodNotifyChannel api-gw-notify
 */

const service = 'docs';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Docs Sanity - %s', host => {
    let request;

    const domains = getHostDomainsList(servicesConf[LobTypes.API][service][selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(domains)('domain - %s', domain => {
        test('GET / - Should return 301', async () => {
          const path = `/`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-docs-test-1',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_PERMANENTLY);
          expect(response.headers['location']).toMatch('https://developer.vonage.com/');
        });
      });
    });
  });
});
