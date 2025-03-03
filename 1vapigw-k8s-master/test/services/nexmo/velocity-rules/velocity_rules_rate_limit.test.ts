import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import retry from 'jest-retries';
import { defaultRequest } from '../../../utils/default-request';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service velocity-rules-rate-limit
 * @lob nexmo
 // * @prod apse1 apse2 euc1 euw1 // disable for prod, this creates unnecessary load constantly
//  * @qa apse1 apse2 euc1 euw1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

async function validateRateLimitResponse({ request, method, path, headers, rate }) {
  let responses = [];
  for (let i = 0; i < rate; i++) {
    responses.push(request[method](path).set(headers));
  }
  responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);
  //console.log(`number of 429 response: ${JSON.stringify(responses)}`);

  expect(responses.length).toBeGreaterThan(0);
}

describe('Nexmo Velocity Rules Rate Limiting Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const velocityRulesDomain = getHostDomainsList(servicesConf.api.velocity_rules[selectedRegion])[0];

    let authorization;
    const velocityRulesRateLimit = servicesConf.api.velocity_rules.rateLimit.velocity_rules;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.rateLimitAuthorization);
    });

    describe('Velocity-Rules Rate limit - POST /verify/network-unblock', () => {
      retry('Velocity-Rules V2 Rate Limit', 3, async () => {
        const headers = {
          Host: velocityRulesDomain,
          [TRACE_ID_HEADER]: '1vapigw-verify-v2-ratelimit-' + uuidv4(),
          Authorization: authorization,
        };
        await validateRateLimitResponse({
          request,
          method: 'post',
          path: '/verify/network-unblock',
          headers,
          rate: velocityRulesRateLimit * 5,
        });
      });
    });
  });
});
