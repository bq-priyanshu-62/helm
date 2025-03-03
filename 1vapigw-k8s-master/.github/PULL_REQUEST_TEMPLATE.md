## Changes:
All PRs in this repo must be approved by someone in the 1v api gw team. See this page for information on how to release to production: https://confluence.vonage.com/display/1APIG/Release+to+Production

Specifically you must: 
- [ ] Create or update tests in the /test folder in this repo if your route changes behaviour
- [ ] Update the passive cluster before updating the active cluster
- [ ] All gateway tests must pass in the passive cluster before promoting to the active cluster (see #api-gw-notify channel in slack for any failures)
- [ ] PR must be approved by someone in your team before raising with the gateway team
- [ ] For the active clusters the PR should update 1 region or geo at a time


## Merging:
#### To trigger a merge + test using bors, comment on the PR with the following

run the checks without merging
```
bors try
```
run the test and merge only when successful
```
bors merge
```

Cancel command ? append '-' at the end
```
bors try-
```
```
bors merge-
```
