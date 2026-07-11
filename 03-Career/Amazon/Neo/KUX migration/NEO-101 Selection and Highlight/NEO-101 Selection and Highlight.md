---

---

**JIRA**: [https://issues.labcollab.net/browse/NEO-101](https://issues.labcollab.net/browse/NEO-101)


```shell
tar xvf kfxReader_artifactory.tar.gz

export LD_LIBRARY_PATH=/mnt/us/usr/lib:$LD_LIBRARY_PATH
export DISPLAY=:0.0
stop kfxreader

/mnt/us/usr/bin/kfxreader -d


gdbserver --multi :5045


bb dryrun -y -p KUI KFXRenderer KFXReader
```

### Gathering basic knowledge

- [https://w.amazon.com/bin/view/Eink/#Basics_of_E_Ink_Technology](https://w.amazon.com/bin/view/Eink/#Basics_of_E_Ink_Technology)
- [https://wiki.labcollab.net/confluence/display/EINK/Juno+Framework+Knowledge+Base](https://wiki.labcollab.net/confluence/display/EINK/Juno+Framework+Knowledge+Base)
- [https://quip-amazon.com/KHKTApSMdnaa/Low-level-Design-Supporting-graphical-positions-for-handwritten-sticky-notes-in-upsync-and-downsync-flow-for-YJOP-books](https://quip-amazon.com/KHKTApSMdnaa/Low-level-Design-Supporting-graphical-positions-for-handwritten-sticky-notes-in-upsync-and-downsync-flow-for-YJOP-books)
- [https://issues.labcollab.net/browse/NEO-100](https://issues.labcollab.net/browse/NEO-100) - this has some old conversation and code changes around YJRes, KindleNeoEinkSample
- **PM requirement**: Retain prod behavior but preference to make it work on KUX
    - [https://quip-amazon.com/xMAHAz5Qb1VC/YJOP-Reading-Experience-on-E-reader](https://quip-amazon.com/xMAHAz5Qb1VC/YJOP-Reading-Experience-on-E-reader)
- Historic details - [https://quip-amazon.com/qx9KAeqdtGKi/KUX-Migration-SelectionHighlight-CX](https://quip-amazon.com/qx9KAeqdtGKi/KUX-Migration-SelectionHighlight-CX)
- Text selection flow - [https://w.amazon.com/bin/view/KindleNonFictionEngagement/EReader/#HTextselection](https://w.amazon.com/bin/view/KindleNonFictionEngagement/EReader/#HTextselection)
- iOS
    - render side: [https://issues.labcollab.net/browse/YJR-21577](https://issues.labcollab.net/browse/YJR-21577)
    - ios side: [https://issues.labcollab.net/browse/LSN-3242](https://issues.labcollab.net/browse/LSN-3242)
    - [https://w.amazon.com/bin/view/Yellow_Jersey/Teams/FLEX/Projects/IOSYJOP/](https://w.amazon.com/bin/view/Yellow_Jersey/Teams/FLEX/Projects/IOSYJOP/)
- Multipage selection disabled for YJoP - [https://issues.labcollab.net/browse/YJR-23307](https://issues.labcollab.net/browse/YJR-23307)
    - Probably to maintain parity with MOP
- PHL disabled too to maintain parity with android - [https://issues.labcollab.net/browse/YJR-25387](https://issues.labcollab.net/browse/YJR-25387)

Background info from **Stanton**:

- E-reader uses underline instead of background color for selection
    - It does this to prevent ghosting
    - PM needs to decide to keep existing e-reader behavior or migrate to KUX behavior
- To get the right performance you need to draw in all black/white (no grayscale)
    - Probably this is why they do underline today
    - You could still do grayscale but with a checkerboard pattern (this is what we are doing for stroke rendering, you can zoom in on highlight to see)
    - You probably need to manually change the waveform during the selection. The faster waveforms are the ones that draw only black/white as mentioned above



![[Selection Tasks.base]]

### Rough workflow

1. Handle long-press gesture (possibly starting from GdkKUIView)
2. If touch is released,
    1. get word based on touch location
    2. Current word is underlined, sidemarkers are drawn for that line
    3. Highlight handles are drawn
    4. Toolbar is displayed
    5. Dictionary and other cards are displayed
    6. Touching on the word again closes all popups
    7. If selection is extended with handle, everything remains the same.
3. If touch and drag to multiple words,
    8. get starting location
    9. draw underline and sidemarkers
    10. when pan stops, convert selection to highlight
    11. bring undo popup
4. Touching anywhere outside selection, disables selection.
5. Bringing selection back to few words brings all popups
6. If touch and drag to corner of page, it should trigger page turn with selection spanning to end of sentence or next sentence.

### Corner cases

Unselect existing selection before starting a new one

~~Underline color for black bgcolor~~

### Contacts

Reach out to @cjonatha or @xzhe for drawing perf

### PM follow-ups

- disable GHL at a higher level so that performance is good
- Deferred layout - KPI with Jon
- CX around vertical margin lines when zoomed-in
- CAB menu during pan/zoom
- expected CX for CAB when pinch and zoom
- [https://amzn-wwc.slack.com/archives/C02KCL46CH5/p1645814530027509](https://amzn-wwc.slack.com/archives/C02KCL46CH5/p1645814530027509)
- contents can also be on margins - vertical lines

### Tech follow-ups

- Selection handles for GHL and getSelectionRectsAndActions
- Identify deferred layout code and time taken
- List all lipc events

### Doubts from QA

KPI comparison with YJLR Barolo

UT for stroke and structured annotations

Commits for all changes

Vertical ASINs

Metrics

Add intentional crash for crash symbolication


Note and Highlight disabled

Annotations need to sync back to KFXReader

Quick highlight doesn’t work

Tapping existing selection to make it editable

Delete highlight

GHL should be disabled


## Phase 2

- on-device conversion
    - Extract text for full book or on-demand
    - cache only for few pages or all pages



## Pending tasks revisited - Jan 2023

7. ~~Selection position for CAB placement - KFXReader/EInkReader~~
8. Highlight option missing in Aa menu - EInkReader
9. Highlights are not rendered on screen - KFXReader/KFXRenderer
10. ~~Support GHL - EInkReader~~
11. Add note icon - KFXReader
12. ~~Sticky note on tap with unified CX - KFXReader/EInkReader~~
13. ~~Navigation from annotation notebook~~
14. Bug fixes

15. KFXRenderer ↔ KFXReader
    1. **Adding highlight support**
    2. Enabling GHL?
16. KFXReader ↔ EInkReader
    3. **CAB positioning around selection/highlight**
    4. Note icon
    5. Make Sticky note work (w/ unified CX?)
    6. Navigating to annotations from Annotation Notebook
17. EInkReader / Misc
    7. **Add Highlight option in Aa menu**
    8. ~~Selection/Highlight sync across devices~~
    9. Weblab
    10. Metrics

### Metrics schemas

- [x] `highlight_actions`
- [x] `eink_annotation_actions_v2`
- [ ] `ereader_smart_cards_display_metrics`
- [ ] `eink_chrome_decanter`
- [ ] `ereader_contextual_back_action`
- [ ] `note_actions`
- [ ] `reader_search_actions`
- [ ] `eink_toolbar_actions`
- [ ] `ereader_dialog_display_metrics`
- [ ] `eink_annotation_notebook_v1`

Selection/Highlight

- [https://kindle-fast-metrics.aka.amazon.com/#/schemas/highlight_actions/0](https://kindle-fast-metrics.aka.amazon.com/#/schemas/highlight_actions/0)

Annotation

- [https://kindle-fast-metrics.aka.amazon.com/#/schemas/eink_annotation_actions_v2/1](https://kindle-fast-metrics.aka.amazon.com/#/schemas/eink_annotation_actions_v2/1)

Smart cards

- [https://kindle-fast-metrics.aka.amazon.com/#/schemas/ereader_smart_cards_display_metrics/1](https://kindle-fast-metrics.aka.amazon.com/#/schemas/ereader_smart_cards_display_metrics/1)

Note actions

- [https://kindle-fast-metrics.aka.amazon.com/#/schemas/note_actions/0](https://kindle-fast-metrics.aka.amazon.com/#/schemas/note_actions/0)

Search actions

- [https://kindle-fast-metrics.aka.amazon.com/#/schemas/reader_search_actions/0](https://kindle-fast-metrics.aka.amazon.com/#/schemas/reader_search_actions/0)

Annotation notebook

- [https://kindle-fast-metrics.aka.amazon.com/#/schemas/ereader_contextual_back_action/0](https://kindle-fast-metrics.aka.amazon.com/#/schemas/ereader_contextual_back_action/0)
- [https://kindle-fast-metrics.aka.amazon.com/#/schemas/eink_annotation_notebook_v1/0](https://kindle-fast-metrics.aka.amazon.com/#/schemas/eink_annotation_notebook_v1/0)

[[Waveform email from Draft]]


[`**setDrawModeAndSensitivity**`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?refs=setDrawModeAndSensitivity)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_utils.lua?r=0d6d1279#83](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_utils.lua?r=0d6d1279#83)

[`**liglSetDrawMode**`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?refs=liglSetDrawMode)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_utils.lua?r=0d6d1279#122](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_utils.lua?r=0d6d1279#122)

[`display_fastmode_rect`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?defs=display_fastmode_rect)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_ligl.lua?r=12abab76#551](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/files/awesome/lab126_ligl.lua?r=12abab76#551)

[`**lua_ligl_display_enable_fastmode_rect**`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?refs=lua_ligl_display_enable_fastmode_rect)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl_lua.c?r=a1138715#159](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl_lua.c?r=a1138715#159)

[`**ligl_display_enable_fastmode_rect**`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?refs=ligl_display_enable_fastmode_rect)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl.c?r=a1138715#300](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/igl.c?r=a1138715#300)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2.c?r=db46f75f#1878](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2.c?r=db46f75f#1878)

[`**ligl_display_eink_v2_enable_fastmode_rect**`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?refs=ligl_display_eink_v2_enable_fastmode_rect)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2.c?r=db46f75f#1305](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2.c?r=db46f75f#1305)

`**int**`` `[`**_update_fast_mode_flag_to_driver**`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?refs=_update_fast_mode_flag_to_driver)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2_collision_handler.c?r=3092753f#749](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2_collision_handler.c?r=3092753f#749)



[`**prv_display_eink_v2_repair_update**`](https://grok.ereader.amazon.dev/eink_dev_mainline/s?refs=prv_display_eink_v2_repair_update)

[https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2.c?r=db46f75f#1295](https://grok.ereader.amazon.dev/eink_dev_mainline/xref/repo/platform/lib/lab126IGL/lib/display/hal_eink_v2.c?r=db46f75f#1295)