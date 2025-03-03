local utils = import 'lib/utils.libsonnet';

(import './env.jsonnet')
{
  gitTags+: {
    // inhererit `gloo-vcc-routes` from env.jsonnet
    'gloo-nexmo-routes'+: {
      'nexmo-numintel-insight': utils._RouteConfig(
        activeRevision='08ef46ae00d14c6a16f4f22cc3300f026782a676',
        passiveRevision='08ef46ae00d14c6a16f4f22cc3300f026782a676',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
    },
    'gloo-vcp-routes'+: {
      'vcp-bus-station': utils._RouteConfig(
        activeRevision='7b59c7500e7987196129909ec4ba270cc9fd987d',
        passiveRevision='7b59c7500e7987196129909ec4ba270cc9fd987d',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
    },
  },
}
