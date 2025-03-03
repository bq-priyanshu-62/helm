local utils = import 'lib/utils.libsonnet';

(import './eu.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      // doesn't exist in the route library and is breaking all route syncing
      'nexmo-management-console': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vgai-rag-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-number-inventory': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-kyc': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-media': utils._RouteConfig(revision='master', routeLibVersion=$._routeLibVersion),
    },
  },
}
