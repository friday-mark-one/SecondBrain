---

---
### Plus button

- [x] Add + button
    - [x] Should + button be an image or text?
    - [x] Add it on scroll end only
    - [x] How to check if sidepanel is 50% scrolled?
    - [x] Check its position on wide mode
    - [x] Update Done button and the new dimension
- [x] OnTap
    - [x] Disable the button
    - [x] Hook it up to toolbar sticky note button
    - [x] Show toast
- [x] After content tap
    - [x] Button should disappear
    - [x] Rest of the workflow should work as it is
- [x] Revert first time tutorial
- [x] Rebase with Andy’s changes

- [x] Scroll half-way past the next page
    - [x] Down arrow won’t be visible
    - [x] If new strokes are directly added to the sidepanel, add button should be replaced with done button?

## Ghosting

### Image from/to transitions

- [ ] Transitioning to a page with image
    - [ ] Create stroke → change to a page with image covering the same area as the stroke
    - [ ] Similarly for canvas in reflowable
- [ ] Transitioning away from a page with image

### User canvas from/to transitions

- [ ] Create stroke → change to a page with text highlights (to have a gray background) covering the same area as the stroke
- [ ] User canvas create stroke / highlight → delete stroke using lasso select
- [ ] User canvas stroke create → erase → turn to a blank page
- [ ] Dark mode → canvas stroke → page turn to a blank page

### Number of page turns?

- [ ] Dark mode → page turn with just text 

### KPP components

Book has image, user canvas, text highlight

- [ ] Draw on sticky note → close
- [ ] Sidepanel open/close area
- [ ] Note Toolbar open → close
- [ ] Aa menu open → close
- [ ] Image viewer →  toolbar hide
- [ ] PFV open → close


- [x] API at Properties.hpp, View.hpp
- [x] RxManager preroll transition layers cache
- [x] RenderVisitor cache transition layers
- [x] Weblab
- [x] Small image threshold
- [x] postDraw decision to flash
- [x] Screen coordinates
- [x] Backward compatibility with other flows 
- [ ] image dimension
- [ ] duplicate events why?
- [ ] zxlayer image check