---

---
[[Neo-1887]]

[[NEO-2749 YJOP books do not show up on metrics board]]

[[NEO-101 Selection and Highlight]]

[[Crash JIRAs]]

[[KUX Comics-Manga]]

[[Debrick]]

[[Selection/Highlight reflowable]]



- [ ] Goto doesn’t go to the right page
- [ ] End of the book action don’t work
- [ ] Pinch to zoom crashes


# Pinch to zoom crash - NEO-1584

[https://issues.labcollab.net/browse/NEO-1584](https://issues.labcollab.net/browse/NEO-1584)

Helpful introduction to eink - [https://broadcast.amazon.com/videos/414098](https://broadcast.amazon.com/videos/414098)

Followed [https://code.amazon.com/packages/KindleNeoEinkSample/blobs/kux-integration/--/README.md](https://code.amazon.com/packages/KindleNeoEinkSample/blobs/kux-integration/--/README.md)

with reference to [https://code.amazon.com/packages/KFXReader/blobs/mainline/--/README.md](https://code.amazon.com/packages/KFXReader/blobs/mainline/--/README.md)

adb hanging - [https://stackoverflow.com/a/70794894/3505471](https://stackoverflow.com/a/70794894/3505471)

### Doubts

- [x] Args for kfxreader
- [x] Quran book ASIN? - B077TWFMX6
- [x] Debug mode for kfxreader - pass -d option to kfxreader 
- [x] Figure out where gestures are handled
- [ ] Is it possible to add breakpoints to KUX code?

Pinch and zoom Crash

```javascript
Thread 1 "kfxreader" received signal SIGSEGV, Segmentation fault.
0x0006b952 in ImageUtil::Rescale::nearestNeighborhood (src=src@entry=0x0, srcX=srcX@entry=0, srcY=srcY@entry=0, srcW=srcW@entry=0, srcH=srcH@entry=0, srcStrideW=srcStrideW@entry=0, dst=0x6edf5008 "", dstW=1264, dstH=1680, dstStrideW=1264) at /Users/baaskab/workspace/neo/src/KFXReader/src/image/Rescale.cpp:84
84	            dst[dstYOffset + m] = src[srcYOffset + x];
(gdb) bt
#0  0x0006b952 in ImageUtil::Rescale::nearestNeighborhood (src=src@entry=0x0, srcX=srcX@entry=0, srcY=srcY@entry=0, srcW=srcW@entry=0,
    srcH=srcH@entry=0, srcStrideW=srcStrideW@entry=0, dst=0x6edf5008 "", dstW=1264, dstH=1680, dstStrideW=1264)
    at /Users/baaskab/workspace/neo/src/KFXReader/src/image/Rescale.cpp:84
#1  0x0007518a in PanZoomManager::fastRescale (this=0x502ca8) at /Users/baaskab/workspace/neo/src/KFXReader/src/ui/GraphicUtil.h:64
#2  0x00080828 in Yjff::zoomUpdate (this=0x4698a0, deltaFactor=<optimized out>) at /Users/baaskab/workspace/neo/src/KFXReader/src/yjff/Yjff.cpp:1784
#3  0x00088c9c in YjffGesture::zoomOut (this=<optimized out>, loc=...) at /Users/baaskab/workspace/neo/src/KFXReader/src/yjff/YjffGesture.cpp:585
#4  0x00088e48 in YjffGesture::zoomStateHdl (this=0x4f7a88, eid=<optimized out>, data=<optimized out>)
    at /Users/baaskab/workspace/neo/src/KFXReader/src/yjff/YjffGesture.h:151
#5  0x00073208 in std::function<bool (int, void*)>::operator()(int, void*) const (__args#1=<optimized out>, __args#0=11, this=0x4f7b28)
    at /Users/baaskab/brazil-pkg-cache/packages/KindleEinkToolchain/KindleEinkToolchain-default.444.0/AL2_x86_64/DEV.STD.PTHREAD/build/eink-cross-toolchain.mac/arm-linux-gnueabi/include/c++/10.2.1/bits/std_function.h:622
#6  GtkEvents::raiseGestureEvent (this=this@entry=0x4f8170, eid=eid@entry=GtkEvents::ZOOM_OUT, data=data@entry=0x4f81a4)
    at /Users/baaskab/workspace/neo/src/KFXReader/src/ui/GtkUI.cpp:598
#7  0x00073244 in GtkEvents::raiseGestureEvent (this=this@entry=0x4f8170, eid=eid@entry=GtkEvents::ZOOM_OUT)
    at /Users/baaskab/workspace/neo/src/KFXReader/src/ui/GtkUI.h:509
#8  0x00073748 in GtkEvents::twoFingerHoldHandler (eventId=0, data=<optimized out>, this=0x4f8170)
    at /Users/baaskab/workspace/neo/src/KFXReader/src/ui/GtkUI.cpp:893
#9  GtkEvents::twoFingerHoldHandler (this=0x4f8170, eventId=<optimized out>, data=<optimized out>)
    at /Users/baaskab/workspace/neo/src/KFXReader/src/ui/GtkUI.cpp:875
#10 0x00074a2e in GtkUI::btnPressCb (widget=<optimized out>, event=0x5198c8, data=<optimized out>)
    at /Users/baaskab/workspace/neo/src/KFXReader/src/ui/GtkUI.h:182
#11 0x756d9ad8 in ?? () from target:/usr/lib/libgtk-x11-2.0.so.0
Backtrace stopped: previous frame identical to this frame (corrupt stack?)
```



- [x] Fragomen
- [x] Forte
- [x] Juno sync automation
- [x] record video of eink?
- [x] Check with Hou In
- [x] Sideload Sample app myself
- [x] Callback implementation for Chrome
- [x] What does kui::Context::update() do?
- [ ] button press vs key press
- [ ] lipc vs http requests
- [x] why is lipc involved with chrome tap?
- [x] there are different ways to bring chrome tap?

region detection and send event up to kfxreader - lipc and bring up chrome

keep tap gestures within kfxreader before giving it to KUI

GdkKUIView.cpp:242

[https://issues.labcollab.net/browse/NEO-1661](https://issues.labcollab.net/browse/NEO-1661) - tap regions PM input


~~const auto?~~

~~global var for chrome %~~

~~std::move for weak_ptr~~

~~weak_ptr locking approach~~

~~Tap region design?~~

~~destructors~~?

Chrome gesture done

Automation is done
