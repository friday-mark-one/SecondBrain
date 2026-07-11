---

---
Story - [https://issues.labcollab.net/browse/YJR-25086](https://issues.labcollab.net/browse/YJR-25086)

These are some test ASIN's for which I created YJFF last year in gamma pipeline.


- B08MTJPY63
- B08NCTKZ9L
- B08NCWNTRT
- B08NFDHCJP

### Code pointers

- [https://code.amazon.com/packages/CPSYJOPArtifacts/blobs/mainline/--/configuration/legos-artifacts/EP/YJOPCONVERSION.YJOPv2GenerateSamplePdfAndUpdateYJ.ion](https://code.amazon.com/packages/CPSYJOPArtifacts/blobs/mainline/--/configuration/legos-artifacts/EP/YJOPCONVERSION.YJOPv2GenerateSamplePdfAndUpdateYJ.ion)
- [https://code.amazon.com/packages/PARKER_YjopConversionEngine/blobs/mainline/--/yjop_conversion_engine/TextExtractionTask.cpp](https://code.amazon.com/packages/PARKER_YjopConversionEngine/blobs/mainline/--/yjop_conversion_engine/TextExtractionTask.cpp)
- [https://code.amazon.com/packages/YJFixedFormatUtils/blobs/91b4e55dcf2c6ecbaf9f6d8171280d5f8bbde481/--/yjopUtils/YJOPConversionUtils.cpp#L788](https://code.amazon.com/packages/YJFixedFormatUtils/blobs/91b4e55dcf2c6ecbaf9f6d8171280d5f8bbde481/--/yjopUtils/YJOPConversionUtils.cpp#L788)
- VS: [https://code.amazon.com/version-sets/parker-yjop/kitc-server-cpp11-mainline-AL](https://code.amazon.com/version-sets/parker-yjop/kitc-server-cpp11-mainline-AL)
- YJAugmenter
    - IT: [https://code.amazon.com/packages/P2RConv_YJStorageFormatConvertors/trees/mainline](https://code.amazon.com/packages/P2RConv_YJStorageFormatConvertors/trees/mainline)
    - Apollo: [https://apollo.amazon.com/environments/YJUpdater/stages/Prod](https://apollo.amazon.com/environments/YJUpdater/stages/Prod)
    - IP: [https://code.amazon.com/packages/CPSYJOPArtifacts/blobs/mainline/--/configuration/legos-artifacts/IP/PARKER.AugmentYJWithInferredData.ion](https://code.amazon.com/packages/CPSYJOPArtifacts/blobs/mainline/--/configuration/legos-artifacts/IP/PARKER.AugmentYJWithInferredData.ion)

### Comparison - Chromium vs YJOP

ASIN: B00JEFETA4

IMG: 762 x 768

PDF:  57096 x 57600

> [!note]+ page6.xhtml
> Text: I see raindrops falling down.
> 
> Chromium: top: 664, left: 44
> 
> YJOP: top:50184, left:3327

> [!note]+ page7.xhtml
> Text: I see raincoats blue and brown.
> 
> Chromium: top: 663, left: 126
> 
> YJOP: top:50122, left:9471

> [!note]+ handcrafted.html (with wrong viewport)
> Text: I see raindrops falling down.
> 
> Chromium: top: 664, left: 44
> 
> YJOP: top:50095, left:3369
> 
> YJOP: w:59496, h:84192

- [x] Check Aspect Ratio parity with other handcrafted html files
    - [x] Viewport seems to be different. Extra whitespace around the image
- [x] Find a way to convert chromium dimensions to YJOP dimensions(?)
    - [x] Bug in Puppeteer that produces different dimension when producing a PDF (assuming a DPI of 96) - [https://github.com/puppeteer/puppeteer/issues/3357#issuecomment-581332452](https://github.com/puppeteer/puppeteer/issues/3357#issuecomment-581332452)
    - [x] Understand what DPI is and the formula for converting between pixels and inches
- [x] Update PDF's viewport to be the same size as the ePub and update whatever coordinates chromium is providing at 7200 DPI
- [x] [Ask Muthu] Will the content of the book have different dimensions than what is specified in original resolution of the OPF file? - all html must have the same dimension as specified in the OPF file or each html must specify the same dimension.
- [x] Check correctness with YJPreviewer
    - [x] YJPreviewer not opening YJ properly sometimes 
    - [x] Build YJPreviewer locally
    - [x] Text selection does not work properly in the converted text YJ - something wrong with position map? - Yes. Use KFXPreprocessor app to generate position map
    - [x] Debug invisible overlay on YJPreviewer
    - [x] Manually hardcode top left coordinates in YJ and check preview in KPR and YJPreviewer
    - [x] Use the handcrafted html and mess with the resulting YJ
- [x] Content in different lines to separate content_list how?? - DOMSnapshot
    - [x] Create multiline content in handcrafted html and check behavior
- [x] How to process text with transforms?
    - [x] How does it behave currently in YJOP? Check in YJPreviewer - WORKING
- [ ] Check YJEpubAdapter code for native processing of text
- [ ] Chromium assumes 96 DPI by default - [https://github.com/puppeteer/puppeteer/issues/3357#issuecomment-581332452](https://github.com/puppeteer/puppeteer/issues/3357#issuecomment-581332452)
    - [ ] Check if there is a way to pass DPI as parameter
- [ ] DOMSnapshot - [https://chromedevtools.github.io/devtools-protocol/tot/DOMSnapshot/](https://chromedevtools.github.io/devtools-protocol/tot/DOMSnapshot/)
    - [x] API is experimental. Is that a problem?
    - [x] How to deal with multiple DOMTree?
    - [x] Document's content width and height is doubled (1524 x 1536 instead of 762 x 768) 
        - [x] Works fine on cloud desktop, observed problem with my 16" macOS
            - [x] solved with —force-device-scale-factor
        - [x] [https://bugs.chromium.org/p/chromium/issues/detail?id=1243805](https://bugs.chromium.org/p/chromium/issues/detail?id=1243805)
        - [x] Text reflow is different across platforms - Default font is different across platforms. Same font produced same rendering and reflow
    - [x] Landscape mode for orientation locked books
    - [ ] Transforms for text
        - [ ] Looks weird in YJ. Whats the experience in MOBI?
    - [ ] Deal with multibyte characters
- [x] Understand YJOP text stamping flow
- [ ] Port YJOP code to YJEpubAdapter
    - [ ] Extract text every N pages - why?
    - [x] Map sectionID - html - text rects - **2 days**
        - [x] Use HTML name to map it to section
        - [x] Directly use storyline or container to map text rects
    - [x] lazyLoad container and storyline - set to true by default - what is the significance?
    - [x] what is PageDataEnhancer
    - [ ] createTextContainerForEachWord in rotated pages - why?
    - [ ] Data structure for content and rect info from rasterizer
        - [ ] Once without span tag to get overall width and height
        - [ ] With span tag to get width and height for each word
    - [ ] segment line for CJK content - 3 days
        - [ ] Only CN YJOP books have word segmentation 
        - [ ] Should also support JPV books?
        - [ ] [https://w.amazon.com/bin/view/P2R/Word_Segmentation_Conversion/](https://w.amazon.com/bin/view/P2R/Word_Segmentation_Conversion/)
        - [ ] [https://code.amazon.com/packages/CPSYJNewRevisionWorkflowPlans/blobs/mainline/--/configuration/legos-artifacts/EP/YJConversion.DBYJUpdater.ion](https://code.amazon.com/packages/CPSYJNewRevisionWorkflowPlans/blobs/mainline/--/configuration/legos-artifacts/EP/YJConversion.DBYJUpdater.ion)
            - [ ] [https://code.amazon.com/packages/YJConversionToolsInvocationPlans/blobs/mainline/--/configuration/legos-artifacts/IP/ReflowableYJConversionTools.YJWordSegmenter.ion](https://code.amazon.com/packages/YJConversionToolsInvocationPlans/blobs/mainline/--/configuration/legos-artifacts/IP/ReflowableYJConversionTools.YJWordSegmenter.ion)
                - [ ] [https://code.amazon.com/packages/ConversionAPIWrappers/blobs/mainline/--/src/com/amazon/conversion/api/yj/YJWordSegmenter.java](https://code.amazon.com/packages/ConversionAPIWrappers/blobs/mainline/--/src/com/amazon/conversion/api/yj/YJWordSegmenter.java)
                    - [ ] [https://code.amazon.com/packages/EpubToYJConversionWrapper/blobs/mainline/--/src/com/amazon/convert/wrapper/SegmenterTask.java](https://code.amazon.com/packages/EpubToYJConversionWrapper/blobs/mainline/--/src/com/amazon/convert/wrapper/SegmenterTask.java)
                        - [ ] [https://code.amazon.com/packages/YJWordSegmenter/trees/mainline](https://code.amazon.com/packages/YJWordSegmenter/trees/mainline)
    - [x] Missing property enums - **1 day**
    - [x] Width for each word - **3 days**
        - [x] how to split words? - **1 day**
        - [x] [https://bugs.chromium.org/p/chromium/issues/detail?id=1250836](https://bugs.chromium.org/p/chromium/issues/detail?id=1250836)
        - [x] calculate spacing between words as part of style_events - **1 day**
    - [ ] Auxiliary data - TEXT_CONTAINER_BASELINE - **1 day**
    - [x] Each word as a separate text container? Perf issue?
    - [x] Make text content visible for debugging
    - [x] Double Page spread
    - [ ] Image containers also become selectable after enabling selection in YJ
        - [ ] Should we enable selection or just highlight for search result?
    - [ ] White gap between double spread pages
    - [x] workUnit maps to several resources - am I mapping the correct container to output text
    - [x] Stamp selection enabled kindle_ebook_metadata
        - [ ] Selection, Multi-page selection, graphical highlights


```javascript
				,
		    {
		      key:"selection",
		      value:"enabled",
		      mkfx_id:'804fd4e7-5e29-49ff-8931-b11bfcaf0efb'
		    }
```

### Test data

- [x] Pages with multiple lines
- [ ] Book with DPS
    - [ ] How does page spread work if condition is not specified in section?
    - [x] Find a YJOP with DPS (need to understand the YJ structure)
- [x] CJK 
- [ ] Rotated PDF page

## Notes

- To get mouse pointer coordinates
```javascript
document.onmousemove = function(e) {
	var x = e.pageX;
	var y = e.pageY;
	e.target.title = "X is "+x+" and Y is "+y;
};
```

### Doubts

- ~~KC supports PDF to YJ conversion, YJ structure seems somehow different from a book converted in YJOP_v2 workflow. Also, the KPF from KC does not have selectable content in KPR.~~
- ~~Explore how KC invokes PDF conversion~~
- ~~Compare KC created YJOP and workflow augmented YJOP~~


[~~AbstractAdapter.java~~](http://abstractadapter.java/)~~ - createFixedRegions() - calls rasterizer~~

direction, limitation, discrepancies - deepak, travis, sayantan, parthiban, nithya


- Does your change affect any style/semantics in the YJ. *(Yes/No)*
1. No
* Does your change introduce/requires any new SDL/SDK change. *(Yes/No)*
* If so please provide detailed information on the packages changed.
1. Yes. New metadata yj_has_text_popups for Text Popup books

[https://code.amazon.com/packages/KFXSDL/commits/d184b0b03f8653df060ea24902e8932e39407c84#](https://code.amazon.com/packages/KFXSDL/commits/d184b0b03f8653df060ea24902e8932e39407c84#)

* Does your change involves changes in YJDecompiler Package. *(Yes/No)*
No
 
* Does your change involves introducing new content-capability. i.e: YJ_REFLOWABLE_V2. *(Yes/No)*
Yes. Yet to come up with the capability name.
 
* Does your change involves in workflow changes *(Yes/No)*. If no please skip this section
* Are you introducing a new IP (or)
* Are you making changes in the existing workflow (introducing flag or some-other changes)  - yes will me making changes in the workflow to recognize the content and fall back logic.
 
* Does your change involves in any-other conversion steps/other’s not mentioned above. *(Yes/No)*
There will be renderer changes to read the new metadata for text pop ups books.

### Doubts to Anai

- [x] Page rotation value
- [x] Word segmentation for CJK
- [x] Prefix and hyphenation - for both latin and non-latin
- [x] PitStop EPs in YJOP workflow - for PDF optimization w.r.t. performance
- [x] Mixed language books - fixed layout + reflowable - shunted but some code in mainline
- [x] Where are we stamping word boundary in YJOP
- [x] Baseline bounds - link extraction


