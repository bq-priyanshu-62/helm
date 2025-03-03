(import '../me.jsonnet')
{
  vg_region: 'mec1',
  region: 'me-central-1',
  env_domain: 'api-me.prod.v1.vonagenetworks.net',
  domain_filters: [
    'api-me.prod.v1.vonagenetworks.net',
  ],
  logging: {
    url: 'https://1v-logs-frankfurt.tools.vonagenetworks.net:50000',
    logRegion1v: 'eu-central-1',
    logRegionViam: 'eu-central-1',
  },
}
