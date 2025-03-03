const retry = require('jest-retries');
import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { ApplicationTypes } from '../../../consts/applicationTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

/**
 * @service meetings_api
 * @lob nexmo
 * @qa use1 euw1 euc1
 */
const service = 'meetings_api';

describe('Meetings API rate limit', () => {
  describe.each(getHostList(LobTypes.API, ApplicationTypes.MEETINGS))('Sanity - %s', host => {
    let request;

    const meetingsAPIDomain = getHostDomainsList(servicesConf.api.meetings[selectedRegion]);
    const authorization = servicesConf.api.hasQuotaAuthorization;

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(meetingsAPIDomain)('domain - %s', domain => {
        const headers = {
          Host: domain,
        };

        retry('Meetings API Rate Limit - GET /beta/meetings/health', 3, async () => {
          const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
          await sleep(1000);
          // reset rate-limiting for meetings routes
          let requests = [];
          for (let i = 0; i < 110; i++) {
            requests.push(
              request.get('/beta/meetings/health').set({
                Authorization: authorization,
                Host: domain,
              }),
            );
          }
          const responses = await Promise.all(requests);
          const filteredResponses = responses.filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

          expect(filteredResponses.length).toBeGreaterThan(0);
        });

        retry('Meetings API Rate Limit - GET /meetings/health', 3, async () => {
          const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
          await sleep(1000);
          // reset rate-limiting for meetings routes
          let requests = [];
          for (let i = 0; i < 110; i++) {
            requests.push(
              request.get('/meetings/health').set({
                Authorization: authorization,
                Host: domain,
              }),
            );
          }
          const responses = await Promise.all(requests);
          const filteredResponses = responses.filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

          expect(filteredResponses.length).toBeGreaterThan(0);
        });

        retry('Meetings API Rate Limit - GET /v1/meetings/health', 3, async () => {
          const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
          await sleep(1000);
          // reset rate-limiting for meetings routes
          let requests = [];
          for (let i = 0; i < 110; i++) {
            requests.push(
              request.get('/v1/meetings/health').set({
                Authorization: authorization,
                Host: domain,
              }),
            );
          }
          const responses = await Promise.all(requests);
          const filteredResponses = responses.filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

          expect(filteredResponses.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
