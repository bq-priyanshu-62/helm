import { getHostDomainsList, getHostList, servicesConf } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultRequest } from '../../../utils/default-request';
import { StatusCodes } from 'http-status-codes';
import { TRACE_ID_HEADER } from '../../../consts/consts';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service adp
 * @lob nexmo
 * @prod euw1 euc1
 * @qa euw1
 * @prodNotifyChannel api-dashboard-monitoring
 */

const SERVICE = 'adp';
const BIFROST = 'bifrost';

describe('Nexmo', () => {
  const adpDomains = getHostDomainsList(servicesConf[LobTypes.API][SERVICE][SERVICE]);
  const bifrostDomains = getHostDomainsList(servicesConf[LobTypes.API][SERVICE][BIFROST]);

  const pingUrl = servicesConf[LobTypes.API][SERVICE].pingUrl;

  describe.each(getHostList(LobTypes.API))('ADP Sanity - ', host => {
    let request;
    const headers = {
      [TRACE_ID_HEADER]: `1vapigw-${SERVICE}-sanity-test`,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${SERVICE} Services`, () => {
      describe.each(adpDomains.concat(bifrostDomains))('%s', domain => {
        headers['Host'] = domain;

        test(`GET ${pingUrl} - Should return 200`, async () => {
          const response = await request.get(pingUrl).set(headers);

          expect(response.status).toEqual(StatusCodes.OK);
        });
      });
    });
  });
});
