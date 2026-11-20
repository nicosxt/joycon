/* The Weekend. Each block becomes a ride ticket on the schedule page.
   time: shown on the ticket stub. spot: where the ride sits on the home page park map
   (gate, stage, chapel, bread, safari, foundry, dinners, city). joy: an id from JOY.joyTypes in data/site.js. */

window.JOY = window.JOY || {};

JOY.days = [
  {
    id: "saturday",
    tab: "Saturday",
    date: "Saturday, January 16",
    title: "Find the Joy Within",
    theme: "Reigniting the deep, childlike, powerful, playful, authentic joy inside ourselves. Saturday is more structured. Everyone rides together as one group, and each ride is built around a specific type of joy.",
    showJoyTypes: true,
    location: { name: "The Melody", note: "A historic church in North Beach. Daytime rides start here, then the concert moves to SF Foundry at 4.", address: "906 Broadway, San Francisco",
                mapUrl: "https://www.google.com/maps/search/?api=1&query=906+Broadway+San+Francisco+CA" },
    blocks: [
      { time: "8:45 AM", spot: "gate", title: "Doors open", joy: "belonging", where: "The Melody",
        desc: "Check in, tea, drinks, and light refreshments. Heads up: there's no breakfast, so eat before you come." },
      { time: "9:45 AM", spot: "stage", title: "Opening Ceremony", joy: "awe", where: "The Melody",
        desc: "The gates swing open. You'll know." },
      { time: "11:00 AM", spot: "chapel", title: "Saturday Sermon: \"Are You Awake?\"", joy: "presence", where: "The Melody",
        desc: "Cyan Banister on what it takes to actually be here for your own life." },
      { time: "12:00 to 1:00 PM", spot: "bread", title: "Breaking Bread", joy: "belonging", where: "The Melody",
        desc: "Lunch together, around the things you value most. There's a twist. We're keeping it quiet for now." },
      { time: "1:00 to 4:00 PM", spot: "safari", title: "Joy Safaris", joy: "wonder", where: "Out in the city",
        desc: "Teams head out into San Francisco. No map, no phone." },
      { time: "4:00 to 7:00 PM", spot: "foundry", title: "Magical, Musical, Mystical Saturday", joy: "awe", where: "SF Foundry",
        desc: "A concert. Please arrive at 4 sharp. Bring a BFF (+1). Bonus points if they don't know they're your BFF, or how much of one they are." },
      { time: "7:00 to 9:00 PM", spot: "dinners", title: "Community Dinners", joy: "belonging", where: "Around San Francisco",
        desc: "Small tables, new friends, and the day's stories. We'll help pre-arrange reservations at magical spots. Meals are on you." }
    ]
  },
  {
    id: "sunday",
    tab: "Sunday",
    date: "Sunday, January 17",
    title: "Give It Away",
    theme: "Creating joy outside ourselves, sharing it, and being in service of joy in the city.",
    spirit: "Come with a plan, then hold it loosely. Strong beliefs, loosely held. Stay in flow, let other people's ideas inspire you, and trust what shows up. Nobody needs to arrive saying \"I have to do this.\"",
    location: null,
    blocks: [
      { time: "8:00 AM to 2:00 PM", spot: "city", title: "Joy Activations across San Francisco", joy: "generosity", where: "All over the city",
        desc: "Teams bring to life the experiences they dreamed up on Saturday, small and large.",
        link: { label: "See the Community Schedule", url: "community.html" } },
      { time: "1:30 to 5:00 PM", spot: "foundry", title: "Closing Ceremony & Tea Rave", joy: "belonging", where: "SF Foundry",
        desc: "Arielle Zuckerberg on the decks with surprise guests. Tea poured by [ZM full name], plus a few more experiences we're not spoiling." }
    ]
  }
];
