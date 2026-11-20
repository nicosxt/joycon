/* "Find your joy" sort (joy.html). Six questions. Each answer points at one
   type of joy from JOY.joyTypes in data/site.js. Most picks wins; ties go to
   the answer picked last. Copy rule: no em dashes or en dashes. */

window.JOY = window.JOY || {};

JOY.sort = [
  { q: "A free Saturday shows up out of nowhere. You...",
    a: [ ["wander somewhere you've never been", "wonder"],
         ["text the group chat and make a plan", "belonging"],
         ["do absolutely nothing, on purpose", "presence"] ] },
  { q: "The last time you laughed until it hurt, you were...",
    a: [ ["doing something completely ridiculous", "play"],
         ["getting away with something", "mischief"],
         ["with people who really know you", "belonging"] ] },
  { q: "Pick a view.",
    a: [ ["a night sky with zero city lights", "awe"],
         ["a kitchen full of people cooking together", "generosity"],
         ["a street you've walked a hundred times, somehow new", "wonder"] ] },
  { q: "What do you wish you did more of?",
    a: [ ["saying thank you out loud", "gratitude"],
         ["making things for other people", "generosity"],
         ["being fully here, phone in a drawer", "presence"] ] },
  { q: "Pick a tiny rebellion.",
    a: [ ["dessert first", "mischief"],
         ["a cartwheel in public", "play"],
         ["a toast to someone who isn't expecting it", "gratitude"] ] },
  { q: "At a party you're usually...",
    a: [ ["the one starting the game", "play"],
         ["outside, looking at the moon", "awe"],
         ["the one who makes sure the quiet person is okay", "belonging"] ] }
];
