function(gaNames, clusterId, vgRegion, clusterRegion) {
  // NOTE: GA only exists on US-WEST-2
  local script = |||
    #!/bin/bash
    ################################## FUNCTIONS ##################################
    DEBUG=false;
    function trace_if_debug () {
      if [ %(debugFlag)s = true ]; then echo "$1"; fi
    };

    # Outputs an error message if a command failed, then exits if passed $2==true
    function update_exec_code_and_throw_on_failure () {
      LAST_EXEC_CODE=$?;
      if [ $LAST_EXEC_CODE -ne 0 ]; then echo "Unexpected Failure: $1, ErrorCode: $LAST_EXEC_CODE"; if [ $2 == true ]; then exit $LAST_EXEC_CODE ; fi fi
    };

    function convert_to_xpath_cond () {
      GA_NAMES=$(echo "$1" |  tr -d '[][:space:]' | sed 's/"/`/g' | sed 's/,/\|\|Name==/g');
      GA_NAMES='Accelerators[?Name=='"$GA_NAMES"'].AcceleratorArn';
      echo "$GA_NAMES";
    };

    function list_ga_listeners() {
      GA_LISTENER_ARN=$(aws globalaccelerator list-listeners --region %(gaRegion)s --accelerator-arn $1 --o text --query 'Listeners[*].ListenerArn');
      # only consider listeners which can be queries
      echo "$GA_LISTENER_ARN";
    };

    function list_albs() {
      ALB=$(aws globalaccelerator list-endpoint-groups --region %(gaRegion)s --listener-arn $1 --o text --query 'EndpointGroups[?EndpointGroupRegion==`%(clusterRegion)s`].EndpointDescriptions |[].EndpointId');
      echo "$ALB";
    };
    ###############################################################################

    GA_COND=$(convert_to_xpath_cond %(gaNames)s);

    echo "Checking if cluster is active, global-acceleratos-name: %(gaNames)s, ga-region: %(gaRegion)s, cluster: %(clusterId)s, region: %(clusterRegion)s, vg-region: %(vgRegion)s";

    # List of relevant accelerators (accelerators with gaNames)
    GA_ARNS=$(aws globalaccelerator list-accelerators --region %(gaRegion)s --o text --query $GA_COND);
    update_exec_code_and_throw_on_failure "Failed to list accelerators" ;

    GA_LISTENERS_ARNS=();
    # List of GAs listeners in $GA_LISTENERS_ARNS
    for GA_ARN in $GA_ARNS; do GA_LISTENERS_ARNS+=($(list_ga_listeners $GA_ARN)); done
    trace_if_debug "GA_LISTENERs ARNs: $GA_LISTENERS_ARNS";

    ALBS=();
    for GA_LISTENER in $GA_LISTENERS_ARNS; do ALBS+=($(list_albs $GA_LISTENER)); done
    trace_if_debug "ALBs ARNs: $ALBS";

    TG_CLUSTERS=$(aws elbv2 describe-tags --region %(clusterRegion)s --resource-arns $ALBS --o text --query 'TagDescriptions[].Tags |[]| [?Key==`registered-clusters`].Value');
    update_exec_code_and_throw_on_failure "Failed to list tags on lbs: $ALBS" true;
    trace_if_debug "Current Active Clusters TG_CLUSTERS: $TG_CLUSTERS";

    if [[ "$TG_CLUSTERS[@]" =~ %(clusterId)s ]]; then echo "Cluster is active, failing..."; exit 1; fi

    echo "Cluster not active through GA: %(gaNames)s";
  ||| % {
    gaNames: std.escapeStringBash(gaNames),
    gaRegion: 'us-west-2',
    clusterId: clusterId,
    vgRegion: vgRegion,
    clusterRegion: clusterRegion,
    debugFlag: false,
  },

  PredeployScript: script,
}
