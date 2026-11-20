# JoyCon

The website for **JoyCon**, a two-day festival of joy and human connection in San Francisco, January 16 to 17, 2027.

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

## Run it

```bash
npm start
```

Then open http://localhost:3000. (Requires Node 18+.)

## Where things live

```
public/
  index.html, weekend.html, joy.html, ...   one file per page
  data/        ← edit content here (dates, rides, schedule, quotes, people)
    site.js       site settings, CTA link, venue, rides
    schedule.js   the weekend schedule
    proof.js      "Proof of Joy" quotes and photos
    people.js     the makers
    joy.js        the "Find your joy" quiz
  assets/
    site.css      all styles
    site.js       shared header, footer, and page rendering
    home.js, joy.js, community.js   page-specific behavior
    img/          icons and illustrations
  island/       the interactive island map (prebuilt bundle, embedded via iframe)
server.js       tiny local server with clean URLs (/joy → joy.html)
```

Most edits are just changing text in `public/data/*.js`, saving, and refreshing.

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html` |
| `/weekend` | `weekend.html` |
| `/joy` | `joy.html` |
| `/why` | `why.html` |
| `/community` | `community.html` |
| `/makers` | `makers.html` |
| `/pack` | `pack.html` |
| `/faq` | `faq.html` |
| `/contact` | `contact.html` |

## Deploy

Any static host works. Point it at the `public/` folder.

- **Netlify:** connect the repo; `netlify.toml` already sets `publish = "public"`.
- **Vercel / GitHub Pages / Cloudflare Pages:** set the output directory to `public`.

## Notes

- `public/island/` is a compiled React build with no source in this repo. It's served as-is; one link inside it was changed to point at `/weekend` on this site instead of the original domain.
