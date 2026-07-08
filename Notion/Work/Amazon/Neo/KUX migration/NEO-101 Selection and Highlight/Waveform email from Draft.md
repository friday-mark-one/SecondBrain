---

---
Looked at ligl logs for PDF and found this

230407:113240 winmgr[4118]: P ligl:perf::prv_display_eink_v2_repair_update:: calling prv_display_eink_v2_send_ioctl timestamp=1680892360:950865

230407:113240 winmgr[4118]: P ligl:perf::Repair @ 1860x2480+0+0 pixcount=105 mode=0 prefbw=1, prefgray=2, wvf=257 flags=0 temp=4096

230407:113240 winmgr[4118]: P ligl:perf::fast_area @ 272x101+548+1295 pixcount=0 mode=0 prefbw=0, prefgray=0, wvf=0 flags=0 temp=0

230407:113240 winmgr[4118]: D ligl:dbug::einkx.fast_area.flags 0x23

230407:113240 winmgr[4118]: D ligl:dbug::isreagl 0

230407:113240 winmgr[4118]: D ligl:dbug::eink, fastmode_rect 154x92+462+1354 @ 2 fidelity

230407:113240 winmgr[4118]: D ligl:dbug::_update_fast_mode_flag_driver: 0x80000023

230407:113240 winmgr[4118]: D ligl:dbug::eink, set_fullflash_sensitivity @ -1

For YJOP, this value is always **0x00**.

[This line](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2.c?r=db46f75f#1329) must be executed for the flag to be set at 0x23. But I don’t see any callers for PDF or YJLR that set this flag.

**From: **"Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>**Date: **Friday, April 7, 2023 at 12:24 PM**To: **"Atchia, Yaaseen" <[yaaseena@amazon.com](mailto:yaaseena@amazon.com)>, "Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>, "Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>, "Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>, "Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>, "Xu, Alex" <[xzhe@amazon.com](mailto:xzhe@amazon.com)>**Cc: **"Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>, "Shin, Jacob" <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject: **RE: Waveform for Selection in YJOP

+Alex

Hey Hao and Alex,

Any chance you could help with locating the win mgr mapping?

Thanks,

Carson

**From:** Atchia, Yaaseen <[yaaseena@amazon.com](mailto:yaaseena@amazon.com)> **Sent:** Friday, April 7, 2023 7:22 AM**To:** Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)>; Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)>; Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)>; Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>**Cc:** Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Shin, Jacob <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject:** Re: Waveform for Selection in YJOP

Thanks for the info. I think we are on the right path here because if I use dark mode, its behaving like I want (as code below mentions).

So, we should toggle "UPDATE_FLAGS_MODE_FAST_FLAG". I tried finding the equivalent toggle in win mgr but had trouble following what it maps to there. [@Hu, Hao](mailto:haohu@lab126.com), can you (or someone from your team) point us to the win mgr mapping?

