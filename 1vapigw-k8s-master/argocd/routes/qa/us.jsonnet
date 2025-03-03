local utils = import 'lib/utils.libsonnet';

(import './env.jsonnet')
{
  gitTags+: {
    'gloo-vbc-routes'+: {
      'vbc-meetings-guest': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
    'gloo-vcp-routes'+: {
      'vcp-bus-station': utils._RouteConfig(routeLibVersion=$._routeLibVersion, revision='vcp-bus-station-v2'),
      'vcp-chat-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-media': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-guest-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-chat-widget-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-meetings-api': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vcp-shared-emails': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
    'gloo-vcc-routes'+: {
    },
    'gloo-nexmo-routes'+: {
      'nexmo-sms': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
  },
}
