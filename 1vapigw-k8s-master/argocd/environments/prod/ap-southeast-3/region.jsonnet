(import '../ap.jsonnet')
{
  vg_region: 'apse3',
  region: 'ap-southeast-3',
  env_domain: 'api-ap.prod.v1.vonagenetworks.net',
  domain_filters: [
    'api-ap.prod.v1.vonagenetworks.net',
    'api-ap.cc.prod.v1.vonagenetworks.net',
  ],
  logging: {
    url: 'https://1v-logs-frankfurt.tools.vonagenetworks.net:50000',
    logRegion1v: 'eu-central-1',
    logRegionViam: 'eu-central-1',
  },
}