I *think* it might be this [drawModeFastest](https://code.amazon.com/packages/KindleEinkSDK/blobs/a981f56201338d7c60bbe7419f888397ae3cc767/--/configuration/include/eink/win_mgr_utils.h#L204). However, I see it not implemented [here](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/win_mgr_utils/lib/win_mgr_utils.c?r=222ded40#577). I also could not find any toggle in EinkReader so not fully sure where it’s happening on lr/sideloadPdf.

Thanks,

Yaaseen

**From: **"Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>**Date: **Thursday, April 6, 2023 at 6:05 PM**To: **"Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>, "Atchia, Yaaseen" <[yaaseena@amazon.com](mailto:yaaseena@amazon.com)>, "Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>, "Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>, "Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>**Cc: **"Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>, Jacob Shin <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject: **Re: Waveform for Selection in YJOP

Hi Yaaseen:

Here is the waveform replacement function in the display driver.

int auto_waveform_replacement(struct mxcfb_update_data *upd_data){        u32 xscrn, yscrn;        struct fb_private_info *fb_priv = hwtcon_fb_info();        if( upd_data->waveform_mode != WAVEFORM_MODE_DU                && upd_data->waveform_mode != WAVEFORM_MODE_GL16                && upd_data->waveform_mode !=WAVEFORM_MODE_GC16_PARTIAL)                return -1;  /*Olny replace DU and GL16, GC16_PARTIAL*/        if(hwtcon_core_use_night_mode())                return -1; /*day mode only*/        hwtcon_fb_get_resolution(&xscrn, &yscrn);        if ((!(fb_priv->update_flag_fast_mode & UPDATE_FLAGS_MODE_FAST_FLAG)) &&                (upd_data->update_region.width > xscrn / REAGL_WIDTH_FACTOR) &&                (upd_data->update_region.height > yscrn / REAGL_HEIGHT_FACTOR) ) {                u32 wf, mode;                wf = upd_data->waveform_mode;                mode = upd_data->update_mode;                upd_data->waveform_mode = WAVEFORM_MODE_GLR16;                upd_data->update_mode = UPDATE_MODE_FULL;                TCON_LOG("Replace waveform, update mode from [%d,%d] to [%d,%d]", wf, mode, upd_data->waveform_mode, upd_data->update_mode);                return 0;        }        return -1;}

The highlighted section is the criteria used by the driver to decide whether it should  replace the original waveform to GLR16 for ghosting reduction purpose. So if the update regions and the framebuffer content are the same, the only factor that can affect the outcome is the "UPDATE_FLAGS_MODE_FAST_FLAG" bit in the update request. As Frank just mentioned, you may want to check if the fast mode is enabled or not.

Thanks

Tingwei

---

**From:** Wei, Frank**Sent:** Thursday, April 6, 2023 5:38:14 PM**To:** Atchia, Yaaseen; Stelzer, Carson; Huang, Tingwei; Bhargav, Bharath; Hu, Hao**Cc:** Yu, Jack; Shin, Jacob**Subject:** RE: Waveform for Selection in YJOP

Yaaseen,

It looks like the waveform is overridden by another ALGO, which trying to utilize GLR16 to gain better image quality, to disable that, you need to

Enable_fastmode to bypass it, and disable_fastmode after finish the selection operation.

This is the API to call to enable/disable fast mode.

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl.c?r=a1138715#300](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl.c?r=a1138715#300)

Please find the corresponding upper API for your App to call.

Frank

**From:** Atchia, Yaaseen <[yaaseena@amazon.com](mailto:yaaseena@amazon.com)> **Sent:** Thursday, April 6, 2023 5:16 PM**To:** Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)>; Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)>; Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)>; Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>**Cc:** Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Shin, Jacob <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject:** Re: Waveform for Selection in YJOP

Thanks. It’s the same pdf page on both and around the same selection area. We can’t get the exact same layout right now so it’s not exactly similar there but should be close.

But isn’t this line what says the histogram status (and next waveform to use)?

[1680824092.738821]: EPDC [1417] current_hist_stat = 0x40000000[0] next_hist_stat = 0x1[0] <u>**new waveform = 0x1 (du)**</u>

In both cases, its showing the same stats and new waveform but one is going to du and not the other.

Yaaseen

**From: **"Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>**Date: **Thursday, April 6, 2023 at 5:06 PM**To: **"Atchia, Yaaseen" <[yaaseena@amazon.com](mailto:yaaseena@amazon.com)>, "Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>, "Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>, "Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>, "Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>**Cc: **"Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>, Jacob Shin <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject: **RE: Waveform for Selection in YJOP

Yaaseen,

AUTO waveform result depends on histogram, thus depends on the image content.

Maybe the “sideloaded pdocs” has more BW pages.

Thanks,

Frank

**From:** Atchia, Yaaseen <[yaaseena@amazon.com](mailto:yaaseena@amazon.com)> **Sent:** Thursday, April 6, 2023 4:49 PM**To:** Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)>; Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)>; Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)>; Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>**Cc:** Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Shin, Jacob <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject:** Re: Waveform for Selection in YJOP

Hey all,

We got the du working in normal auto mode (where it’s based on the histogram). Thanks.

It’s not always consistent though. On selections of several lines, it’s going to glr16. Log below (it even says next should be du but it’s not)

[1680824092.728686]: EPDC [1417] Requested waveforms: mode: 0x101 (auto) __ BW: 0x1 (du) __ Gray : 0x2 (gc16)

[1680824092.728722]: EPDC [1417] update start marker=1417, start time=1680824092725

[1680824092.738556]: EPDC [1417] waveform=0x101 (auto) mode=0x0 temp:4096 update region top=350, left=15, width=1830, height=876 flags=0x0 rotation=3

