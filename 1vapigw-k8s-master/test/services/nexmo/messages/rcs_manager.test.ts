import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service messages_rcs_manager
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
// * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

describe('Nexmo RCS Manager', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorization;
    const rcsManagerDomains = getHostDomainsList(servicesConf.api.messagesaws.rcsManagerHost[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
    });

    describe('rcsManager', () => {
      describe.each(rcsManagerDomains)('%s', rcsManagerDomain => {
        test('GET /v1/channel-manager/rcs/agents/VonageSmokes/google/phones/34613994828/capabilities - Should return 400', async () => {
          const path = `/v1/channel-manager/rcs/agents/VonageSmokes/google/phones/34613994828/capabilities`;
          const headers = {
            Host: rcsManagerDomain,
            [TRACE_ID_HEADER]: '1vapigw-rcs-manager-test-get-200-' + uuidv4(),
            Authorization: authorization,
          };
          console.log(rcsManagerDomain);
          const response = await request.get(path).set(headers);

          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.body.title).toEqual('Account Not Valid');
          expect(response.body.detail).toEqual('Account VonageSmokes was not found');
        });

        test('GET /v1/channel-manager/rcs/agents/VonageSmokes/google/phones/34613990401/capabilities - Bad auth - should return 401', async () => {
          const path = `/v1/channel-manager/rcs/agents/VonageSmokes/google/phones/34613990401/capabilities`;
          const headers = {
            Host: rcsManagerDomain,
            [TRACE_ID_HEADER]: '1vapigw-rcs-manager-test-get-401-' + uuidv4(),
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers).expect(StatusCodes.UNAUTHORIZED);

          // dev is returning 401 with empty body
          if (selectedEnv !== 'dev') {
            expect(response.body.title).toEqual('Unauthorized');
          }
        });
      });
    });
  });
});
