import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service capi
 * @lob nexmo
 * @prod apse2 apse1 euc1 euw1 use1 usw2
 * @dev euw1 euc1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'capi';

function getRegionDomainsList(regions: object): object {
  const hosts: object = {};

  if (regions && regions['region-header']) {
    regions['region-header'].forEach(r => (hosts[r.value] = r.expected));
  }

  return hosts;
}

function validateVonageRegionHeader(header, expected) {
  expect(header['x-vonage-region']).toEqual(expected);
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    const configuration = servicesConf.api[service].host[selectedRegion];
    const costDomains = getHostDomainsList(configuration);
    const aws_region = getRegionDomainsList(configuration);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        describe(`${domain} poing domain`, () => {
          describe.each(Object.keys(aws_region))('region - %s', reg => {
            const expected_reg = aws_region[reg];

            const headers = {
              Host: domain,
              'x-nexmo-capi-ping-region': reg,
              [TRACE_ID_HEADER]: `1vapigw-${service}-capi-test`,
            };

            test('GET /rtc/ping - Should return 200', async () => {
              const path = `/rtc/ping`;
              const response = await request.get(path).set(headers);
              expect(response.status).toEqual(StatusCodes.OK);
              validateVonageRegionHeader(response.header, expected_reg);
            });
          });
        });
      });
    });
  });
});