[1680824092.738821]: EPDC [1417] current_hist_stat = 0x40000000[0] next_hist_stat = 0x1[0] <u>**new waveform = 0x1 (du)**</u>

[1680824092.738895]: EPDC [1417] Sending update. <u>**waveform:4 (glr16 (reagl))**</u> mode:0x1 update region top=350, left=15, width=1830, height=876 temp index: 8 rotation=3

As a comparison, sideloaded pdocs is always du (whatever the selection height). Logs

[1680824159.778453]: EPDC [1464] Requested waveforms: mode: 0x101 (auto) __ BW: 0x1 (du) __ Gray : 0x2 (gc16)

[1680824159.778900]: EPDC [1464] update start marker=1464, start time=1680824159776

[1680824159.797179]: EPDC [1464] waveform=0x101 (auto) mode=0x0 temp:4096 update region top=0, left=0, width=1860, height=2480 flags=0x0 rotation=3

[1680824159.797287]: EPDC [1464] current_hist_stat = 0x40000000[0] next_hist_stat = 0x1[0] <u>**new waveform = 0x1 (du)**</u>

[1680824159.797320]: EPDC [1464<u>**] Sending update. waveform:1 (du)**</u> mode:0x0 update region top=0, left=0, width=1860, height=2480 temp index: 8 rotation=3

Any pointers there? The histogram stats look similar to me. If you wish to test, you can take latest mainline and `torch install --buildRequestId 6412171560` to compare yjop and sideloaded pdocs.

Thanks,

Yaaseen

**From: **"Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>**Date: **Thursday, April 6, 2023 at 8:17 AM**To: **"Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>, "Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>, "Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>, "Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>**Cc: **"Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>, Jacob Shin <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>, "Atchia, Yaaseen" <[yaaseena@amazon.com](mailto:yaaseena@amazon.com)>**Subject: **RE: Waveform for Selection in YJOP

+Yaaseen

**From:** Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)> **Sent:** Wednesday, April 5, 2023 2:53 PM**To:** Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)>; Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)>; Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>**Cc:** Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Shin, Jacob <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject:** RE: Waveform for Selection in YJOP

Bharath,

Looks like you called the correct API.

If you call the correct API, it will enter HIGHLIGHT mode, kernel driver won’t receive any AUTO waveform for selection, instead it receive:

1. DU when enter HIGHLIGHT mode
2. DU during HIGHLIGHT operation
3. GC16 when exit HIGHLIGHT mode

The waveform mode decision logic is done in Lab126IGL, AUTO waveform should NOT be passed to kernel  for this operation

If kernel driver receive AUTO waveform mode during selection operation, then something wrong, you need to check why it does not enter HIGHLIGHT mode.

Thanks,

Frank

**From:** Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)> **Sent:** Wednesday, April 5, 2023 2:43 PM**To:** Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)>; Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>; Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)>**Cc:** Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Shin, Jacob <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject:** RE: Waveform for Selection in YJOP

Hi Bharath & Hao:

Auto waveform selection is very straightforward. It’s based on the histogram results of current image and next image. Depending on the number of gray levels required, the driver picks the corresponding waveform from the preset auto waveform table.

Here is two examples from the log file you provided:

Example #1

[1680721241.263342]: EPDC [4198] Requested waveforms: mode: 0x101 (auto) __ BW: 0x1 (du) __ Gray : 0x2 (gc16)

[1680721241.263489]: EPDC [4198] update start marker=4198, start time=1680721241258

[1680721241.283336]: EPDC [4198] waveform=0x101 (auto) mode=0x0 temp:4096 update region top=0, left=0, width=1860, height=2480 flags=0x0 rotation=3

[1680721241.283443]: EPDC [4198] current_hist_stat = 0x40000000[0] next_hist_stat = 0x1[0] new waveform = 0x1 (du)

[1680721241.283482]: EPDC [4198] Sending update. waveform:1 (du) mode:0x0 update region top=0, left=0, width=1860, height=2480 temp index: 8 rotation=3

[1680721241.283511]: EPDC [4198] Sending update in LUT: 4

[1680721241.379064]: Button 1 up at 731,1681 in com.lab126.booklet.reader:application

