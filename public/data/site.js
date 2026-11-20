/* JoyCon site settings and small content lists.
   Edit anything in here. No build step. Save, refresh, done.
   Copy rule: no em dashes or en dashes. Use periods, commas, or "to". */

window.JOY = window.JOY || {};

JOY.site = {
  name: "JoyCon",
  promise: "For two days in January, San Francisco becomes a playground.",
  dates: "January 16 to 17, 2027",
  datesShort: "Jan 16 to 17, 2027",
  datesChip: "Jan 16 to 17",                       // shown on the seat button in the nav
  city: "San Francisco",

  // Primary call to action, shown in the nav and all over the site.
  cta: { label: "Save a Seat", url: "https://luma.com/joycon" },

  // Leave contactEmail empty to show "Write to us" (links to the contact page) instead.
  contactEmail: "mikeyexperiences@gmail.com",

  venue: {
    name: "The Melody",
    note: "a historic church in North Beach",
    address: "906 Broadway, San Francisco, CA",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=906+Broadway+San+Francisco+CA"
  },

  socials: [
    { label: "Instagram", url: "https://www.instagram.com/mikeyexperiences/" },  // [swap for a JoyCon account if there is one]
    { label: "X", url: "" }                                                       // [fill in]
  ],

  // Paste the Google Apps Script web app URL (ends in /exec) here. See README.md.
  apiUrl: ""
};

/* Types of joy. Used for schedule tags, the ride form dropdown, and filters.
   color is the tag background, from the brand palette. Keep it light enough for dark text. */
JOY.joyTypes = [
  { id: "wonder",     label: "Wonder",     color: "#93c6d7", blurb: "Seeing the ordinary like it's the first time." },
  { id: "play",       label: "Play",       color: "#f79c09", blurb: "Doing something for no reason except that it's fun." },
  { id: "awe",        label: "Awe",        color: "#f3c3c6", blurb: "Feeling small next to something big, in a good way." },
  { id: "belonging",  label: "Belonging",  color: "#e9809c", blurb: "Being known by name in a room full of people." },
  { id: "presence",   label: "Presence",   color: "#a8d2b0", blurb: "Right here. Right now. Nowhere else to be." },
  { id: "gratitude",  label: "Gratitude",  color: "#f0b197", blurb: "Noticing what you already have and saying it out loud." },
  { id: "mischief",   label: "Mischief",   color: "#f9ce88", blurb: "A little rule bending in the name of delight." },
  { id: "generosity", label: "Generosity", color: "#35a468", blurb: "Giving joy away and getting more back." }
];

/* "Rides we've prototyped" tickets on the home page.
   url: the recipe in the Cookbook for Connection. */
JOY.cookbookUrl = "https://cookbookforconnection.com/";
JOY.prototypedRides = [
  { name: "Stonefruit Omakase", joy: "presence", url: "https://cookbookforconnection.com/recipe/stone-fruit-speakeasy",
    line: "A chef's counter of peaches, plums, and pluots, one perfect bite at a time. Strangers start comparing notes by course three." },
  { name: "Joy Safari", joy: "wonder", url: "https://cookbookforconnection.com/",   // [swap for the recipe link once Joy Safari is in the cookbook]
   
    line: "No map. No phone. Three hours, a small crew, and a city that suddenly feels brand new." },
  { name: "Magic Glasses Dinner", joy: "awe", url: "https://cookbookforconnection.com/",   // [swap for the recipe link once it is in the cookbook]
   
    line: "Put on a pair of glasses that changes what you notice. Then look across the table." },
  { name: "Living Funeral", joy: "gratitude", url: "https://cookbookforconnection.com/recipe/living-funeral",
    line: "Hear your eulogy while you're still around to enjoy it. Shockingly joyful. Bring tissues anyway." }
];

/* Pack for the Park checklist. Ticks are saved only in each visitor's browser. */
JOY.pack = [
  { item: "Comfortable clothes and shoes", note: "You'll walk more than you think." },
  { item: "A water bottle", note: "" },
  { item: "A backpack", note: "Hands free for high fives." },
  { item: "Snacks to eat and to share", note: "Sharing is the point." },
  { item: "A way to pay that is NOT your phone", note: "Cash or a card. The phone stays home on Safari." },
  { item: "A Ziploc bag", note: "For treasures, receipts, and the occasional rain." },
  { item: "An adventure hat", note: "The sillier the better." },
  { item: "A notebook and pen", note: "" },
  { item: "An analog camera, if you have one", note: "" }
];

/* FAQ. Answers in [brackets] still need filling in. */
JOY.faq = [
  { q: "Who is this for?",
    a: "Anyone who wants more joy in their week and doesn't mind looking a little silly to find it. Founders, artists, parents, the professionally serious. If you're curious, you're in." },
  { q: "How do I get in?",
    a: "Hit the button at the top of any page. [Fill in: RSVP, application, or tickets? How many spots? Price?]" },
  { q: "Do I need to come both days?",
    a: "[Fill in.] The two days are designed as a pair. Saturday fills you up. Sunday you give it away. Come to both if you can." },
  { q: "Can I bring a +1?",
    a: "Only to the Saturday night concert. Bring a BFF. Bonus points if they don't know they're your BFF yet." },
  { q: "Is food included?",
    a: "Saturday morning there's tea, drinks, and light refreshments, but no breakfast, so eat before you come. Saturday dinner is in teams at spots we help reserve, and the meal is on you." },
  { q: "Is it accessible?",
    a: "[Fill in: step-free access at The Melody, restrooms, seating, quiet space, how Joy Safaris adapt for different mobility.] Tell us what you need through the contact form and we'll make it work." }
];

JOY.neighborhoods = [
  "Bayview", "Bernal Heights", "Castro", "Chinatown", "Civic Center", "Cole Valley", "Dogpatch",
  "Embarcadero", "Excelsior", "Financial District", "Fisherman's Wharf", "Glen Park",
  "Golden Gate Park", "Haight-Ashbury", "Hayes Valley", "Inner Richmond", "Inner Sunset",
  "Japantown", "Lower Haight", "Marina", "Mission", "Nob Hill", "Noe Valley", "North Beach",
  "Outer Richmond", "Outer Sunset", "Pacific Heights", "Potrero Hill", "Presidio", "Russian Hill",
  "SoMa", "Tenderloin", "Telegraph Hill", "Western Addition", "Roaming / all over"
];
