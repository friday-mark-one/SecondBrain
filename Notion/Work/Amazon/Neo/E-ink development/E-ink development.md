---

---

[[Recovering from factory reset to adb]]

```shell
cd KFXRenderer
brazil-build --platform eink --enable-dinfo

cd ../KFXReader
rm -rf dependency/ && rm -rf build/*
brazil-build --platform eink
```

```shell
brazil-build -x test -x javadoc
brazil-build packagejar -x compileJava

adb push build/installer/* /mnt/us/
```


```shell
mntroot rw

unzip ./Readerjars.zip opt/amazon/ebook/lib/YJReader-impl.jar
rm -rf /opt/amazon/ebook/lib/YJReader-impl.jar
mv ./opt/amazon/ebook/lib/YJReader-impl.jar /opt/amazon/ebook/lib/YJReader-impl.jar

unzip ./Readerjars.zip opt/amazon/ebook/lib/ReaderSDK-impl.jar
rm -rf /opt/amazon/ebook/lib/ReaderSDK-impl.jar
mv ./opt/amazon/ebook/lib/ReaderSDK-impl.jar /opt/amazon/ebook/lib/ReaderSDK-impl.jar

unzip ./Readerjars.zip opt/amazon/ebook/lib/Reader-utils.jar
rm -rf /opt/amazon/ebook/lib/Reader-utils.jar
mv ./opt/amazon/ebook/lib/Reader-utils.jar /opt/amazon/ebook/lib/Reader-utils.jar

unzip ./Readerjars.zip opt/amazon/ebook/lib/ReaderSDK.jar
rm -rf /opt/amazon/ebook/lib/ReaderSDK.jar
mv ./opt/amazon/ebook/lib/ReaderSDK.jar /opt/amazon/ebook/lib/ReaderSDK.jar

unzip ./Readerjars.zip opt/amazon/ebook/lib/Reader-plugin.jar
rm -rf /opt/amazon/ebook/lib/Reader-plugin.jar
mv ./opt/amazon/ebook/lib/Reader-plugin.jar /opt/amazon/ebook/lib/Reader-plugin.jar

unzip ./Readerjars.zip opt/amazon/ebook/lib/ReaderContentSDK.jar
rm -rf /opt/amazon/ebook/lib/ReaderContentSDK.jar
mv ./opt/amazon/ebook/lib/ReaderContentSDK.jar /opt/amazon/ebook/lib/ReaderContentSDK.jar

rm -rf opt/

restart framework

(or)

(Almost always bricks the device)
mntroot rw
sh installCommands.sh

```

```shell
lipc-set-prop com.lab126.kaf logLevel all

lipc-set-prop com.lab126.winmgr.ligl logMask 0xffffffff
echo log 1 > /proc/hwtcon/cmd
echo epdc 1 > /proc/hwtcon/cmd

showlog -f

/sbin/stop syslog
```

```shell
tar xvf kfxReader_artifactory.tar.gz

export LD_LIBRARY_PATH=/mnt/us/usr/lib:$LD_LIBRARY_PATH
export DISPLAY=:0.0
stop kfxreader

/mnt/us/usr/bin/kfxreader -d

ASAN_OPTIONS=halt_on_error=0 LD_PRELOAD=libasan.so.6 /mnt/us/usr/bin/kfxreader -d

(or)

gdbserver --multi :5045 --attach PID

adb forward tcp:5045 tcp:5045

gdb -x gdb_init
```

```shell
1. Add the following CFLAGS and LDFLAGS for the required packages
-fsanitizer=address;fno-omit-frame-pointer

2. Push libasan.so to device
3. Run binary with LD_PRELOAD
LD_PRELOAD=libasan.so.6 /mnt/us/usr/bin/kfxreader -d
```

```shell
Refer - https://code.amazon.com/packages/KindleExternalKDEHeapTrack/blobs/mainline/--/README.md

LD_LIBRARY_PATH=/mnt/us/usr/lib HT_BACKTRACE_DEPTH=10 heaptrack /mnt/us/usr/bin/kfxreader
```

```shell
./eink exec "bitbake -b PDFReader/pdfreader_1.0_eink -c cleanall" "bitbake -b PDFReader/pdfreader_1.0_eink"

yocto/build/tmp/work/cortexa7hf-vfp-vfpv4-neon-zeusdistro-linux-gnueabi/pdfreader/1.0-eink/package/usr/
```

```shell
/app/tools/screenControl -k

adb forward tcp:8000 tcp:6789

```

```shell
export LD_LIBRARY_PATH=/mnt/us/foxit:$LD_LIBRARY_PATH
./main

convert -size 1488x2480 -depth 8 gray:image.png image_converted.png

identify --verbose image.png
```

### Regex

```shell
.*[0-9]

.*(ru|es|de|fr|it|ja|nl|pt|zh|en_GB).*\n

^(?!.*kfxreader.*).+$\n
.*(Xorg|cvm|tmd|evbug).*\n

.* FOXIT_TRACE:(ENTER|EXIT) *: /Users/baaskab/workspace/neo/src/KindlePDF/src/.*.cpp:[0-9]* thread_id: [0-9]* .*\(\) invoked

FOXIT_TRACE: ENTER: .*\n|^[0-9]*\n|.*\| 


^(?!Took .*).+$\n
ms for load\(\)->_(([0-9A-Za-z_])*).*

# adb pull multiple files with wildcard
adb shell 'find /mnt/us/ -name "*.pgm" -print0' | xargs -0 -n 1 adb pull
```

### Quick link to inspect KBITS build commits

```javascript
https://kbits.build.lab126.a2z.com/?product=Mainline&product_family=Eink&project=juno_sbr_barolo_bellatrix3
https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/buildsys/fetch-brazil-artifacts.properties?r=8c23f6b
https://code.amazon.com/version-sets/KER/publish@6249267250?show_packages=yes#packages
```

```shell
adb devices
adb -s G090VB0615130DHP shell

```

### Unbrick e-reader device (using debug board kiosk)

[https://quip-amazon.com/oR0EAs9rcYka/Flashing-Device-with-Fastboot](https://quip-amazon.com/oR0EAs9rcYka/Flashing-Device-with-Fastboot)

[https://w.amazon.com/bin/view/KindlePlusPlus/2020LearningSeries/EReaderUnbrick101/DebugBoardKiosk/](https://w.amazon.com/bin/view/KindlePlusPlus/2020LearningSeries/EReaderUnbrick101/DebugBoardKiosk/)

### Yocto env setup for creating buddy build 

```javascript
https://wiki.labcollab.net/confluence/display/EINK/E-Reader+AWS+Build+Developer+Guide

```

### Prettify Json on VS Code

```javascript
shift + option + F
```

/PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC
