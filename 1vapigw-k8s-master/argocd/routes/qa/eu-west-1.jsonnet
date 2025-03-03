local utils = import 'lib/utils.libsonnet';

(import './eu.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      'nexmo-neru': utils._RouteConfig(revision='9a1d7514432788d74b11b2bb36272437c44438a7', routeLibVersion=$._routeLibVersion),
    },
  },
}
