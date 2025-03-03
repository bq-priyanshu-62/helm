(import '../us.jsonnet')
{
  vg_region: 'use1',
  region: 'us-east-1',
  env_domain: 'api-us.dev.v1.vonagenetworks.net',
  domain_filters: [
    'api-us.dev.v1.vonagenetworks.net',
    'api-us.cc.dev.v1.vonagenetworks.net',
    'api-us.uc.dev.v1.vonagenetworks.net',
  ],
  logging: {
    url: 'https://1v-logs-virginia.tools.vonagenetworks.net:50000',
    logRegion1v: 'us-east-1',
    logRegionViam: 'eu-central-1',
  },
  gitTags+: {
  },
}