[1680721241.473305]: EPDC [4198] update end marker=4198, end time=1680721241470, time taken=196 ms

Example #2

[1680721252.423463]: EPDC [4205] Requested waveforms: mode: 0x101 (auto) __ BW: 0x1 (du) __ Gray : 0x2 (gc16)

[1680721252.424113]: EPDC [4205] update start marker=4205, start time=1680721252415

[1680721252.434060]: EPDC [4205] waveform=0x101 (auto) mode=0x0 temp:4096 update region top=0, left=0, width=1860, height=2480 flags=0x0 rotation=3

[1680721252.443320]: EPDC [4205] current_hist_stat = 0x55555555[3] next_hist_stat = 0x55555555[3] new waveform = 0xa (gc16_partial)

[1680721252.443767]: EPDC [4205] Sending update. waveform:10 (gc16_partial) mode:0x0 update region top=0, left=0, width=1860, height=2480 temp index: 8 rotation=3

[1680721252.443895]: EPDC [4205] Sending update in LUT: 7

In the first example, the histogram shows there are only 2 gray levels (black and white)in both in the current and the next image. So the driver picks DU. In the second example, there are 16 gray levels in the current and the next image. So the driver selects GC16. This logic works the same for all updates. And the book format is totally transparent to the display driver.

Thanks

Tingwei

**From:** Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)> **Sent:** Wednesday, April 5, 2023 1:37 PM**To:** Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>; Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)>; Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)>**Cc:** Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Shin, Jacob <[wonhshin@amazon.com](mailto:wonhshin@amazon.com)>**Subject:** Re: Waveform for Selection in YJOP

+Jacob

Hi Frank,

I checked the code pointer you mentioned below - ligl_display_enable_fastmode_rect (config, x, y, w, h, fast_mode);

