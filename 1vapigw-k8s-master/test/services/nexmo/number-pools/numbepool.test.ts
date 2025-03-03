import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service numberpool
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel oss-alerts
 */

const service = '10dlc';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const numberPoolDomain = getHostDomainsList(servicesConf.api.numberpool.host[selectedRegion]);
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
    });

    describe(`${service} Services`, () => {
      describe.each(numberPoolDomain)('domain - %s', domain => {
        test('GET /v2/numberpools/ping - Should return 200', async () => {
          const path = `/v2/numberpools/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-numberpool-test-1',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });
      });
    });
  });
});
