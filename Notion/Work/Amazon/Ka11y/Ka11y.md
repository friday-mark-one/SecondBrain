---

---

[[A11y automation]]

Personal team - C5F8P2RU2S

**Follow**

1. [https://code.amazon.com/packages/KRFFrameworkFromSource/blobs/mainline/--/README.md](https://code.amazon.com/packages/KRFFrameworkFromSource/blobs/mainline/--/README.md)
2. [https://code.amazon.com/packages/KindleForiOS/trees/mainline](https://code.amazon.com/packages/KindleForiOS/trees/mainline)
3. [https://quip-amazon.com/6unpAl59Pu5Q/Lanjuns-Steps-for-Building-to-KindleForiOS-physical-device](https://quip-amazon.com/6unpAl59Pu5Q/Lanjuns-Steps-for-Building-to-KindleForiOS-physical-device)



```shell
mwinit -s

brazil ws create --name ios --versionSet P2R/lassen-staging
cd ios
brazil setup platform-support
brazil ws use -p KindleContentAccessibility \
						  -p KFXRenderer \
						  -p KRF \
						  -p KindleForiOSConfigOverride \
						  -p KindleForiOSSigningIdentity \
						  -p FrameworkFromSourceHelperScripts \
						  -p KRFFrameworkFromSource \
						  -p KindleForiOS \
						  --latest
						  
cd $(findup packageInfo)/src/KindleForiOSConfigOverride
git checkout dev-quick-build

sudo gem install xcodeproj
```

```shell
# Find DRMSDK build number from VS
# Goto https://code.amazon.com/packages/DRMSDK/releases/<version_number>
# Download all 3 Prelease libDRMSDK.a artifacts and replace it at the corresponding local Release location

$HOME/brazil-pkg-cache/packages/DRMSDK/DRMSDK-<version_number>/AL2_x86_64/DEV.STD.PTHREAD/build/
```

```javascript
cd ../KindleContentAccessibility
../FrameworkFromSourceHelperScripts/build-for-lassen-monobuild.sh
```

```shell
# KFXRenderer

cd ../KFXRenderer

# 1. Update gyp to not build anything other than KUX & YJR
# 2. Update zshield/ios/zshield-config.json to remove the content inside unprotected-output-files

diff --git a/KFXRenderer.gyp b/KFXRenderer.gyp
index 792f5d3ac..de2b9fc5f 100644
--- a/KFXRenderer.gyp
+++ b/KFXRenderer.gyp
@@ -145,7 +145,7 @@
         ],
     },

-    'includes': ['dependency/gyp/ZgxSkia.gypi', 'mac_catalyst.gypi', 'YJR.gypi', 'KUX.gypi', 'YJRasterRender.gypi', 'YJRaster.gypi', 'YJValidator.gypi', 'YJUnitTest.gypi', 'YJUnitTestServer.gypi', 'PageRenderer.gypi', 'YJPreviewer.gypi'],
+    'includes': ['dependency/gyp/ZgxSkia.gypi', 'mac_catalyst.gypi', 'YJR.gypi', 'KUX.gypi', 'YJPreviewer.gypi'],
     'conditions': [
         ['target_os == "mac"', {
             'includes': ['EastAsianChecker.gypi', 'CacheInspector.gypi', 'YJQuery.gypi'],
diff --git a/zshield/ios/zshield-config.json b/zshield/ios/zshield-config.json
index 909a367e4..3d73e785b 100644
--- a/zshield/ios/zshield-config.json
+++ b/zshield/ios/zshield-config.json
@@ -1,7 +1,5 @@
 {
   "protected-static-lib-link-pkgs": ["dependency/lib/ios/{build_config}/DRMSDK-protection-data.nwdb"],
   "unprotected-output-files": [
-          "build/bin/ios/{build_config}-iphoneos/IOSUnitTestServer.app",
-          "build/bin/ios/{build_config}-iphonesimulator/IOSUnitTestServer.app"
   ]
-}
\ No newline at end of file
+}

../FrameworkFromSourceHelperScripts/build-for-lassen-monobuild.sh
```

```javascript
cd ../KRF

# Update zshield-config.json files to remove the content inside unprotected-output-files

diff --git a/zshield/ios/device/zshield-config.json b/zshield/ios/device/zshield-config.json
index 42f1259f2..3d73e785b 100644
--- a/zshield/ios/device/zshield-config.json
+++ b/zshield/ios/device/zshield-config.json
@@ -1,10 +1,5 @@
 {
   "protected-static-lib-link-pkgs": ["dependency/lib/ios/{build_config}/DRMSDK-protection-data.nwdb"],
   "unprotected-output-files": [
-          "xcodebuild/{build_config}-iphoneos/TestRunnerCore.app",
-          "xcodebuild/{build_config}-iphoneos/TestRunnerPlugins.app",
-          "xcodebuild/{build_config}-iphoneos/iOSPlatformTests.app",
-          "xcodebuild/{build_config}-iphoneos/iOSContentVerification.app",
-          "xcodebuild/{build_config}-iphoneos/iOSRandomNavigator.app"
   ]
-}
\ No newline at end of file
+}
diff --git a/zshield/ios/simulator/zshield-config.json b/zshield/ios/simulator/zshield-config.json
index fd6e4d3df..3d73e785b 100644
--- a/zshield/ios/simulator/zshield-config.json
+++ b/zshield/ios/simulator/zshield-config.json
@@ -1,10 +1,5 @@
 {
   "protected-static-lib-link-pkgs": ["dependency/lib/ios/{build_config}/DRMSDK-protection-data.nwdb"],
   "unprotected-output-files": [
-          "xcodebuild/{build_config}-iphonesimulator/TestRunnerCore.app",
-          "xcodebuild/{build_config}-iphonesimulator/TestRunnerPlugins.app",
-          "xcodebuild/{build_config}-iphonesimulator/iOSPlatformTests.app",
-          "xcodebuild/{build_config}-iphonesimulator/iOSContentVerification.app",
-          "xcodebuild/{build_config}-iphonesimulator/iOSRandomNavigator.app"
   ]
-}
\ No newline at end of file
+}


brazil-build --platform ios -t Libs
```

```shell
cd ../KindleForiOSConfigOverride
brazil-build

cd ../KindleForiOSSigningIdentity
brazil-build

cd ../KRFFrameworkFromSource
../FrameworkFromSourceHelperScripts/build-for-lassen-monobuild.sh --ios-platform ios_device

cd ../KindleForiOS
../FrameworkFromSourceHelperScripts/build-for-lassen-monobuild.sh --ios-platform ios_device

./setup_personal_team_build.py C5F8P2RU2S

open Lassen.xcworkspace
```

Follow the steps in #1 to link KRF.framework properly

```shell
# Fix KindleExternalICU path for build/lib/ios/Release vs build/lib-ios-Release using symlink
cd /Users/baaskab/brazil-pkg-cache/packages/KindleExternalICU/KindleExternalICU-1.0.18759.0/AL2_x86_64/DEV.STD.PTHREAD/build/lib/
mkdir ios
cd ios
ln -s ../../lib-ios-Release Release

Click Play button for Kindle app
```


- [x] Edit the pictures with arrows
- [x] Incremental build for header change
- [x] Multiple libraries when including
- [x] Arm64

- [ ] Weblab change in KindleForiOS or LassenBookReader?
- [ ] Custom rotor code not invoked on book open
- [ ] Multiple announcements for multiple lines