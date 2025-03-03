local utils = import 'lib/utils.libsonnet';

(import './env.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      'nexmo-10dlc': utils._RouteConfig(revision='451f056af03db7280406d8a17fe1963dc7f24caa', routeLibVersion=$._routeLibVersion),
      'nexmo-adp': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-dashboard': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-messaging-queue-metrics': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-ni-v2': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'nexmo-neru': utils._RouteConfig(revision='f2b5392d56d78df9dbd390589b2d80027f46ac2c', routeLibVersion=$._routeLibVersion),
      'nexmo-numberpools': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
      'vgai-rag-api': utils._RouteConfig(revision='feature/vgai-algo-rag-dev'),
      'nexmo-rtc': utils._RouteConfig(routeLibVersion=$._routeLibVersion),
    },
    'gloo-vcc-routes'+: {
    },
  },
}