This is exactly what I referred below as **HIGHLIGHT DRAW MODE**. This draw mode maps to [ligl](https://grok.ereader.amazon.dev/eink_dev_mainline/s?defs=ligl).[FAST_MODE](https://grok.ereader.amazon.dev/eink_dev_mainline/s?defs=FAST_MODE).[HL](https://grok.ereader.amazon.dev/eink_dev_mainline/s?defs=HL) which invokes the above function.

Mapping of draw mode to LIGL here - [https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_ligl.lua?r=12abab76&fi=liglSetDrawMode#313](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_ligl.lua?r=12abab76&fi=liglSetDrawMode#313)

Though this improved selection performance, this is what caused both the issues in the first place. Attached perfMonitor log of YJOP with HIGHLIGHT DRAW MODE (epdc-highlightDrawMode-fixedFormat.log). Maybe it is missing the force monochrome step / not working as expected?

Also, I compared the log of sideloaded PDF and YJOP for the same page of the same book and found that sideloaded PDF behaves the same as YJLR – auto waveform gets mapped to DU. The performance is good and these 2 issues don’t occur there as well. So this reiterates Hao’s question – why ‘auto’ was not mapped to ‘DU’ for YJOP?

Thanks

Bharath

**From: **"Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>**Date: **Wednesday, April 5, 2023 at 12:44 PM**To: **"Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>, "Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>, "Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>**Cc: **"Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>, "Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>**Subject: **Re: Waveform for Selection in YJOP

Thanks [@Huang, Tingwei](mailto:htingwei@lab126.com) & [@Wei, Frank](mailto:chongguw@lab126.com)

From my point of view, the key question we want to answer is the behavior difference from YJLR v.s. YJOP.

For YJLR, the page is NOT B&W only as well (e.g. there could be image on the screen, all the text are actually NOT B&W only neither), but the “auto” was mapped to “DU” while YJOP, the “auto” was not mapped to “DU”.

So what’s the logic deciding when to map to “DU” and when not. Maybe you guys have a better idea?

**On a parallel topic:**

A little while ago, I also created a small test program to evaluate what’s the best choice for Lasso selection feature (e.g. drag the selection on screen). I also saw some behavior that I wasn’t able to understand. Maybe you guys have a better idea. Question is: Everything we draw on this program is pure B&W, but when X side do full screen damage (line 52 in the source code below) v.s. only damage sub-region of the screen (line 63 of the source code below), the behavior is different. (The difference of Mode0 v.s. Mode1 below).  Do you guys know why it’s different?

Binary file to run on device:

[http://kpp.aka.amazon.com/share/Hao/dragScreenUpdate_90560c68](http://kpp.aka.amazon.com/share/Hao/dragScreenUpdate_90560c68)

Source code here:

[https://code.amazon.com/packages/JunoPrototype/blobs/3a279c9208a272759f999d1a61f75317d7358760/--/src/dragScreenUpdate/dragScreenUpdate.c](https://code.amazon.com/packages/JunoPrototype/blobs/3a279c9208a272759f999d1a61f75317d7358760/--/src/dragScreenUpdate/dragScreenUpdate.c)

Some details I shared earlier with PM, I think you could directly run it without following the steps. But how may also be interested in the highlighted area:

[*@jjang*](https://amzn-wwc.slack.com/team/W017SJ70TDJ)* / *[*@cjonatha*](https://amzn-wwc.slack.com/team/W017Z2F6BR7)*, I created a POC to show we could draw in DU mode without need to trigger a screen flash, please help to try it out and then later we need to see whether we need to make any change to existing screen drawing logic or not.*

*How to try:**Sideload this binary file attached to your device's top folder.  Then at home screen, search for ";launcher", then you should see this program get listed there. Tap it to run.*

***Pinch in****:  Exit*

*drag the "target" on the screen to observe the screen update behavior****Pinch out****:  switch mode, will rotate all 3 modes.*

*There are 3 modes:*

***mode0:**** (default) exclusive DU screen update, slower but clean****mode1****: overlapping DU screen update, super fast but not super clean during movements****mode2****: mode1 + some extra software draw delay. Kind of offer something in between of mode 0 & 1*

Thanks!

Hao

**From: **"Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>**Date: **Wednesday, April 5, 2023 at 12:03 PM**To: **"Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>, "Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>**Cc: **Hao Hu <[haohu@lab126.com](mailto:haohu@lab126.com)>, "Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>, "Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>**Subject: **RE: Waveform for Selection in YJOP

Bharath，

I watch the videos and notice the operation is selection, or highlight.

We have highlight function implemented in other DOC format, please follow HIGHLIGHT examples in other format readers.

Here I give the waveforms used in HIGHLIGHT operation, hope it help you to understand the mechanism.

4. Before Selection/Highlight operation, text is displayed with high fidelity in 16 grey levels but slow waveform, eg, GC16, GLR16.
5. During Selection/Highlight operation, we want quick response, so we prefer to use FAST (low fidelity) waveform modes, like DU, A2.

But if DU is used right after GC16/GLR16, you will encounter the problems in the videos, because DU is for black and white only, while the text is displayed in 16 grey levels.

To fixed the problem, we need a transition when entering AND exiting Selection/Highlight mode, steps:

6. Enter_Selection_mode() Change the content on screen from 16 gray-level to black-and-white only (using FORCE_MONO_CHROME algorithm.) Repaint the screen with the black-and-white content in DU waveform mode, so that content on screen is BW only.
7. Selection_operation() Use DU to paint screen. (You won’t have the problem now, because on step a), screen display is BW only)
8. Exit_Selection_mode()

Use GC16 to repaint the original content, so that we get high fidelity display (instead of BW)

Luckily, you properly don’t need to take care of these detail steps, the logic is already done in Lab126IGL layer.

You need to call ligl_display_enable_fastmode_rect (config, x, y, w, h, fast_mode) with fast_mode = fast_hl.

Or even upper layer API like this [https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl_lua.c?r=a1138715#159](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl_lua.c?r=a1138715#159).

I am not familiar with more upper layer APIs, please check examples implemented in other format Readers.

//++++++++++++++++++++++++

/**

* @enum LIGLDisplayFastModes

*/

typedef enum {

fast_pz = 0,   /**< fast_pz : special mode for pan and zoom */

fast_kb,   /**< fast_kb : special mode for keyboard */

fast_hl,   /**< fast_hl : special mode for highlight */

fast_ani_burst /** fast_ani_burst : special mode for short bursts of animation. There is some residual ghosting */

} LIGLDisplayFastModes;

ligl_display_enable_fastmode_rect (config, x, y, w, h, fast_mode);

- ----------------//

Thanks,

Frank

**From:** Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)> **Sent:** Wednesday, April 5, 2023 10:14 AM**To:** Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)>**Cc:** Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>; Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)>**Subject:** RE: Waveform for Selection in YJOP

Hi Bharath:

To minimize ghosting, the display driver will use GLR16 waveform on an update if its original waveform is AUTO and it meets the ghosting reduction criteria. This is a feature inherited from previous E-reader project. But if the waveform specified in an update is not AUTO, the driver will not try to change it. So if you’d like to use a particular waveform on an update, you need to specify it in the update request instead of setting it to AUTO.

BTW, I think I have found the root cause of issue #2. It’s basically the same as that of first issue. The log shows the screen update is done with DU waveform after the selection handle is dragged. As I mentioned in the previous email, DU can display only white or black pixels. It won’t show any pixels of other gray level. Since most of the pixels in the framebuffer is not black or white in this case, they will not be changed after the update screen. Hence it looks like the screen is not refreshed at all.

Thanks

Tingwei

**From:** Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)> **Sent:** Wednesday, April 5, 2023 9:20 AM**To:** Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)>**Cc:** Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>; Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>; Wei, Frank <[chongguw@lab126.com](mailto:chongguw@lab126.com)>**Subject:** Re: Waveform for Selection in YJOP

