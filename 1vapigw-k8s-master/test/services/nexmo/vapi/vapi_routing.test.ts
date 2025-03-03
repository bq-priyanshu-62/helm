import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv, selectedCluster } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service vapi
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

//TODO: Several tests have been commented out because they are expected to trigger a 500 from VAPI.
//These should go back either by fixing the tests to perform a valid request or by making Vapi respond more gracefully

const service = 'vapi';

const hostStaticRegions = {
  'api-ap-3.vonage.com': 'ap-3',
  'api-ap-4.vonage.com': 'ap-4',
  'api-eu-3.vonage.com': 'eu-3',
  'api-eu-4.vonage.com': 'eu-4',
  'api-us-3.vonage.com': 'us-3',
  'api-us-4.vonage.com': 'us-4',
};

function validateHeader(header, hostToValidate, expectedRegion) {
  if (hostToValidate in hostStaticRegions) {
    // if it is a static region we do not expect routing
    expectedRegion = hostStaticRegions[hostToValidate];
  }
  expect(header['x-vonage-region']).toEqual(expectedRegion);
}

describe('Nexmo VAPI Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorizationEuc1;
    let authorizationEuw1;
    let authorizationUse1;
    let authorizationUsw2;
    let authorizationApse1;
    let authorizationApse2;
    const vapiDomain = getHostDomainsList(servicesConf.api.vapi[selectedRegion]);

    beforeAll(async () => {
      authorizationEuc1 = await getSecret(servicesConf.api.vapi.euc1['app_routing'].authorization);
      authorizationEuw1 = await getSecret(servicesConf.api.vapi.euw1['app_routing'].authorization);
      authorizationUse1 = await getSecret(servicesConf.api.vapi.use1['app_routing'].authorization);
      authorizationUsw2 = await getSecret(servicesConf.api.vapi.usw2['app_routing'].authorization);
      authorizationApse1 = await getSecret(servicesConf.api.vapi.apse1['app_routing'].authorization);
      authorizationApse2 = await getSecret(servicesConf.api.vapi.apse2['app_routing'].authorization);
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(vapiDomain)('domain - %s', domain => {
        test('GET /v1/calls with routing to eu central 1 - should route correctly', async () => {
          const path = '/v1/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-1',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'eu-4');
        });

        test('GET /v1/calls with routing to eu west 1 - should route correctly', async () => {
          const path = '/v1/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-2',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'eu-3');
        });

        test('GET /v1/calls with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v1/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-3',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'ap-3');
        });

        test('GET /v1/calls with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v1/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-4',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'ap-4');
        });

        test('GET /v1/calls with routing to us east 1 - should route correctly', async () => {
          const path = '/v1/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-5',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'us-3');
        });

        test('GET /v1/calls with routing to us west 2 - should route correctly', async () => {
          const path = '/v1/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-6',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'us-4');
        });

        test('GET /v2/calls with routing to eu central 1 - should route correctly', async () => {
          const path = '/v2/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-7',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'eu-4');
        });

        test('GET /v2/calls with routing to eu west 1 - should route correctly', async () => {
          const path = '/v2/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-8',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'eu-3');
        });

        test('GET /v2/calls with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v2/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-9',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'ap-3');
        });

        test('GET /v2/calls with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v2/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-10',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'ap-4');
        });

        test('GET /v2/calls with routing to us east 1 - should route correctly', async () => {
          const path = '/v2/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-11',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'us-3');
        });

        test('GET /v2/calls with routing to us west 2 - should route correctly', async () => {
          const path = '/v2/calls';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-12',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.get(path).set(headers);
          validateHeader(response.header, domain, 'us-4');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/record with routing to eu central 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/record';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-13',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'eu-4');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/record with routing to eu west 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/record';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-14',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'eu-3');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/record with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/record';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-15',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'ap-3');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/record with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/record';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-16',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'ap-4');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/record with routing to us east 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/record';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-17',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'us-3');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/record with routing to us west 2 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/record';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-18',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'us-4');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/ncco with routing to eu central 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/ncco';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-19',
            'x-nexmo-app-voice-region': 'eu-east',
            Authorization: authorizationEuc1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'eu-4');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/ncco with routing to eu west 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/ncco';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-20',
            'x-nexmo-app-voice-region': 'eu-west',
            Authorization: authorizationEuw1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'eu-3');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/ncco with routing to ap south east 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/ncco';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-21',
            'x-nexmo-app-voice-region': 'apac-sng',
            Authorization: authorizationApse1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'ap-3');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/ncco with routing to ap south east 2 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/ncco';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-22',
            'x-nexmo-app-voice-region': 'apac-australia',
            Authorization: authorizationApse2,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'ap-4');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/ncco with routing to us east 1 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/ncco';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-23',
            'x-nexmo-app-voice-region': 'na-east',
            Authorization: authorizationUse1,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'us-3');
        });

        test('PUT /v1/conversations/CON-ABC-DEF/ncco with routing to us west 2 - should route correctly', async () => {
          const path = '/v1/conversations/CON-ABC-DEF/ncco';
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-routing-test-24',
            'x-nexmo-app-voice-region': 'na-west',
            Authorization: authorizationUsw2,
          };
          const response = await request.put(path).set(headers);
          validateHeader(response.header, domain, 'us-4');
        });
      });
    });
  });
});
