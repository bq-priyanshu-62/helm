local utils = import 'lib/utils.libsonnet';

(import './us.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      'nexmo-rate-limiting-sanity': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
  },
}
