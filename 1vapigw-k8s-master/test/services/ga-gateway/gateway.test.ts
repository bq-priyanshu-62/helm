import { getAllUniqueAppHostDomains } from '../../config/get-urls-by-env';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest, retryFor429 } from '../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @ga ga_test
 * @service apigateway
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 apse3 mec1 use1 usw2
 * @qa euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1 use1
 * @prodNotifyChannel api-gw-notify
 */

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security'].toLowerCase()).toEqual('max-age=31536000; includesubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

function validateResponseRegion(host, response) {
  host = new String(host).toLowerCase();
  expect(response.text).toContain('"message":"OK"');

  if (new RegExp('(api|rest)-(eu|eugb)').test(host)) {
    expect(response.text).toContain('"region":"eu-');

    if (new RegExp('(api|rest)-(eu|eugb)-(1|3)').test(host)) {
      expect(response.text).toContain('"region":"eu-west-1"');
    } else if (new RegExp('(api|rest)-eu-(2|4)').test(host)) {
      expect(response.text).toContain('"region":"eu-central-1"');
    }
  }

  if (new RegExp('(api|rest)-us').test(host)) {
    expect(response.text).toContain('"region":"us-');

    if (new RegExp('(api|rest)-us-(1|3)').test(host)) {
      expect(response.text).toContain('"region":"us-east-1"');
    } else if (new RegExp('(api|rest)-us-(2|4)').test(host)) {
      expect(response.text).toContain('"region":"us-west-2"');
    }
  }

  if (new RegExp('(api|rest)-(ap|sg)').test(host)) {
    expect(response.text).toContain('"region":"ap-');

    if (new RegExp('(api|rest)-(ap|sg)-(1|3)').test(host)) {
      expect(response.text).toContain('"region":"ap-southeast-1"');
    } else if (new RegExp('(api|rest)-ap-(2|4)').test(host)) {
      expect(response.text).toContain('"region":"ap-southeast-2"');
    }
  }
}

describe('GA', () => {
  const failDomains = [
    // APIGW-1288 - Review Domains after the ticket has been investigated
    'api-us.dev.nexmo.com',
    'api-us-3.dev.v1.vonagenetworks.net',
    'api.dev.v1.vonagenetworks.net',
    'rest-us.dev.nexmo.com',
    'api-eu-3.dev.v1.vonagenetworks.net',
    'api-eu-2.dev.v1.vonagenetworks.net',
    'api-eugb.dev.v1.vonagenetworks.net',
    'api-ap.dev.nexmo.com',
    'api-sg-1-gw-prod.dev.nexmo.com',
    'api.qa.v1.vonagenetworks.net',
    'api-sg-1.dev.nexmo.com',
    'api-eugb.qa.v1.vonagenetworks.net',
    'api-eu-2.qa.v1.vonagenetworks.net',
    'guest-api.qa7.vocal-qa.com',
    'api-ap.nexmo.com',
    //domains haven't been migrated to the gateway yet
    'api.nexmocn.com',
    'rest.nexmocn.com',
    'guest-api.vonagebusiness.com',
    'api-eu.prod.v1.vonagenetworks.net',
    'api-us.prod.v1.vonagenetworks.net',
    'api.prod.v1.vonagenetworks.net',
    //domain not added to apigw yet
    'api-gb-1.vonage.com',
  ];

  failDomains.push(...['api.nexmo.com', 'messages.nexmo.com']); // Prod domains not serving 100% traffic through the gateway, needs review later.
  const testDomains = getAllUniqueAppHostDomains().filter(domain => !failDomains.includes(domain));

  describe.each(testDomains)('Sanity - %s', host => {
    let request;

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    test('GET /gateway/ping', async () => {
      const path = `/gateway/ping`;
      const response = await retryFor429(request.get(path));
      expect(response.status).toEqual(StatusCodes.OK);
      validateResponseRegion(host, response);
      validateResponseHeaders(response.header);
    });
  });
});
