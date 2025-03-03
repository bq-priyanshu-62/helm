import { getHostDomainsList, getHostList, selectedRegion, servicesConf } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { ApplicationTypes } from '../../../consts/applicationTypes';
import { rateLimitPerMinuteTest, rateLimitPerSecondFromDifferentIpsTest, rateLimitPerSecondTest } from '../../../utils/rate-limit-tests';

/**
 * @service meetings
 * @lob uc
 * @qa use1
 */
const service = 'vbc_meetings';

describe('VBC Meetings Guest API rate limit', () => {
  describe.each(getHostList(LobTypes.UC, ApplicationTypes.MEETINGS))('Sanity - %s', host => {
    const vbcMeetingsDomain = getHostDomainsList(servicesConf.api.vbc_meetings[selectedRegion]);

    describe(`${service} Services`, () => {
      describe.each(vbcMeetingsDomain)('domain - %s', domain => {
        const headers = {
          Host: domain,
        };
        rateLimitPerSecondTest(host + '/meetings/health', servicesConf.api.vbc_meetings.rateLimitPerSecond, headers);

        rateLimitPerSecondFromDifferentIpsTest(host + '/meetings/health', servicesConf.api.vbc_meetings.rateLimitPerSecond, headers);

        rateLimitPerMinuteTest(
          host + '/meetings/health',
          servicesConf.api.vbc_meetings.rateLimitPerMinute,
          servicesConf.api.vbc_meetings.rateLimitPerSecond,
          headers,
        );
      });
    });
  });
});
