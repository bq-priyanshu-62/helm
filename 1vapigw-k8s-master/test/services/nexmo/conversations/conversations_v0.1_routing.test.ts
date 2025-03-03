import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

import 'jest-expect-message';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service conversations_v0.1_routing
 * @lob nexmo
 * @prod apse2 apse1 euc1 euw1 use1 usw2
 * @notifyChannel rtc-dev-euw1-regression-test-results
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'conversations_v0.1_routing';

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
    // if it is a static region we do not expect redirection
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
    let authorizationApse1;
    let authorizationApse2;
    let authorizationUse1;
    let authorizationUsw2;

    const conversationDomain = getHostDomainsList(servicesConf.api.conversations.host[selectedRegion]);

    beforeAll(async () => {
      authorizationEuc1 = await getSecret(servicesConf.api.conversations.host['euc1'].app_routing.authorization);
      authorizationEuw1 = await getSecret(servicesConf.api.conversations.host['euw1'].app_routing.authorization);
      authorizationApse1 = await getSecret(servicesConf.api.conversations.host['apse1'].app_routing.authorization);
      authorizationApse2 = await getSecret(servicesConf.api.conversations.host['apse2'].app_routing.authorization);
      authorizationUse1 = await getSecret(servicesConf.api.conversations.host['use1'].app_routing.authorization);
      authorizationUsw2 = await getSecret(servicesConf.api.conversations.host['usw2'].app_routing.authorization);
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(conversationDomain)('domain - %s', domain => {
        test('GET v0.1/conversations with redirection to eu central 1 - should route correctly', async () => {
          const path = '/v0.1/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-1',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.1/conversations with redirection to eu west 1 - should route correctly', async () => {
          const path = '/v0.1/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-2',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.1/conversations with redirection to ap south east 1 - should route correctly', async () => {
          const path = '/v0.1/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-3',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.1/conversations with redirection to ap south east 2 - should route correctly', async () => {
          const path = '/v0.1/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-4',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.1/conversations with redirection to us east 1 - should route correctly', async () => {
          const path = '/v0.1/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-5',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.1/conversations with redirection to us west 2 - should route correctly', async () => {
          const path = '/v0.1/conversations';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-6',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.1/devices with redirection to eu central 1 - should route correctly', async () => {
          const path = '/v0.1/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-7',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.1/devices with redirection to eu west 1 - should route correctly', async () => {
          const path = '/v0.1/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-8',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.1/devices with redirection to ap south east 1 - should route correctly', async () => {
          const path = '/v0.1/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-9',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.1/devices with redirection to ap south east 2 - should route correctly', async () => {
          const path = '/v0.1/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-10',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.1/devices with redirection to us east 1 - should route correctly', async () => {
          const path = '/v0.1/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-11',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.1/devices with redirection to us west 2 - should route correctly', async () => {
          const path = '/v0.1/devices';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-12',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.1/users with redirection to eu central 1 - should route correctly', async () => {
          const path = '/v0.1/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-13',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.1/users with redirection to eu west 1 - should route correctly', async () => {
          const path = '/v0.1/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-14',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.1/users with redirection to ap south east 1 - should route correctly', async () => {
          const path = '/v0.1/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-15',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.1/users with redirection to ap south east 2 - should route correctly', async () => {
          const path = '/v0.1/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-16',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.1/users with redirection to us east 1 - should route correctly', async () => {
          const path = '/v0.1/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-17',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.1/users with redirection to us west 2 - should route correctly', async () => {
          const path = '/v0.1/users';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-18',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('POST v0.1/sessions with redirection to eu central 1 - should route correctly', async () => {
          const path = '/v0.1/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-19',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('POST v0.1/sessions with redirection to eu west 1 - should route correctly', async () => {
          const path = '/v0.1/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-20',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('POST v0.1/sessions with redirection to ap south east 1 - should route correctly', async () => {
          const path = '/v0.1/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-21',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('POST v0.1/sessions with redirection to ap south east 2 - should route correctly', async () => {
          const path = '/v0.1/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-22',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('POST v0.1/sessions with redirection to us east 1 - should route correctly', async () => {
          const path = '/v0.1/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-23',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('POST v0.1/sessions with redirection to us west 2 - should route correctly', async () => {
          const path = '/v0.1/sessions';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-24',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('POST v0.1/knocking with redirection to eu central 1 - should route correctly', async () => {
          const path = '/v0.1/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-25',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('POST v0.1/knocking with redirection to eu west 1 - should route correctly', async () => {
          const path = '/v0.1/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-26',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('POST v0.1/knocking with redirection to ap south east 1 - should route correctly', async () => {
          const path = '/v0.1/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-27',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('POST v0.1/knocking with redirection to ap south east 2 - should route correctly', async () => {
          const path = '/v0.1/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-28',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('POST v0.1/knocking with redirection to us east 1 - should route correctly', async () => {
          const path = '/v0.1/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-29',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('POST v0.1/knocking with redirection to us west 2 - should route correctly', async () => {
          const path = '/v0.1/knocking';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-30',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.post(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.1/discovery with redirection to eu central 1 - should route correctly', async () => {
          const path = '/v0.1/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-31',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.1/discovery with redirection to eu west 1 - should route correctly', async () => {
          const path = '/v0.1/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-32',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.1/discovery with redirection to ap south east 1 - should route correctly', async () => {
          const path = '/v0.1/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-33',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.1/discovery with redirection to ap south east 2 - should route correctly', async () => {
          const path = '/v0.1/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-34',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.1/discovery with redirection to us east 1 - should route correctly', async () => {
          const path = '/v0.1/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-35',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.1/discovery with redirection to us west 2 - should route correctly', async () => {
          const path = '/v0.1/discovery';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-36',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-4');
        });

        test('GET v0.1/legs with redirection to eu central 1 - should route correctly', async () => {
          const path = '/v0.1/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-37',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-4');
        });

        test('GET v0.1/legs with redirection to eu west 1 - should route correctly', async () => {
          const path = '/v0.1/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-38',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'eu-3');
        });

        test('GET v0.1/legs with redirection to ap south east 1 - should route correctly', async () => {
          const path = '/v0.1/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-39',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-3');
        });

        test('GET v0.1/legs with redirection to ap south east 2 - should route correctly', async () => {
          const path = '/v0.1/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-40',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'ap-4');
        });

        test('GET v0.1/legs with redirection to us east 1 - should route correctly', async () => {
          const path = '/v0.1/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-41',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateResponse(response, domain, 'us-3');
        });

        test('GET v0.1/legs with redirection to us west 2 - should route correctly', async () => {
          const path = '/v0.1/legs';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversations-v01-redirection-test-42',
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
