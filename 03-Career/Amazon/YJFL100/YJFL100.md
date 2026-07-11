---

---
## Doubts

- [ ] P0 requirements - what all?
    - [x] DPS - done
    - [x] Orientation lock - already available
    - [ ] Text search and selection
    - [ ] Hyperlink
    - [ ] Highlighting
    - [ ] Dictionary lookup
- [x] Further reqs
    - [ ] Animation
    - [ ] Audio/Video
- [x] Text content as alt_text since we don't have text support? - not used
- [x] Epub3FL
    - [ ] No popup
    - [ ] Has text
    - [ ] Epub3 metadata only: rendition:layout=pre-paginated, contain viewport at the html level
- [x] Kindle FL
    - [ ] no popups
    - [ ] has text
    - [ ] Amazon specific metadata: fixed-layout=true, original-resolution, regionMagnification, book-type
- [x] YJFF structure is used instead of YJ with manga metadata
    - [ ] Are pending issues fixed?
- [x] Sample generation done?
- [x] Rasterization done in EpubAdapter flow
- [x] Section layout in portrait & landscape 
    - [ ] scale fit everywhere now?
    - [ ] Scrolling direction horizontal everywhere?
- [x] [https://quip-amazon.com/HaxqAEVCK4Fa/Current-vs-Future-Epub3FL-Vertical-Scroll](https://quip-amazon.com/HaxqAEVCK4Fa/Current-vs-Future-Epub3FL-Vertical-Scroll)
    - [x] is the left preview mobi?
- [x] AL2 migration done right?
- [x] Couldn't understand pipeline changes
    - [ ] [https://code.amazon.com/reviews/CR-39017669](https://code.amazon.com/reviews/CR-39017669)
- [ ] Publisher panel vs virtual panel vs guided view
- [x] Comics and manga are converted to YJ?
- [x] Kids vs Children book
    - [ ] What kind of books qualify for Kids+?
- [ ] T-shirt size estimate

- [x] Why is sample generation different for LR and FL
For LR, 10% of the mobi book is generated. The end position of the mobi sample is mapped to corresponding YJ position. YJ Sample book is created up to that position.
For FL, mobi sample is created. Mobi sample is decompiled to epub. This epub which does not have proper metadata is converted to YJ to generate the YJ sample.
TECH DEBT, need to move this same as LR
Already detailed here - [https://quip-amazon.com/YrqGAcmTFWEI/EPUB3-FL-Sample-generation](https://quip-amazon.com/YrqGAcmTFWEI/EPUB3-FL-Sample-generation)
- [ ] Why position map is skipped for FL samples
- [ ] How does position map and location map work?
- [ ] How does Page Number fit into all these?
- [ ] How do we process PDF inputs in KDP?

## Pages

[[Understanding YJ structure]]

[[Text extraction]]

[[Position map]]

# Resources

[https://quip-amazon.com/EpefOEz4tjWz/YJ-FL100](https://quip-amazon.com/EpefOEz4tjWz/YJ-FL100)

[https://quip-amazon.com/MTStO6lVD1QW/EPUB3-FL](https://quip-amazon.com/MTStO6lVD1QW/EPUB3-FL)


**FL100 Kickoff meeting - 8/4**

- What is the cost of going to native and then falling back to PDF route?
- Testing is manual. So we are picking only 10% ASINs for manual quality control. ~30k ASINs
- Sayantan doing text selection. talk to him
- DoD - definition of done


**Weekly review meeting - 8/12**

- Set goal for each week
- Talk to Muthu about text extraction in Chromium


Things to ask John W.

- [ ] Learning is hindered because of no sprint. Not great knowledge on what others are working