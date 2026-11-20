/* Proof of Joy. Photos and social posts for the home page collage.

   The six photos below are AI-generated stand-ins (Krea). Swap in real ones when you have them.

   PHOTOS: drop image files into assets/photos/ and point "image" at them.
   Leave image empty ("") to show an illustrated placeholder print.
   Optional: "srcset" for responsive sizes, e.g. "assets/photos/safari-1-600.webp 600w, assets/photos/safari-1-1200.webp 1200w"
   Every photo needs real, descriptive alt text.

   POSTS: rendered as on-brand postcards. Fill name, handle, text, date, url.
   avatar is optional (an image path). If a post can't be recreated as text,
   leave text empty and set screenshot + screenshotWidth to show the original crisply.
   sample: true shows a small "sample" badge. Delete it when the post is real.

   "order" in JOY.proofOrder decides how photos and posts interleave. */

window.JOY = window.JOY || {};

JOY.gallery = [
  { id: "p1", image: "assets/photos/proof-1.webp", ride: "Joy Safari", date: "[Month Year]",
    caption: "No map. No phone. [one-line memory]",
    alt: "Five friends laughing as they walk down a steep San Francisco street lined with pastel Victorian houses." },
  { id: "p2", image: "assets/photos/proof-2.webp", ride: "Joy Safari", date: "[Month Year]",
    caption: "[one-line memory]",
    alt: "Two friends outside a neighborhood bakery, one holding a croissant up to the camera mid-laugh." },
  { id: "p3", image: "assets/photos/proof-3.webp", ride: "Stonefruit Omakase", date: "[Month Year]",
    caption: "[one-line memory]",
    alt: "Hands passing a single halved peach on a small ceramic plate across a candlelit dinner table." },
  { id: "p4", image: "assets/photos/proof-4.webp", ride: "Joy Safari", date: "[Month Year]",
    caption: "[one-line memory]",
    alt: "A small group doing a secret handshake in a foggy San Francisco park, everyone laughing." },
  { id: "p5", image: "assets/photos/proof-5.webp", ride: "Magic Glasses Dinner", date: "[Month Year]",
    caption: "[one-line memory]",
    alt: "Dinner guests in kaleidoscope novelty glasses toasting under string lights." },
  { id: "p6", image: "assets/photos/proof-6.webp", ride: "Joy Safari", date: "[Month Year]",
    caption: "[one-line memory]",
    alt: "Two guests holding a hand-drawn map, welcomed by kids in paper crowns at a backyard birthday party." }
];

JOY.posts = [
  { id: "s1", sample: true, name: "Your Name Here", handle: "@handle", avatar: "", date: "[Date]",
    url: "", screenshot: "", screenshotWidth: 0,
    text: "Left my phone at home for three hours and found a bakery I've walked past two hundred times. Still thinking about it.",
    pull: "Found a bakery I've walked past two hundred times." },
  { id: "s2", sample: true, name: "Your Name Here", handle: "@handle", avatar: "", date: "[Date]",
    url: "", screenshot: "", screenshotWidth: 0,
    text: "We asked a stranger for directions and ended up at her kid's birthday party. Best Saturday of the year.",
    pull: "Ended up at a stranger's kid's birthday party." },
  { id: "s3", sample: true, name: "Your Name Here", handle: "@handle", avatar: "", date: "[Date]",
    url: "", screenshot: "", screenshotWidth: 0,
    text: "I did not expect a single peach to make me cry. And yet.",
    pull: "I did not expect a single peach to make me cry." },
  { id: "s4", sample: true, name: "Your Name Here", handle: "@handle", avatar: "", date: "[Date]",
    url: "", screenshot: "", screenshotWidth: 0,
    text: "No map, no phone, five strangers. By hour two we had a team name and a secret handshake.",
    pull: "By hour two we had a secret handshake." }
];

/* Collage order. "p" ids are photos, "s" ids are posts. */
JOY.proofOrder = ["p1", "s1", "p2", "p3", "s2", "p4", "s3", "p5", "s4", "p6"];
