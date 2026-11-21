# JoyCon site: house rules

Static site in `public/` (plain HTML/CSS/JS, no build). Run locally with `npm start` → http://localhost:3000. `main` auto-deploys to Vercel (https://joycon-plum.vercel.app); push only when asked.

## Image style (use for EVERY generated image asset)

All illustrated assets (the island, rides, people, props, flags, bubbles, icons) share one look. Prepend this style block to every image prompt, then describe the object:

> STYLE: whimsical early-1990s animated-film concept painting, gouache and oil on board, visible confident brushstrokes, soft painted edges with no ink outlines, rich saturated color with warm glowing highlights and cool bounce light in the shadows, toy-like chunky forms, playful storybook charm, painted by a film visual-development artist.
> VIEW: very clean orthographic isometric projection, true 30-degree isometric, no perspective distortion, parallel edges stay parallel, structurally accurate, anatomically accurate figures with correct proportions.
> LIGHT: warm late-afternoon light from the upper left, shadows falling to the lower right.
> OUTPUT: single isolated object on a transparent background, no text (unless the asset needs a specific word), no extra ground beyond the object's own base.

How to generate:
- Use Krea `openai/gpt-image-2.6-flare` with `background: "transparent"`.
- When repainting an existing asset, pass the current image as `image_urls` and say "same shape, layout, proportions, camera angle and composition" so it still fits its spot.
- After generating, crop to the art and fit it into the original image's bounding box (bottom-centre anchored) so positions in the island bundle don't shift.
- Island assets live in `public/island/images/`; bump the `ie="?v=N"` cache key in `public/island/assets/index-*.js` after replacing them.

Photos (Proof of Joy polaroids) are the exception: realistic candid instant-film photos, not paintings.

## Page surface

- The whole site sits on handmade paper: `assets/img/paper-bg.jpg` (tiled background) plus `assets/img/paper-grain.jpg` as a multiply overlay over everything, so the grain shows through graphics and text. Sections stay transparent; don't give them flat background colors.
- The letter uses the deckled sheet `assets/img/letter-paper.webp`.

## Type and color

- Fonts: Agrave Pro for everything; PP Stylo only for the "JoyCon" wordmark; Arial for the Save a Seat ticket; Caveat for handwriting (letter, notes).
- Palette tokens are the `--c-*` variables at the top of `assets/site.css` (Carissma pink, Orange Peel, Cinnabar, Lochmara blue, Chateau Green, Dutch White).
