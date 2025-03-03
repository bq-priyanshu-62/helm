#!/usr/bin/env bash

# Parameters
# $1 -- Argocd username
# $2 -- Argocd password
# $3 -- Hard refresh flag (--hard-refresh)

# Syncs resources on argocd with hard refresh option

HARD_REFRESH=false
OTHER_ARGUMENTS=()

for arg in "$@"
do
    case $arg in
        -hr|--hard-refresh)
        HARD_REFRESH=true
        shift # Remove --warning-only from processing
        ;;
        *)
        OTHER_ARGUMENTS+=("$1")
        shift # Remove generic argument from processing
        ;;
    esac
done

# Parameters
ARGOCD_USERNAME=${OTHER_ARGUMENTS[1]}
ARGOCD_PASSWORD=${OTHER_ARGUMENTS[2]}



echo 'Connecting to argocd..'

#TODO: add active cluster check first
CONNECTION=$(argocd login localhost:8080 --username "$ARGOCD_USERNAME" --password "$ARGOCD_PASSWORD" --plaintext)
CONNECTION_RES=$?
echo "$CONNECTION"

if [[ $CONNECTION_RES != 0 ]]; then
    echo 'Failed to connect to argocd'
    exit 1
fi

echo "Fetching apps names to sync..."
ALL_APPS=$(argocd app list -o name)
ALL_APPS_RES_CODE=$?

if [[ $ALL_APPS_RES_CODE != 0 ]]; then
    echo 'Failed to retrieve argocd apps'
    exit 1
fi


for APP in $ALL_APPS
do
  if [[ $HARD_REFRESH == true ]]; then
    echo "---------------------Refreshing app: $APP ---------------------"
    argocd app get "$APP" --hard-refresh
  fi
  echo "---------------------Syncing app: $APP ---------------------"
  argocd app sync "$APP"
  echo "---------------------Synced app: $APP ---------------------"
done
