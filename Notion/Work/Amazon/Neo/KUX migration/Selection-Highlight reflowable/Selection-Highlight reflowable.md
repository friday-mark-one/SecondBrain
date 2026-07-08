---

---
![[Notion/Work/Amazon/Neo/KUX migration/Selection-Highlight reflowable/New database/New database.base]]

Questions to PM & UX

- [x] Selection & highlight arrows across all surface?
- [x] Multi-page selection behavior unify across all surface
- [x] Pinyin deprecated?
- [ ] Better quality PNG or a simple SVG

KindleRendering/develop@6174690307

KPPReader/develop@6173559348

### Android buddy build

**Avinash Bharat**

[1 hour ago](https://amzn-wwc.slack.com/archives/D0244FWVCF8/p1711389893315909)

Dry-run KUX changes to get an Android build : [https://w.amazon.com/bin/view/KindleGBuild/Projects/KindlePeruMigration/KindleAndro[…]/OnboardingHomeworks/UsingKBBforBrazilPeruCrossoverDevelopment](https://w.amazon.com/bin/view/KindleGBuild/Projects/KindlePeruMigration/KindleAndroidReader/OnboardingHomeworks/UsingKBBforBrazilPeruCrossoverDevelopment#HExercise:DryrunyourBrazilchangesinPeru)

:ty-thankyou:**1**

1 reply

---

**Avinash Bharat**

[1 hour ago](https://amzn-wwc.slack.com/archives/D0244FWVCF8/p1711389913348369?thread_ts=1711389893.315909&cid=D0244FWVCF8)

TL;DR is

1. brazil ws dryrun the brazil pkg changes in `Kindle/continuous-release` versionset.
2. Wait for `KindleAndroidReaderExportedDependencies` & `KindleBrazilBundlerTrigger`** **to finish building.
3. Set-up local peru workspace with `kindle/central` versionset. Checkout `KindleBrazilBundler` and do a `bb dryrun -br <brazil-versionset-request-id>`
4. brazil ws dryrun KindleBrazilBundler from the local peru workspace.