import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';
const retry = require('jest-retries');
import { StatusCodes } from 'http-status-codes';
import { Test, SuperTest } from 'supertest';
import * as request from 'superagent';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service nii-rate-limit
 * @lob nexmo
 * @dev euw1
 * @prodNotifyChannel oss-alerts
 */

const service = 'nii';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

const rateLimitPerSecondTest = (host, max, headers = {}) => {
  retry(`Rate limit per second - ${max} - ${host}`, 3, async () => {
    let request: SuperTest<Test> = defaultRequest(host);
    let requests: Test[] = [];

    for (let i = 0; i < max + 1; i++) {
      requests.push(request.post('').set(headers));
    }

    let responses: Array<request.Response> = (await Promise.all(requests)).filter(x => x.text.includes('Busy (Throttled) Please re-try'));
    expect(responses.length).toBeGreaterThan(0);
    expect(responses[0].status).toEqual(StatusCodes.OK);
  });
};

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const niDomain = getHostDomainsList(servicesConf.api.ni[selectedRegion]);
    let authorization;
    const TRACE_ID = '1vapigw-ni-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.rateLimitAuthorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(niDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        rateLimitPerSecondTest(host + '/ni/basic/json', 150, headers);
        rateLimitPerSecondTest(host + '/ni/basic/xml', 150, headers);
        rateLimitPerSecondTest(host + '/ni/standard/json', 125, headers);
        rateLimitPerSecondTest(host + '/ni/standard/xml', 125, headers);
        rateLimitPerSecondTest(host + '/ni/advanced/json', 125, headers);
        rateLimitPerSecondTest(host + '/ni/advanced/xml', 125, headers);
        rateLimitPerSecondTest(host + '/ni/advanced/async/json', 125, headers);
        rateLimitPerSecondTest(host + '/ni/advanced/async/xml', 125, headers);
      });
    });
  });
});
