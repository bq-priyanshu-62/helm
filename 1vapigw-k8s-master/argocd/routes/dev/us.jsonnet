local utils = import 'lib/utils.libsonnet';

(import './env.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
    },
    'gloo-vcp-routes'+: {
      'vcp-bus-station': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-api-test': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-media': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-guest-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-widget-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-shared-emails': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
    'gloo-vcc-routes'+: {
    },
  },
}
