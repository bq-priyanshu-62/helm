import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { textSpanContainsPosition } from 'typescript';
import { getSecret } from '../../../utils/get-secret';

/**
 * @service bus
 * @lob nexmo
 * @dev use1
 * @qa use1 euc1
 * @prod use1 usw2 euc1 euw1 apse2
 * @notifyChannel bus-gateway-notifications-qa
 * @prodNotifyChannel bus-gateway-notifications-prod
 */
const service = 'bus';

describe('BUS', () => {
  describe.each(getHostList(LobTypes.API, 'bus'))('Sanity - %s', host => {
    let request;
    let headers = {};

    const busDomain = getHostDomainsList(servicesConf.api.bus[selectedRegion]);
    let authorization;

    const applicationId = 'GW_GLOO_TEST_APP_ID';
    const deviceId = 'GW_GLOO_TEST_DEVICE_ID';
    const userId = 'GW_GLOO_TEST_USER_ID';
    const type = 'ws';

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(busDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('POST /vcp-bus/v1/ - Invalid, should return 404 From BUS', async () => {
          const path = '/vcp-bus/v1/';

          const response = await request.post(path).set(headers).send({});
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).not.toEqual(envoy404);
        });

        test('POST /vcp-bus/v1/register - Invalid, should return 404 From BUS', async () => {
          const path = `/vcp-bus/v1/register/${deviceId}`;
          const validPayloadWithoutToken = {
            applicationId,
            deviceId,
            userId,
            type,
          };
          const response = await request.post(path).set(headers).send(validPayloadWithoutToken);

          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).not.toEqual(envoy404);
        });

        test('POST /vcp-bus/v2/ - Invalid, should return 404 From GW', async () => {
          const path = '/vcp-bus/v2/';
          const response = await request.post(path).set(headers).send({});

          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
        });

        test('PUT /vcp-bus/v1/registrations - Invalid, should return 404 From GW', async () => {
          const path = `/vcp-bus/v1/registrations/${deviceId}`;
          const validPayloadWithoutToken = {
            applicationId,
            deviceId,
            userId,
            type,
          };
          const response = await request.put(path).set(headers).send(validPayloadWithoutToken);

          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
        });

        test('POST /vcp-bus/v1/registrations - Valid, should return 401 from Bus station', async () => {
          const path = `/vcp-bus/v1/registrations/${deviceId}`;
          const validPayloadWithoutToken = {
            applicationId,
            deviceId,
            userId,
            type,
          };

          const response = await request.post(path).set(headers).send(validPayloadWithoutToken);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('{"message":"Unauthorized"}');
        });

        test('DELETE /vcp-bus/v1/registrations - Valid, should return 404 from Bus station', async () => {
          let deviceId = 'someDevice';
          const path = `/vcp-bus/v1/registrations/${deviceId}`;
          const validPayloadWithoutToken = {
            applicationId,
            deviceId,
            userId,
            type,
          };

          const response = await request.delete(path).set(headers).send(validPayloadWithoutToken);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('{"message":"Device with given id does not exist","errorCode":1105}');
        });
      });
    });
  });
});
