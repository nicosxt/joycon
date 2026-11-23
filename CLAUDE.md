# JoyCon site: house rules

Static site in `public/` (plain HTML/CSS/JS, no build). Run locally with `npm start` → http://localhost:3000. `main` auto-deploys to Vercel (https://joycon-plum.vercel.app); push only when asked.

## Image style (use for EVERY generated image asset)

All illustrated assets (the island, rides, people, props, flags, bubbles, icons, doors, footer) share one look: **Moebius ligne claire**, inked and flat. Prepend this style block to every image prompt, then describe the object, and pass a current island screenshot as the style reference (`public/island/images/island.webp` works):

> STYLE: Jean Giraud / Moebius clean ligne claire, thin confident dark ink contours (ink color about #391420), flat vibrant color fills, fine stipple dot shading, warm pastel palette (peach, sage, coral, gold, sky blue, lilac), matte, no painterly rendering, no glow, no gradients.
> VIEW: very clean isometric projection where it is a building or prop, structurally accurate, anatomically accurate figures.
> OUTPUT: single isolated object on a flat pure magenta (#FF00FF) background (or green #00FF00 for pink objects), no text unless needed, no ground, no shadows. Key the background out afterwards.

Outline weight: the island's line weight is the standard (about 1.5 board px at 1600 px board width). Every other asset gets its outline sized for how big it is on screen, so lines look the same weight everywhere; tiny figures are capped a little lighter.

How to generate:
- Krea `google/nano-banana-pro` (accepts people and image references; no 2:1 or 1:2 ratio, use 21:9 or 9:16) or Higgsfield `gpt_image_2_6` (rejects some inputs with a false "nsfw" flag, e.g. the footer frame).
- When repainting an existing asset, pass the current image plus the style reference and say "same shape, layout, proportions, camera angle and composition".
- After generating, key out the background, fit into the original image's bounding box (bottom-centre anchored) so positions in the island bundle don't shift, then re-encode to webp at the real display size (about 2.2 to 3 times the on-screen size).
- Island assets live in `public/island/images/`; bump the `ie="?v=N"` cache key in `public/island/assets/index-*.js` after replacing them, and the `?v=` on `coaster.js` images.

Photos (Proof of Joy polaroids) are the exception: realistic candid instant-film photos, not drawings.

## Page surface

- The whole site sits on handmade paper: `assets/img/paper-bg.jpg` (tiled background) plus `assets/img/paper-grain.jpg` as a multiply overlay over everything, so the grain shows through graphics and text. Sections stay transparent; don't give them flat background colors.
- The letter uses the deckled sheet `assets/img/letter-paper.webp`.

## Layout rule: no cut-offs

Never crop graphics at a section edge. Sections use `overflow: visible`; art that runs past a section should spill over into the next one. Only the page itself blocks sideways scroll (`overflow-x: clip` on html/body). The island scales to fit (never cover), so the whole island always shows.

## Type and color

- Fonts: Agrave Pro for everything; PP Stylo only for the "JoyCon" wordmark; Arial for the Save a Seat ticket; Caveat for handwriting (letter, notes).
- Palette tokens are the `--c-*` variables at the top of `assets/site.css` (Carissma pink, Orange Peel, Cinnabar, Lochmara blue, Chateau Green, Dutch White).
