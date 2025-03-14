local utils = import 'lib/utils.libsonnet';

{
  _routeLibVersion:: 'lib-v3.12.4',
  _routeLibVersionPassive:: 'lib-v3.12.4',
  gitTags+: {
    'gloo-nexmo-routes'+: {
      /**
      example1: utils._RouteConfig(activeRevision='active_hash',
                                   activeRouteLibVersion='active_lib_version',
                                   passiveRevision='passive_hash',
                                   passiveRouteLibVersion='passive_lib_version'),
      example2: utils._RouteConfig(activeRevision='active_hash',
                                   passiveRevision='passive_hash',
                                   routeLibVersion='common_lib_version'),
      example3: utils._RouteConfig(revision='common_hash', routeLibVersion='common_lib_version'),
      example4: utils._RouteConfig('common_hash', 'common_lib_version'),
      */
      'nexmo-kyc': utils._RouteConfig(activeRevision='7994bf81894547a7a8eef88d5f4c077c4f64122e',
                                      passiveRevision='7994bf81894547a7a8eef88d5f4c077c4f64122e',
                                      routeLibVersion=$._routeLibVersion,
                                      passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-10dlc': utils._RouteConfig(activeRevision='9bebf8421fb34f69bfc3b4d0eb6d6da010e802e3',
                                        passiveRevision='9bebf8421fb34f69bfc3b4d0eb6d6da010e802e3',
                                        routeLibVersion=$._routeLibVersion,
                                        passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-admin-dashboard': utils._RouteConfig(activeRevision='183972d29ba28a145ce98469f25910c1d7ab72f9',
                                                  passiveRevision='183972d29ba28a145ce98469f25910c1d7ab72f9',
                                                  routeLibVersion=$._routeLibVersion,
                                                  passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-accounts-secrets': utils._RouteConfig(activeRevision='fcc057a232b817a0de7507006aad280908367bbc',
                                                   passiveRevision='fcc057a232b817a0de7507006aad280908367bbc',
                                                   routeLibVersion=$._routeLibVersion,
                                                   passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-applications': utils._RouteConfig(activeRevision='b0fb1e8c9765ba54a364d17c93e2fe5509d4ecef',
                                               passiveRevision='b0fb1e8c9765ba54a364d17c93e2fe5509d4ecef',
                                               routeLibVersion=$._routeLibVersion,
                                               passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-argocd': utils._RouteConfig(activeRevision='bc6d6ebf5a2a676b7bcd30704e95088171b296c7',
                                         passiveRevision='47218c08fc0418017e762406d8606ef1a786cb87',
                                         routeLibVersion=$._routeLibVersion,
                                         passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-auth': utils._RouteConfig(activeRevision='bc6d6ebf5a2a676b7bcd30704e95088171b296c7',
                                       passiveRevision='bc6d6ebf5a2a676b7bcd30704e95088171b296c7',
                                       routeLibVersion=$._routeLibVersion,
                                       passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-auditevent': utils._RouteConfig(activeRevision='6989425cf1360ac14c6bc12fb848c39980b9ec7b',
                                             passiveRevision='6989425cf1360ac14c6bc12fb848c39980b9ec7b',
                                             routeLibVersion=$._routeLibVersion,
                                             passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-capi': utils._RouteConfig(activeRevision='b0260480569888ceeeb51a4780a2593bc101298e',
                                       passiveRevision='12b93b0245e59e0acde7b9dd049b1fd403475393',
                                       routeLibVersion=$._routeLibVersion,
                                       passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-conversations': utils._RouteConfig(activeRevision='2bc1f47c876f2404eeb0e33e482494fa3688da50',
                                                passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
                                                routeLibVersion=$._routeLibVersion,
                                                passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-conversations-v01': utils._RouteConfig(activeRevision='2bc1f47c876f2404eeb0e33e482494fa3688da50',
                                                    passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
                                                    routeLibVersion=$._routeLibVersion,
                                                    passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-conversations-v02': utils._RouteConfig(activeRevision='2bc1f47c876f2404eeb0e33e482494fa3688da50',
                                                    passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
                                                    routeLibVersion=$._routeLibVersion,
                                                    passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-conversations-v03': utils._RouteConfig(activeRevision='2bc1f47c876f2404eeb0e33e482494fa3688da50',
                                                    passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
                                                    routeLibVersion=$._routeLibVersion,
                                                    passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-conversions': utils._RouteConfig(activeRevision='30579094da4b2e76901adae59c428eb456fba0b7',
                                              passiveRevision='30579094da4b2e76901adae59c428eb456fba0b7',
                                              routeLibVersion=$._routeLibVersion,
                                              passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-cost': utils._RouteConfig(activeRevision='5bff7ecceebd4406c90a752c0ea50ce5c3c8200e',
                                       passiveRevision='5bff7ecceebd4406c90a752c0ea50ce5c3c8200e',
                                       routeLibVersion=$._routeLibVersion,
                                       passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-credentials': utils._RouteConfig(activeRevision='6989425cf1360ac14c6bc12fb848c39980b9ec7b',
                                              passiveRevision='6989425cf1360ac14c6bc12fb848c39980b9ec7b',
                                              routeLibVersion=$._routeLibVersion,
                                              passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-devapi-rest': utils._RouteConfig(activeRevision='6989425cf1360ac14c6bc12fb848c39980b9ec7b',
                                              passiveRevision='6989425cf1360ac14c6bc12fb848c39980b9ec7b',
                                              routeLibVersion=$._routeLibVersion,
                                              passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-domains-service': utils._RouteConfig(activeRevision='4e60de0d6986735d75e2131b3c0c8570d881db30',
                                                  passiveRevision='bc9b924020875b1504e251f841ae16c98eefe32f',
                                                  routeLibVersion=$._routeLibVersion,
                                                  passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-enforcer-service': utils._RouteConfig(activeRevision='babe1663f80a2facf2428fe44c34a0932cbdb321',
                                                   passiveRevision='babe1663f80a2facf2428fe44c34a0932cbdb321',
                                                   routeLibVersion=$._routeLibVersion,
                                                   passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-fd-alerts-generator': utils._RouteConfig(activeRevision='505c276bebf4917c00b0fea4fc49f3f1c6822c0e',
                                                      passiveRevision='505c276bebf4917c00b0fea4fc49f3f1c6822c0e',
                                                      routeLibVersion=$._routeLibVersion,
                                                      passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-generic-rate-limiting': utils._RouteConfig(activeRevision='34cbe13c68555ff2dc538cd133d8534e471566e6',
                                                        passiveRevision='34cbe13c68555ff2dc538cd133d8534e471566e6',
                                                        routeLibVersion=$._routeLibVersion,
                                                        passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-gloo-errors': utils._RouteConfig(activeRevision='34cbe13c68555ff2dc538cd133d8534e471566e6',
                                              passiveRevision='34cbe13c68555ff2dc538cd133d8534e471566e6',
                                              routeLibVersion=$._routeLibVersion,
                                              passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-cs-ips': utils._RouteConfig(activeRevision='043f16dd645e82f12252907783850e2f46bbf741',
                                         passiveRevision='043f16dd645e82f12252907783850e2f46bbf741',
                                         routeLibVersion=$._routeLibVersion,
                                         passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-management-console': utils._RouteConfig(activeRevision='7ac14034dbe01e9564f7a0a635d34bfd30939f28',
                                                     passiveRevision='7ac14034dbe01e9564f7a0a635d34bfd30939f28',
                                                     routeLibVersion=$._routeLibVersion,
                                                     passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-media': utils._RouteConfig(activeRevision='4f7787e358303ec3fcf63a1d80bd5cf8a5e17a51',
                                        passiveRevision='4f7787e358303ec3fcf63a1d80bd5cf8a5e17a51',
                                        routeLibVersion=$._routeLibVersion,
                                        passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-messages': utils._RouteConfig(activeRevision='f229452148924d0e0f0f3593473162da191ad9dc',
                                           passiveRevision='f229452148924d0e0f0f3593473162da191ad9dc',
                                           routeLibVersion=$._routeLibVersion,
                                           passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-messaging-queue-metrics': utils._RouteConfig(activeRevision='ee1657a2f4279f1f103299884123b1a8fefa4532',
                                                          passiveRevision='ee1657a2f4279f1f103299884123b1a8fefa4532',
                                                          routeLibVersion=$._routeLibVersion,
                                                          passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-neru': utils._RouteConfig(activeRevision='43b1499613864a7fd830546ee0cc15fb24a55fc4',
                                       passiveRevision='43b1499613864a7fd830546ee0cc15fb24a55fc4',
                                       routeLibVersion=$._routeLibVersion,
                                       passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-ni': utils._RouteConfig(activeRevision='99ddfb138bce8196bd79f74497f40ad47ceddfec',
                                     passiveRevision='99ddfb138bce8196bd79f74497f40ad47ceddfec',
                                     routeLibVersion=$._routeLibVersion,
                                     passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-ni-rest': utils._RouteConfig(activeRevision='dabbacf27be66a0a1be46997694ad9db4ad6f1b2',
                                          passiveRevision='dabbacf27be66a0a1be46997694ad9db4ad6f1b2',
                                          routeLibVersion=$._routeLibVersion,
                                          passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-numintel-insight': utils._RouteConfig(activeRevision='08ef46ae00d14c6a16f4f22cc3300f026782a676',
                                                   passiveRevision='08ef46ae00d14c6a16f4f22cc3300f026782a676',
                                                   routeLibVersion=$._routeLibVersion,
                                                   passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-ni-v2': utils._RouteConfig(activeRevision='091ec48452b2e7c44b5049bc59f859dc97628e16',
                                        passiveRevision='091ec48452b2e7c44b5049bc59f859dc97628e16',
                                        routeLibVersion=$._routeLibVersion,
                                        passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-numberpools': utils._RouteConfig(activeRevision='6b32540ba3f840ee44edbd5379538fc201de29b9',
                                              passiveRevision='6b32540ba3f840ee44edbd5379538fc201de29b9',
                                              routeLibVersion=$._routeLibVersion,
                                              passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-partnerapi': utils._RouteConfig(activeRevision='d5fa2e18b5b0a695c4e70960e85b3668518fea86',
                                             passiveRevision='d5fa2e18b5b0a695c4e70960e85b3668518fea86',
                                             routeLibVersion=$._routeLibVersion,
                                             passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-phub-pools': utils._RouteConfig(activeRevision='237bc23af8bc66b33ba289d27f90c7969985c38e',
                                             passiveRevision='237bc23af8bc66b33ba289d27f90c7969985c38e',
                                             routeLibVersion=$._routeLibVersion,
                                             passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-phub-prov': utils._RouteConfig(activeRevision='237bc23af8bc66b33ba289d27f90c7969985c38e',
                                            passiveRevision='237bc23af8bc66b33ba289d27f90c7969985c38e',
                                            routeLibVersion=$._routeLibVersion,
                                            passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-push': utils._RouteConfig(activeRevision='ae984fdaadacc12519ef66be704084aa4732062b',
                                       passiveRevision='ae984fdaadacc12519ef66be704084aa4732062b',
                                       routeLibVersion=$._routeLibVersion,
                                       passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-rate-limiting-sanity': utils._RouteConfig(activeRevision='be7308b7768284e16b9ace0161a1f57b06498c42',
                                                       passiveRevision='be7308b7768284e16b9ace0161a1f57b06498c42',
                                                       routeLibVersion=$._routeLibVersion,
                                                       passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-redact': utils._RouteConfig(activeRevision='ed9396d47b88ecba77b8c3d1d60238035f73d804',
                                         passiveRevision='ed9396d47b88ecba77b8c3d1d60238035f73d804',
                                         routeLibVersion=$._routeLibVersion,
                                         passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-reports': utils._RouteConfig(activeRevision='3144968a5ff93a64d2469705cef185f379ab9a38',
                                          passiveRevision='3144968a5ff93a64d2469705cef185f379ab9a38',
                                          routeLibVersion=$._routeLibVersion,
                                          passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-rtc': utils._RouteConfig(activeRevision='5e725215bf7fd7953eb24bbc29e0687534b45708',
                                      passiveRevision='5e725215bf7fd7953eb24bbc29e0687534b45708',
                                      routeLibVersion=$._routeLibVersion,
                                      passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-sms': utils._RouteConfig(
        activeRevision='7b52ae396a1c213880ddd2dae2da9f2d599ac5fa',
        passiveRevision='7b52ae396a1c213880ddd2dae2da9f2d599ac5fa',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-sms-internal': utils._RouteConfig(
        activeRevision='3b370de28fe81b7d11a1c29304a24b8825304683',
        passiveRevision='3b370de28fe81b7d11a1c29304a24b8825304683',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-tts': utils._RouteConfig(activeRevision='ce62c223925fa7f71cca99e8f745e43fc7dc5c2d',
                                      passiveRevision='83cf09f7636beb0d29b6d6864108a5bc7cb07a22',
                                      routeLibVersion=$._routeLibVersion,
                                      passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-utilities': utils._RouteConfig(activeRevision='327f69d3d271cc163a869db70380a09e306dd867',
                                            passiveRevision='327f69d3d271cc163a869db70380a09e306dd867',
                                            routeLibVersion=$._routeLibVersion,
                                            passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-vapi': utils._RouteConfig(activeRevision='cb2d9094e702c18b93f37fd2d04da980d5d54ec3',
                                       passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
                                       routeLibVersion=$._routeLibVersion,
                                       passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-verify': utils._RouteConfig(activeRevision='ef6956207f59700a3b7eba0b12a1db859a856afd',
                                         passiveRevision='ef6956207f59700a3b7eba0b12a1db859a856afd',
                                         routeLibVersion=$._routeLibVersion,
                                         passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-tokbox': utils._RouteConfig(activeRevision='efb0cb8ac2b4e686a0a1bdc3e8fc6b8eb4bd5888',
                                         passiveRevision='efb0cb8ac2b4e686a0a1bdc3e8fc6b8eb4bd5888',
                                         routeLibVersion=$._routeLibVersion,
                                         passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-tokbox-tools': utils._RouteConfig(activeRevision='e5ba8da9fd9faa27920aefc451bb4abb49382d13',
                                               passiveRevision='e5ba8da9fd9faa27920aefc451bb4abb49382d13',
                                               routeLibVersion=$._routeLibVersion,
                                               passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-tools': utils._RouteConfig(activeRevision='66e178eed2e251c96011ffb2b7c1be020a147269',
                                        passiveRevision='66e178eed2e251c96011ffb2b7c1be020a147269',
                                        routeLibVersion=$._routeLibVersion,
                                        passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-voice-inspector': utils._RouteConfig(activeRevision='43e1b14e4e74bb2d1590ab51730e8d69a0810b7b',
                                                  passiveRevision='43e1b14e4e74bb2d1590ab51730e8d69a0810b7b',
                                                  routeLibVersion=$._routeLibVersion,
                                                  passiveRouteLibVersion=$._routeLibVersionPassive),
      'nexmo-number-inventory': utils._RouteConfig(activeRevision='6bbcec8463a2f64e5f8b8988b3ba072a8ceeb765',
                                                   passiveRevision='6bbcec8463a2f64e5f8b8988b3ba072a8ceeb765',
                                                   routeLibVersion=$._routeLibVersion,
                                                   passiveRouteLibVersion=$._routeLibVersionPassive),
    },
    'gloo-vcc-routes'+: {
      'vcc-ms-teams-adapter': utils._RouteConfig(activeRevision='8e308eb75ef6f31e264af38f93a5107c82099172',
                                                 passiveRevision='8e308eb75ef6f31e264af38f93a5107c82099172',
                                                 routeLibVersion=$._routeLibVersion,
                                                 passiveRouteLibVersion=$._routeLibVersionPassive),
    },
    'gloo-vcp-routes'+: {
      'vcp-whiteboard-api': utils._RouteConfig(activeRevision='4e60de0d6986735d75e2131b3c0c8570d881db30',
                                               passiveRevision='4e60de0d6986735d75e2131b3c0c8570d881db30',
                                               routeLibVersion=$._routeLibVersion,
                                               passiveRouteLibVersion=$._routeLibVersionPassive),
      'vcp-boost': utils._RouteConfig(activeRevision='531f8f2c9c57fbf050c3b189621468709cf19f06',
                                      passiveRevision='1ae2b8f60b200ed4d6fa1e5a645ddc29f8fd463b',
                                      routeLibVersion=$._routeLibVersion,
                                      passiveRouteLibVersion=$._routeLibVersionPassive),
      'vcp-camara-api': utils._RouteConfig(activeRevision='75b63100f838913189fa63aec9f842066a55f2c1',
                                           passiveRevision='75b63100f838913189fa63aec9f842066a55f2c1',
                                           routeLibVersion=$._routeLibVersion,
                                           passiveRouteLibVersion=$._routeLibVersionPassive),
      'vcp-camara-oauth': utils._RouteConfig(activeRevision='99dc186812ccba51ccaf78dc822a14017cc3d330',
                                             passiveRevision='99dc186812ccba51ccaf78dc822a14017cc3d330',
                                             routeLibVersion=$._routeLibVersion,
                                             passiveRouteLibVersion=$._routeLibVersionPassive),
      'vcp-network-api-reg': utils._RouteConfig(activeRevision='924e5ba1ef9876d2aed593fa89cb20a0d99cfd34',
                                                passiveRevision='924e5ba1ef9876d2aed593fa89cb20a0d99cfd34',
                                                routeLibVersion=$._routeLibVersion,
                                                passiveRouteLibVersion=$._routeLibVersionPassive),
      'vcp-silent-auth': utils._RouteConfig(activeRevision='963a421716a44de06fd8a56d6690e88c1118c412',
                                            passiveRevision='963a421716a44de06fd8a56d6690e88c1118c412',
                                            routeLibVersion=$._routeLibVersion,
                                            passiveRouteLibVersion=$._routeLibVersionPassive),
      'vcp-number-insight': utils._RouteConfig(activeRevision='9226fa71af75d46a121077edf4e66d79fc6c546f',
                                               passiveRevision='1ae2b8f60b200ed4d6fa1e5a645ddc29f8fd463b',
                                               routeLibVersion=$._routeLibVersion,
                                               passiveRouteLibVersion=$._routeLibVersionPassive),
    },
  },
}