Hi Tingwei,

As I’ve mentioned at the start of this thread, we see difference in waveforms sent when using normal mode between YJLR and YJOP.

*Comparing the logs of YJOP & YJLR, we noticed that auto waveform is translated to "glr16 (reagl)" in epdc-normalDrawMode-fixedFormat.log whereas in epdc-reflowable.log it is translated to sometimes "du" sometimes "gc16_partial" (logs attached).*

So the question now is, how do we get du waveform when using normal draw mode in YJOP similar to YJLR? Or is there a different waveform / drawMode that should be used to improve selection performance?

Thanks

Bharath

**From: **"Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>**Date: **Tuesday, April 4, 2023 at 5:18 PM**To: **"Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>**Cc: **"Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>, "Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>, "Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>, "Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>**Subject: **Re: Waveform for Selection in YJOP

Hi Bharath:

Thanks for the heads-up. I will stop the debugging for now.

Thanks

Tingwei

---

**From:** Bhargav, Bharath**Sent:** Tuesday, April 4, 2023 5:06:20 PM**To:** Huang, Tingwei**Cc:** Hu, Hao; Stelzer, Carson; Yu, Jack; Wei, Frank**Subject:** Re: Waveform for Selection in YJOP

Hi Tingwei,

Thanks for the quick update. We’re planning to remove highlight draw mode (du waveform) and just leave it at normal draw mode (auto waveform). Both the issues go away with normal mode. We are looking for ways to improve selection performance with a faster waveform (similar to YJLR) that doesn’t have any other side-effect.

Thanks

Bharath

**From: **"Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>**Date: **Tuesday, April 4, 2023 at 3:43 PM**To: **"Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>**Cc: **"Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>, "Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>, "Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>, "Wei, Frank" <[chongguw@lab126.com](mailto:chongguw@lab126.com)>**Subject: **Re: Waveform for Selection in YJOP

Hi Bharath:

Just a quick update...

I have duplicated both issues in my device.

For issue #1, the reason why the image on top disappears is because incorrect waveform is used to refresh the upper half of the screen when the smart card is dismissed. DU waveform can display only black and white pixels. It won't display pixels of all other gray levels. That's why it's usually not used to render images. You may need to replace it with other waveforms.

For issue #2, I am still trying to root cause it. Will keep you posted on the progress.

Thanks

Tingwei

---

**From:** Bhargav, Bharath**Sent:** Tuesday, April 4, 2023 1:01 PM**To:** Huang, Tingwei**Cc:** Hu, Hao; Stelzer, Carson; Yu, Jack**Subject:** Re: Waveform for Selection in YJOP

Hi Tingwei,

