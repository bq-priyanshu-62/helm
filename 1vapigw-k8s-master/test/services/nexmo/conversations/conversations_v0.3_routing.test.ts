import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

import 'jest-expect-message';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service conversations_v0.3_routing
 * @lob nexmo
 * @prod apse2 apse1 euc1 euw1 use1 usw2
 * @notifyChannel rtc-dev-euw1-regression-test-results
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'conversations_v0.3_routing';

const hostStaticRegions = {
  'api-ap-3.vonage.com': 'ap-3',
  'api-ap-4.vonage.com': 'ap-4',
  'api-eu-3.vonage.com': 'eu-3',
  'api-eu-4.vonage.com': 'eu-4',
  'api-us-3.vonage.com': 'us-3',
  'api-us-4.vonage.com': 'us-4',
};

function validateResponse(response, hostToValidate, expectedRegion) {
  if (hostToValidate in hostStaticRegions) {
    // if it is a static region we do not expect routing
    expectedRegion = hostStaticRegions[hostToValidate];
  }
  expect(
    response.header['x-vonage-region'],
    `request with trace-id (${response.header['x-nexmo-trace-id']}) failed with status code ${response.status}`,
  ).toEqual(expectedRegion);
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorizationEuc1;
    let authorizationEuw1;
    let authorizationUse1;
    let authorizationUsw2;
    let authorizationApse1;
    let authorizationApse2;

    const conversationDomain = getHostDomainsList(servicesConf.api.conversations.host[selectedRegion]);

    beforeAll(async () => {
      authorizationEuc1 = await getSecret(servicesConf.api.conversations.host['euc1'].app_routing.authorization);
      authorizationEuw1 = await getSecret(servicesConf.api.conversations.host['euw1'].app_routing.authorization);
      authorizationUse1 = await getSecret(servicesConf.api.conversations.host['use1'].app_routing.authorization);
      authorizationUsw2 = await getSecret(servicesConf.api.conversations.host['usw2'].app_routing.authorization);
      authorizationApse1 = await getSecret(servicesConf.api.conversations.host['apse1'].app_routing.authorization);
      authorizationApse2 = await getSecret(servicesConf.api.conversations.host['apse2'].app_routing.authorization);
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(conversationDomain)('domain - %s', domain => {
        test('GET v0.3/conversations with routing to eu central 1 - should route correctly', async () => {
          const path = '/v0.3/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-1',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.3/conversations with routing to eu west 1 - should route correctly', async () => {
          const path = '/v0.3/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-2',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.3/conversations with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v0.3/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-3',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.3/conversations with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v0.3/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-4',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.3/conversations with routing to us east 1 - should route correctly', async () => {
          const path = '/v0.3/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-5',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.3/conversations with routing to us west 2 - should route correctly', async () => {
          const path = '/v0.3/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-6',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.3/devices with routing to eu central 1 - should route correctly', async () => {
          const path = '/v0.3/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-7',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.3/devices with routing to eu west 1 - should route correctly', async () => {
          const path = '/v0.3/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-8',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.3/devices with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v0.3/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-9',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.3/devices with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v0.3/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-10',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.3/devices with routing to us east 1 - should route correctly', async () => {
          const path = '/v0.3/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-11',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.3/devices with routing to us west 2 - should route correctly', async () => {
          const path = '/v0.3/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-12',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.3/users with routing to eu central 1 - should route correctly', async () => {
          const path = '/v0.3/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-13',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.3/users with routing to eu west 1 - should route correctly', async () => {
          const path = '/v0.3/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-14',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.3/users with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v0.3/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-15',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.3/users with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v0.3/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-16',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.3/users with routing to us east 1 - should route correctly', async () => {
          const path = '/v0.3/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-17',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.3/users with routing to us west 2 - should route correctly', async () => {
          const path = '/v0.3/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-18',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('POST v0.3/sessions with routing to eu central 1 - should route correctly', async () => {
          const path = '/v0.3/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-19',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('POST v0.3/sessions with routing to eu west 1 - should route correctly', async () => {
          const path = '/v0.3/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-20',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('POST v0.3/sessions with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v0.3/sessions';

          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-21',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('POST v0.3/sessions with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v0.3/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-22',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('POST v0.3/sessions with routing to us east 1 - should route correctly', async () => {
          const path = '/v0.3/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-23',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('POST v0.3/sessions with routing to us west 2 - should route correctly', async () => {
          const path = '/v0.3/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-24',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('POST v0.3/knocking with routing to eu central 1 - should route correctly', async () => {
          const path = '/v0.3/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-25',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('POST v0.3/knocking with routing to eu west 1 - should route correctly', async () => {
          const path = '/v0.3/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-26',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('POST v0.3/knocking with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v0.3/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-27',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('POST v0.3/knocking with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v0.3/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-28',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('POST v0.3/knocking with routing to us east 1 - should route correctly', async () => {
          const path = '/v0.3/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-29',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('POST v0.3/knocking with routing to us west 2 - should route correctly', async () => {
          const path = '/v0.3/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-30',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.3/discovery with routing to eu central 1 - should route correctly', async () => {
          const path = '/v0.3/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-31',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.3/discovery with routing to eu west 1 - should route correctly', async () => {
          const path = '/v0.3/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-32',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.3/discovery with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v0.3/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-33',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.3/discovery with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v0.3/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-34',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.3/discovery with routing to us east 1 - should route correctly', async () => {
          const path = '/v0.3/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-35',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.3/discovery with routing to us west 2 - should route correctly', async () => {
          const path = '/v0.3/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-36',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.3/legs with routing to eu central 1 - should route correctly', async () => {
          const path = '/v0.3/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-37',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.3/legs with routing to eu west 1 - should route correctly', async () => {
          const path = '/v0.3/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-38',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.3/legs with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v0.3/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-39',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.3/legs with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v0.3/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-40',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.3/legs with routing to us east 1 - should route correctly', async () => {
          const path = '/v0.3/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-41',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.3/legs with routing to us west 2 - should route correctly', async () => {
          const path = '/v0.3/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v03-routing-test-42',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });
      });
    });
  });
});
