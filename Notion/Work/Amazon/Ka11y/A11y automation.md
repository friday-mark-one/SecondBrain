---

---

[[aae.diff]]

Build apk file in KindleAndroidReader:

`brazil-build assembleKfaInstrumented`Install apk :

`adb install /Users/zhouyec/Documents/Kindle/kindle_workspace/ KAR_peru/kar/src/KindleAndroidReader/StandAlone/build/outputs/apk/kfa/ instrumented/StandAlone-kfa-universal-instrumented-*.apk`

**ELK STEPS**

try to set up the workspace and run the tests with below steps:

brazil ws create --name ELK -vs KraftELKDeploy/development

cd ELK

brazil ws use -p ELKTestRunner

brazil setup platform-support

cd src/ELKTestRunner

Apply this fix

[[adb-fix.diff]]

brazil-build

Run command in ELKTestRunner:

`brazil-runtime-exec ELKTestRunner -P /Volumes/workplace/ELKAuto/src/KindleAndroidReader -x /Volumes/workplace/ELKAuto/src/KindleAndroidReader/KindleReaderApiTestsCommon/configuration/yeTests.xml --skip-registration`

adb shell errors

1. Manually push the file to Downloads first
2. Then copy the testng folder along with yeTests.xml to [com.amazon.kindle](http://com.amazon.kindle/) location
3. Somehow cleanup the /storage/emulated/0/Android/data/com.amazon.kindle/files/testng/ folder for every run