This feature is Barolo specific. You can download any mainline Barolo build from KBITS - [latest build #1657](https://kbits.build.lab126.a2z.com/?project=juno_sbr_barolo_bellatrix3&build_version=1657&build_variant=OFFICIAL&showfiles=true).

Mainline builds will have highlight draw mode enabled. So you should be able to reproduce the selection handle issue on any book with a gray background. Or you can just highlight the entire page to make it gray and then create a selection on top of it.

YJOP - [B09W2BT92N](https://www.amazon.com/gp/product/B09W2BT92N), [B09TDGNJLX](https://www.amazon.com/gp/product/B09TDGNJLX/)

YJLR - [B07D23CFGR](https://www.amazon.com/Atomic-Habits-Proven-Build-Break-ebook/dp/B07D23CFGR)

Thanks

Bharath

**From: **"Huang, Tingwei" <[htingwei@lab126.com](mailto:htingwei@lab126.com)>**Date: **Tuesday, April 4, 2023 at 12:18 PM**To: **"Bhargav, Bharath" <[baaskab@amazon.com](mailto:baaskab@amazon.com)>**Cc: **"Hu, Hao" <[haohu@lab126.com](mailto:haohu@lab126.com)>, "Stelzer, Carson" <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>, "Yu, Jack" <[jackyu@lab126.com](mailto:jackyu@lab126.com)>**Subject: **RE: Waveform for Selection in YJOP

Hi Bharath:

I will look into this issue ASAP. BTW, can you send me the link of the image running in your device?

Thanks

Tingwei

**From:** Bhargav, Bharath <[baaskab@amazon.com](mailto:baaskab@amazon.com)> **Sent:** Tuesday, April 4, 2023 10:31 AM**To:** Huang, Tingwei <[htingwei@lab126.com](mailto:htingwei@lab126.com)>**Cc:** Hu, Hao <[haohu@lab126.com](mailto:haohu@lab126.com)>; Stelzer, Carson <[cstelzer@amazon.com](mailto:cstelzer@amazon.com)>; Yu, Jack <[jackyu@lab126.com](mailto:jackyu@lab126.com)>**Subject:** Waveform for Selection in YJOP

Hi Tingwei,

I’m from YJ rendering team. We’re trying to add selection/annotation support for YJOP (PDF-based fixed format) on E-ink. To improve performance of selection, we use [HIGHLIGHT draw mode](https://code.amazon.com/packages/KFXReader/blobs/9256530d5c793a28c0f6651777a64477a1b5944f/--/deps/include/eink/ui/win_mgr_utils.h#L202) (which uses DU waveform) so that there is no lag when dragging the selection handle. We see 2 issues as a consequence of highlight draw mode.

1.       Screen is damaged in the place where CAB dialog and smart cards are shown - [video](https://drive.corp.amazon.com/documents/baaskab@/misc/NEO-15717/TextSelectionContentDamage.mp4) (Note that the image on top disappears when smart card is dismissed)

2.       Screen update does not happen after selection handle is dragged over gray background - [video](https://drive.corp.amazon.com/documents/baaskab@/misc/NEO-15717/SelectionHandleGrayBackground.mp4)

This issue cannot be seen on a screenshot of the page or when streaming the frame using ***screenControl.***

When looking at YJLR (reflowable format where selection is already supported), we noticed from EPDC logs that we don’t seem to use HIGHLIGHT draw mode. Instead, it looks like [NORMAL draw mode](https://code.amazon.com/packages/KFXReader/blobs/9256530d5c793a28c0f6651777a64477a1b5944f/--/deps/include/eink/ui/win_mgr_utils.h#L198) (auto waveform). When we use NORMAL draw mode for YJOP, the performance is very bad and the selection handle is a bit laggy ([video](https://drive.corp.amazon.com/documents/baaskab@/misc/NEO-15717/YJOP-normalDrawMode.mp4)).

Comparing the logs of YJOP & YJLR, we noticed that auto waveform is translated to "glr16 (reagl)" in epdc-normalDrawMode-fixedFormat.log whereas in epdc-reflowable.log it is translated to sometimes "du" sometimes "gc16_partial" (logs attached). Hao asked me to get framebuffer content and compare the images of YJOP for normal and highlight draw mode. I’ve uploaded them here – [highlightDraw](https://drive.corp.amazon.com/personal/baaskab/misc/NEO-15717/drawModeHighlight), [normalDraw](https://drive.corp.amazon.com/personal/baaskab/misc/NEO-15717/drawModeNormal) along with a video of what it looks like on screen ([Slack conversation](https://amzn-wwc.slack.com/archives/C0195L2FBTM/p1680213679435009)).

Wanted to get your feedback on this. Let me know if you need more information.

Thanks

Bharath