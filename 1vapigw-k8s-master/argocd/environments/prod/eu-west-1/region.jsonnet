(import '../eu.jsonnet')
{
  vg_region: 'euw1',
  region: 'eu-west-1',
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
  gitTags+: {
    'gloo-nexmo'+: {
      'nexmo-argocd-webhook-fan-out': 'argocd-env-v2025.01.27.1010',
    },
  },
}
