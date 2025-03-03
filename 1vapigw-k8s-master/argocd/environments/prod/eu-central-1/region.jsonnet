(import '../eu.jsonnet')
{
  vg_region: 'euc1',
  region: 'eu-central-1',
  env_domain: 'api-eu.prod.v1.vonagenetworks.net',
  domain_filters: [
    'api-eu.prod.v1.vonagenetworks.net',
    'api-eu.cc.prod.v1.vonagenetworks.net',
  ],
  logging: {
    url: 'https://1v-logs-frankfurt.tools.vonagenetworks.net:50000',
    logRegion1v: 'eu-central-1',
    logRegionViam: 'eu-central-1',
  },
}
