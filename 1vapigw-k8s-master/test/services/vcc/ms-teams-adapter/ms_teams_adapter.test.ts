import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service ms_teams_adapter
 * @lob cc
 * @prod apse2 apse1 euc1 euw1 use1 usw2
 * @qa euw1 euc1
 * @prodNotifyChannel cct-ms-teams-adapter-alerts
 */

const service = 'msTeamsAdapter';

describe('VCC', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const domains = getHostDomainsList(servicesConf[LobTypes.CC][service][selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(domains)('%s', domain => {
        test('POST /msteams/notify - Should return 200', async () => {
          const path = `/msteams/notify/00000000-0000-0000-0000-000000000000`;
          const headers = {
            Host: domain,
            'Content-Type': 'text/plain',
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };

          const validationToken = 'abc123';
          const response = await retryFor429(request.post(path).set(headers).query({ validationToken }));
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain(validationToken);
        });
      });
    });
  });
});
