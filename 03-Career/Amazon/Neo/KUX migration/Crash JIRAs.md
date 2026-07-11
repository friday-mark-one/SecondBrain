---

---
NEO-9115

JSIXTEEN-2083


Stack trace 

```shell
Backtrace from PC
#0 0xb50fc504 FPDFEMB_GetContentMargin +144164
#1 0xb50ee558 FPDFEMB_GetContentMargin +86904
#2 0xb50ee584 FPDFEMB_GetContentMargin +86948
#3 0xb50ef918 FPDFEMB_GetContentMargin +91960
#4 0xb511afd4 FPDFEMB_GetContentMargin +269812
#5 0xb50d7030 FPDFEMB_ContinueRender +204
#6 0xb50d9108 FPDFEMB_StartRender +640
#7 0xb6d40d05 _ZN9KindlePDF13RenderedImage7render_ENS_17RenderablePagePtrEiiiiPKNS_9RectangleEb +207
#8 0xb6d4131b _ZN9KindlePDF13RenderedImage6renderENS_17RenderablePagePtrERKNS_9RectangleES4_b +49
#9 0xb6cece75 _ZN2yj13KindlePDFPage11renderImageERKNS_7PDFPage17RenderImageParamsE +391
#10 0x00299205 _ZN2yj19YJPDFImageGenerator11onGetPixelsERK11SkImageInfoPvjRKN16SkImageGenerator7OptionsE +227
#11 0xb68da951 _ZN16SkImageGenerator9getPixelsERK11SkImageInfoPvj +9
```

```shell
Backtrace from LR
#0 0xb50fc500 FPDFEMB_GetContentMargin +144160
#1 0xb50ee558 FPDFEMB_GetContentMargin +86904
#2 0xb50ee584 FPDFEMB_GetContentMargin +86948
#3 0xb50ef918 FPDFEMB_GetContentMargin +91960
#4 0xb511afd4 FPDFEMB_GetContentMargin +269812
#5 0xb50d7030 FPDFEMB_ContinueRender +204
#6 0xb50d9108 FPDFEMB_StartRender +640
#7 0xb6d40d05 _ZN9KindlePDF13RenderedImage7render_ENS_17RenderablePagePtrEiiiiPKNS_9RectangleEb +207
#8 0xb6d4131b _ZN9KindlePDF13RenderedImage6renderENS_17RenderablePagePtrERKNS_9RectangleES4_b +49
#9 0xb6cece75 _ZN2yj13KindlePDFPage11renderImageERKNS_7PDFPage17RenderImageParamsE +391
#10 0x00299205 _ZN2yj19YJPDFImageGenerator11onGetPixelsERK11SkImageInfoPvjRKN16SkImageGenerator7OptionsE +227
#11 0xb68da951 _ZN16SkImageGenerator9getPixelsERK11SkImageInfoPvj +95
```

Regex everything except 

```shell
^(?!.*kfxreader.*).+$\n
```

