local utils = import 'lib/utils.libsonnet';

(import './env.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      'nexmo-dashboard': utils._RouteConfig(activeRevision='fe421b1e9a7c42aa09eefb4040253d108896dd25',
                                            passiveRevision='fe421b1e9a7c42aa09eefb4040253d108896dd25',
                                            routeLibVersion=$._routeLibVersion,
                                            passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-adp': utils._RouteConfig(activeRevision='9e8ba5ce13eb1695adbded26235cad650a367116',
                                      passiveRevision='9e8ba5ce13eb1695adbded26235cad650a367116',
                                      routeLibVersion=$._routeLibVersion,
                                      passiveRouteLibVersion=$._routeLibVersionPassive),
      'vgai-rag-api': utils._RouteConfig(activeRevision='f47a539b9e6749ad3d554b64d2fc66fc4be1b0af',
                                         passiveRevision='f47a539b9e6749ad3d554b64d2fc66fc4be1b0af',
                                         routeLibVersion=$._routeLibVersion,
                                         passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-numintel-insight': utils._RouteConfig(
        activeRevision='08ef46ae00d14c6a16f4f22cc3300f026782a676',
        passiveRevision='08ef46ae00d14c6a16f4f22cc3300f026782a676',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-rtc': utils._RouteConfig(
        activeRevision='5e725215bf7fd7953eb24bbc29e0687534b45708',
        passiveRevision='5e725215bf7fd7953eb24bbc29e0687534b45708',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
    },
    // inhererit `gloo-vcc-routes` from env.jsonnet
    'gloo-vcp-routes'+: {
      'vcp-bus-station': utils._RouteConfig(
        activeRevision='7b59c7500e7987196129909ec4ba270cc9fd987d',
        passiveRevision='7b59c7500e7987196129909ec4ba270cc9fd987d',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'vcp-meetings-api': utils._RouteConfig(
        activeRevision='62c5e80d537e32516d3fca8dc31b5a3efc4eed13',
        passiveRevision='62c5e80d537e32516d3fca8dc31b5a3efc4eed13',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'vcp-dt-5g-slice': utils._RouteConfig(
        activeRevision='7500b956043c206591211a9ee191f3d2d47d96b1',
        passiveRevision='7500b956043c206591211a9ee191f3d2d47d96b1',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'vcp-chat-api': utils._RouteConfig(
        activeRevision='2b4dbed69659eaf10ef221177a81ba8b549a9921',
        passiveRevision='2b4dbed69659eaf10ef221177a81ba8b549a9921',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'vcp-chat-guest-api': utils._RouteConfig(
        activeRevision='b5b9cbed63272b0c5ed956f7dbd18e9c96290ce5',
        passiveRevision='b5b9cbed63272b0c5ed956f7dbd18e9c96290ce5',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'vcp-chat-widget-api': utils._RouteConfig(
        activeRevision='b5b9cbed63272b0c5ed956f7dbd18e9c96290ce5',
        passiveRevision='b5b9cbed63272b0c5ed956f7dbd18e9c96290ce5',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'vcp-chat-media': utils._RouteConfig(
        activeRevision='b5b9cbed63272b0c5ed956f7dbd18e9c96290ce5',
        passiveRevision='b5b9cbed63272b0c5ed956f7dbd18e9c96290ce5',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'vcp-shared-emails': utils._RouteConfig(
        activeRevision='6fd9ace8443f446d29b6da889a21a530b849c78a',
        passiveRevision='6fd9ace8443f446d29b6da889a21a530b849c78a',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
    },
  },
}
