---

---
- Plan: [https://quip-amazon.com/bWpCA0wUJNbx/First-Phase-Plan-for-Reader-Migration](https://quip-amazon.com/bWpCA0wUJNbx/First-Phase-Plan-for-Reader-Migration)
- Tasks: [https://quip-amazon.com/5wA3AdiiFQ3T/Reader-Migration-TasksBrainstorming](https://quip-amazon.com/5wA3AdiiFQ3T/Reader-Migration-TasksBrainstorming)
- E2E arch: [https://quip-amazon.com/LOFzAKHME7gY/Neo-End-To-End-Architecture](https://quip-amazon.com/LOFzAKHME7gY/Neo-End-To-End-Architecture)
- Features: [https://quip-amazon.com/gFBbAtw9DG1v/Reader-UI-Java-to-Native-Which-pieces-to-migrate](https://quip-amazon.com/gFBbAtw9DG1v/Reader-UI-Java-to-Native-Which-pieces-to-migrate)

### Resources from Slack

kfxreader: [https://w.amazon.com/index.php/Yellow%20Jersey/Eink](https://w.amazon.com/index.php/Yellow%20Jersey/Eink)
reader: [https://broadcast.amazon.com/videos/180771](https://broadcast.amazon.com/videos/180771)
E-reader development basics: [https://broadcast.amazon.com/videos/178235](https://broadcast.amazon.com/videos/178235)
Remote debugging for eReader: [https://broadcast.amazon.com/videos/137431](https://broadcast.amazon.com/videos/137431)
eReader lower level stack: [https://broadcast.amazon.com/videos/187345](https://broadcast.amazon.com/videos/187345)
For the full channel list of videos: [https://broadcast.amazon.com/channels/12254](https://broadcast.amazon.com/channels/12254)

# Pipelines

[https://issues.labcollab.net/browse/NEO-399](https://issues.labcollab.net/browse/NEO-399)

Are pipelines synthesized with LPT or manual?

How does KFXReader or any of the rendering libraries reach kindle-eink-live?

What other packages from renderer are needed?

Do we have dependencies on renderer only at eInk level or should we expand our thinking to all reader surfaces?

Supported OS in each VS


# Yocto libs automation

- Few files which are present in brazil are not available in JunoSDK tarball
- Certain shared objects have different version numbers
- Shared Objects are not stripped in JunoSDK tarball

libmongoose.so

/tmp/JunoSDK/usr/lib/librsvg-2.so.2.40.20

/tmp/JunoSDK/usr/lib/libcurl.so.4.5.0

/tmp/JunoSDK/usr/lib/libbz2.so.1.0.6

/tmp/JunoSDK/usr/lib/libpng16.so.16.15.0

/tmp/JunoSDK/usr/lib/libcroco-0.6.so.3.0.1

Dry-run with arm-strip: [https://build.amazon.com/5732043722](https://build.amazon.com/5732043722)

## Algorithm

1. Load all required files from `KindleEinkSDK` in to memory
    1. Iterate through files in configuration directory
    2. Store the following information for each lib in the directory
        1. Whether the file is a simple file or symbolic link
        2. ~~base file name (without extension)~~
        3. version (numbers after extension)
        4. file extension
        5. full path
    3. Store the following information for each non-lib file in the directory
        6. Path relative to `lib/eink` or `include/eink`
        7. file extension
        8. full path
2. Do step 1 again with JunoSDK directory
3. For each simple file in KindleEinkSDK, check the corresponding file in JunoSDK
    4. if it is not present, add to report or skip?
    5. if present and the file is a lib
        9. strip the lib in JunoSDK
        10. if same version exists
            1. compare md5sum; if different, copy the one from JunoSDK, else continue.
        11. if version is different
            2. copy new version from JunoSDK and update existing symlinks in KindleEinkSDK.
            3. Delete the existing version?
    6. if present and the file is non-lib
        12. compare md5sum; if different, copy the one from JunoSDK, else continue.
    7. for all copy operations update the report
4. Generate report with diff
    8. enum like list of differences
    9. presentation layer will deliver message appropriately based on the enum


- [x] KindleEinkToolchain strip library verification
- [x] How to send email?
- [ ] Generate report for commit message and CR
- [ ] How to download JunoSDK tarball
- [x] How to checkout package
- [ ] How to post CR?
- [x] Refactor code
    - [x] Utils
    - [x] Constants
- [x] Check if a system account exists
- [x] How to setup DJS?
- [x] Check Brazil package name with Jimmy

## Open questions

- [x] What to do for files that are missing in JunoSDK tarball?
- [x] What to do if there is a newer version of .so file available?
    - [x] Should we create a symlink with older version to new version or just replace and update existing symlinks?
    - [x] What if both current and newer version exists in JunoSDK?
- [x] Generate report and sendmail or automate end-to-end?
- [x] Run-as user for cron job - existing system account having all permissions already
- [x] Existing package or new Package name and version set
    - [x] JunoSDKSyncUtil
- [x] Which version set to build KindleEinkSDK in?
    - [x] KEXT/develop



header file change send mail

otherwise check-in automatically

bot account for accessing kbits


python support

IAM / kerberos issues

whom to contact for further doubts

PDX corp - DJS


vs, pipeline, system user permission,

System accounts: [https://gsam.corp.amazon.com/list](https://gsam.corp.amazon.com/list)

[https://builderhub.corp.amazon.com/docs/apollo/user-guide/howto-simple-environment-setup.html](https://builderhub.corp.amazon.com/docs/apollo/user-guide/howto-simple-environment-setup.html)

[https://builderhub.corp.amazon.com/docs/pipelines/user-guide/getting-started-create-your-pipeline.html](https://builderhub.corp.amazon.com/docs/pipelines/user-guide/getting-started-create-your-pipeline.html)

Configure VS: Python37

Ref: [https://code.amazon.com/packages/AlexaAlarmsPromptsPuller/trees/mainline](https://code.amazon.com/packages/AlexaAlarmsPromptsPuller/trees/mainline)

[https://w.amazon.com/index.php/DJS/UserDocs/Running_DJSAgent_as_a_Consumable_Environment](https://w.amazon.com/index.php/DJS/UserDocs/Running_DJSAgent_as_a_Consumable_Environment)


/apollo/env/OdinTools/bin/odin adminAPI --reservens --namespace com.amazon.eink.utility --bindle amzn1.bindle.resource.n3pqvbcp2fhdnaredmaa

/apollo/env/OdinTools/bin/odin admin NewMaterial -n com.amazon.eink.utility.GitFarm.JunoSDK --materialSetType AsymmetricKey --keyAlgorithm RSA --keyStrength 1024 --bindleOwner amzn1.bindle.resource.n3pqvbcp2fhdnaredmaa --cti Kindle/Software/KPP --severity 3

[https://t.corp.amazon.com/a5495438-0fac-44ac-9d16-6d8ad79d2116](https://t.corp.amazon.com/a5495438-0fac-44ac-9d16-6d8ad79d2116)

[https://code.amazon.com/packages/GitFarmService/blobs/e0631ba8206bb2c5921b02aedb0bf69ca470d7ac/--/etc/uid_to_material_set_mapping.yml](https://code.amazon.com/packages/GitFarmService/blobs/e0631ba8206bb2c5921b02aedb0bf69ca470d7ac/--/etc/uid_to_material_set_mapping.yml)

when odin material changes - minimal deployment needs to be done.

install git if needed - [https://code.amazon.com/packages/AWSElasticsearchKibanaBuildScripts/blobs/mainline/--/configuration/ApolloCmd/ActivateAdmin/099installGit.sh](https://code.amazon.com/packages/AWSElasticsearchKibanaBuildScripts/blobs/mainline/--/configuration/ApolloCmd/ActivateAdmin/099installGit.sh)

```javascript
sudo sudo -u kgitbot ssh git.amazon.com -vv -p 2222 \
-o Protocol=2                         \
-o UserKnownHostsFile=/etc/ssh/kgitbot_known_hosts \
-o GSSAPIAuthentication=no            \
-o KbdInteractiveAuthentication=no    \
-o PasswordAuthentication=no          \
-o ChallengeResponseAuthentication=no \
-o PreferredAuthentications=publickey \
-i /etc/ssh/kgitbot_key -l kgitbot


sudo sudo -u kgitbot ssh git.amazon.com -vv -p 2222 \
-o UserKnownHostsFile=/etc/ssh/kgitbot_known_hosts \
-i /etc/ssh/kgitbot_key -l kgitbot
```

## CriticService

[https://w.amazon.com/bin/view/BuilderTools/Product/Critic/UserGuide/#Creating_CRUX_code_reviews_programmatically](https://w.amazon.com/bin/view/BuilderTools/Product/Critic/UserGuide/#Creating_CRUX_code_reviews_programmatically)

[https://w.amazon.com/bin/view/AAA/Guide/Onboarding](https://w.amazon.com/bin/view/AAA/Guide/Onboarding)

Service request - [https://aaa.amazon.com/changes/amzn1.aaa.RChange.cpoalecpe2ttpbc6bpb6254md4](https://aaa.amazon.com/changes/amzn1.aaa.RChange.cpoalecpe2ttpbc6bpb6254md4)

[https://aaa.amazon.com/changes/amzn1.aaa.RChange.ivsfq4shlxynga7xs5k6bmnqh4](https://aaa.amazon.com/changes/amzn1.aaa.RChange.ivsfq4shlxynga7xs5k6bmnqh4)

Anvil - [https://anvil.amazon.com/applications/114289](https://anvil.amazon.com/applications/114289)

sudo sudo -u kgitbot GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/etc/ssh/kgitbot_known_hosts -l kgitbot -i /etc/ssh/kgitbot_key" git push ssh://git.amazon.com/pkg/KindleEinkSDK/snapshot/kgitbot/22021-12-16T20-40-12 cf5cd4be5582b8e9737f6ae5e51d3a3bad271471:refs/heads/head

source-code permission - [https://permissions.amazon.com/user.mhtml?lookup_user=kgitbot](https://permissions.amazon.com/user.mhtml?lookup_user=kgitbot)

- [x] Refactor CR code on top of lasso test
- [x] Check failure cases for all commands
- [ ] Failure notification through DJS
- [x] Try to remove git hack 
- [x] CR new review vs new revision
- [x] unit test
- [x] Address code review comments
- [x] Add comments to code
- [x] create TEAM for eink-app-dev
- [x] branch variable in code
- [x] test git push
- [x] diff malbec vs moonshine
- [ ] diff report for CR and commit message

# Editor Integration with Java side

option in popup

[EinkReader](https://code.amazon.com/packages/EInkReader/trees/mainline) - package - user gesture

JNI - [https://eink-grok.aka.amazon.com/eink_dev_mainline/xref/repo/java/apps/booklet_reader/jni/com_amazon_ebook_booklet_reader_utils_factory_ReaderJNIFactory.c?r=91665bd2#2142](https://eink-grok.aka.amazon.com/eink_dev_mainline/xref/repo/java/apps/booklet_reader/jni/com_amazon_ebook_booklet_reader_utils_factory_ReaderJNIFactory.c?r=91665bd2#2142)

## Bugs

- [ ] What if there is no simple .so file but only a version .so file which has a version upgrade. Eg. libpng.so.48 vs libpng.so.52 and there is no symlinks called libpng.so. Should the version be upgraded in that case?
- [x] Symlinks are conveniently ignored
- [x] Following so files have symlink direction inverted
    - [x] libcjson
    - [x] libicudata
    - [x] libicui18n
    - [x] libicuio
    - [x] libicuuc
    - [x] libuuid
    - [x] libzhtransliterator
- [ ] the following shared objects don’t have version number associated
    - [ ] libbpg
    - [ ] libjpegXR
    - [ ] liblua
    - [ ] liblz4
    - [ ] libminiunz
    - [ ] libmongoose


### Dry-run with manual changes

KR/develop - [https://build.amazon.com/5820831057](https://build.amazon.com/5820831057)

Kindle/eink-live - [https://build.amazon.com/5820831756](https://build.amazon.com/5820831756)

CR: [https://code.amazon.com/reviews/CR-64290639](https://code.amazon.com/reviews/CR-64290639)


Hey everyone, in this session I would like to walkthrough the automation that I built for syncing JunoSDK artifacts to KindleEinkSDK. As you know, these two are hosted and built in different systems. JunoSDK artifacts are built and archived in the Eink Yocto system, whereas some of the apps and libraries that consume these artifacts are built in the Brazil system. 

Previously, whenever a change is made in the Eink Yocto system, it has to be manually changed again in KindleEinkSDK in the brazil system. If we miss to make the exact change in brazil system, there might be undefined behavior or even worse it may cause runtime crashes. 

In order to bridge this gap and to reduce manual effort, this automation takes care of syncing changes between these 2 systems. 

It does the following things and in this order

5. Fetch KindleEinkSDK package locally
6. Download latest JunoSDK tarball from KBITS
7. Sync the latest versions of headers and libraries from JunoSDK to KindleEinkSDK
8. If there is an interface/header change, publish a CR.
9. Else push the commit directly to mainline and let the pipeline do the rest.
