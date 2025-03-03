(import '../eu.jsonnet')
{
  vg_region: 'euw1',
  region: 'eu-west-1',
  env_domain: 'api-eu.dev.v1.vonagenetworks.net',
  domain_filters: [
    'api-eu.dev.v1.vonagenetworks.net',
    'api-eu.cc.dev.v1.vonagenetworks.net',
    'api-eu.uc.dev.v1.vonagenetworks.net',
  ],
  logging: {
    url: 'https://1v-logs-frankfurt.tools.vonagenetworks.net:50000',
    logRegion1v: 'eu-central-1',
    logRegionViam: 'eu-central-1',
  },
  gitTags+: {
    'gloo-nexmo'+: {
      'nexmo-argocd-webhook-fan-out': 'master',
    },
  },
}
