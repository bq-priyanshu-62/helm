import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service chatapp-orchestrator
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @dev euw1
 * @prodNotifyChannel api-verify-alerts
 */

const service = 'chatapp-orchestrator';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const orchDomain = getHostDomainsList(servicesConf.api.chatapp_orchestrator[selectedRegion]);
    const path = `/v1/callbacks/email`;

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(orchDomain)('domain - %s', domain => {
        const TRACE_ID = '1vapigw-verify-v2-test';
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: TRACE_ID,
        };

        test('POST /v1/callbacks/email - Should return 200 on valid email callback', async () => {
          const payload = {
            id: 560835,
            email: 'apigw_sanity_check@vonage.com',
            'message-id': '<111.222@apigw.sanity.check>',
            event: 'delivered',
            date: '2022-07-27 13:37:05',
            subject: 'Your apigw_sanity_check Nexmo code',
            sending_ip: '185.41.28.128',
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('POST /v1/callbacks/email - Should return 200 and silently ignore invalid email callback', async () => {
          const payload = {
            foo: 'bar',
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('POST /v1/inbound/silent-auth - Should return 200 and silently ignore ', async () => {
          const payload = {
            foo: 'bar',
          };
          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
        });
      });
    });
  });
});
