local utils = import 'lib/utils.libsonnet';

(import './env.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
    },
    'gloo-vcp-routes'+: {
      'vcp-bus-station': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
  },
}
