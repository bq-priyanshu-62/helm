local utils = import 'lib/utils.libsonnet';

(import './env.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      'nexmo-dashboard': utils._RouteConfig(revision='VIAM-1729-RCS-Signup', routeLibVersion=$._routeLibVersion),
      'nexmo-adp': utils._RouteConfig(revision='APIDP-2204', routeLibVersion=$._routeLibVersion),
      'nexmo-ni-v2': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-neru': utils._RouteConfig(revision='f2b5392d56d78df9dbd390589b2d80027f46ac2c', routeLibVersion=$._routeLibVersion),
      'nexmo-sms': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vgai-rag-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
    'gloo-vcc-routes'+: {
      'vcc-ms-teams-adapter': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
    'gloo-vcp-routes'+: {
      'vcp-bus-station': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-meetings-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
  },
}
