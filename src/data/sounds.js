// Ambient sounds: name -> YouTube URL
export const BASE_SOUND = 'Base Sound';

export const soundUrls = {
  "Bamboo Forest": "https://www.youtube.com/watch?v=a20ooDY0L0E",
  "Blizzard": "https://www.youtube.com/watch?v=YsmfWkE6FUg",
  "Cafe Jazz & Rain": "https://www.youtube.com/watch?v=c0_ejQQcrwI",
  "Campfire & River": "https://www.youtube.com/watch?v=Ftm2uv7-Ybw",
  "Christmas Music": "https://www.youtube.com/watch?v=hPz7h_XK9EQ",
  "Disney Piano": "https://www.youtube.com/watch?v=g8NVwN0_mks",
  "Disney Piano 2": "https://www.youtube.com/watch?v=2Mu7LAhxyp8",
  "Disney Springs": "https://www.youtube.com/watch?v=klOe-e9y0_4",
  "EPCOT Area Music": "https://www.youtube.com/watch?v=f7vevAplVYI",
  "Fall Leaves": "https://www.youtube.com/watch?v=aT66uumZ0Zo",
  "Fireplace": "https://youtu.be/UgHKb_7884o?t=607",
  "Forest Sounds": "https://www.youtube.com/watch?v=TOHYkccYfUk",
  "Jungle Sounds": "https://youtu.be/g45jXV-fg2E?t=393",
  "Hollywood Studios Area Music": "https://www.youtube.com/watch?v=oP_AzHbU19g",
  "Large Waterfall": "https://www.youtube.com/watch?v=Qo3OM5sPUPM",
  "Light Rain": "https://www.youtube.com/watch?v=7JyE47-Ykjo",
  "Light Snow": "https://www.youtube.com/watch?v=vz91QpgUjFc",
  "Magic Kingdom Area Music": "https://www.youtube.com/watch?v=QGdeBShy2u8",
  
  "Narnia Winter Music": "https://www.youtube.com/watch?v=5RHTt4_XVVU",
  "Nighttime Forest": "https://www.youtube.com/watch?v=PVV4-2G0t3k",
  "Small Waterfall": "https://youtu.be/02NQkhbjALg?t=388",
  "Snow & Wind": "https://www.youtube.com/watch?v=oakA7RLvmWs",
  "Soft Waves": "https://www.youtube.com/watch?v=ec_xGmM_tJc",
  "Stream": "https://youtu.be/UJZxtO9XNno?t=375",
  'Seaside Piano': "https://www.youtube.com/watch?v=QR3lp0ptpy8",
  "Summer Night": "https://www.youtube.com/watch?v=7GoXVDH656g",
  "Thunder": "https://www.youtube.com/watch?v=yMRoNNKWuqQ",
  "Tropical House": "https://www.youtube.com/watch?v=0D0LMWf93pU",
  "Waves": "https://www.youtube.com/watch?v=Nep1qytq9JM",
  "Wind": "https://www.youtube.com/watch?v=lWULd19LvaY",
  "Winter at Hogwarts": "https://www.youtube.com/watch?v=oE-pXV-G9aY",
  "Wizarding World Area Music": "https://www.youtube.com/watch?v=F6am4iEDez0",
  "Lilo & Stitch Soundscape": "https://www.youtube.com/watch?v=tbQ8yLIZePo",
  "Little Mermaid Soundscape": "https://www.youtube.com/watch?v=Kd0H572nTno",
  "Lion King Soundscape": "https://www.youtube.com/watch?v=Rx_Fp0sdXz8",
  "Disney Parks Soundscape": "https://www.youtube.com/watch?v=INppObmqIk8",
  "Haunted Mansion Soundscape": "https://www.youtube.com/watch?v=BuhiXmnMYPA",
  "WDW Today Channel": "https://www.youtube.com/watch?v=-LqPzc9bYe0",
  "Cafe Chatter": "https://www.youtube.com/watch?v=0QKdqm5TX6c",
  "Turning Pages": "https://www.youtube.com/watch?v=bCfk_m6YYgI",
  "Morning Birdsong": "https://www.youtube.com/watch?v=WarL4vURLYw",
  "Wind Chimes": "https://www.youtube.com/watch?v=x7nnfu5ju5o",
  "Soft Jazz": "https://www.youtube.com/watch?v=Q1O9AY_lZww"
};

const SOUND_GROUPS = {
  'Rain & Weather': ['Light Rain', 'Thunder', 'Cafe Jazz & Rain', 'Blizzard', 'Snow & Wind', 'Light Snow', 'Wind', 'Fall Leaves'],
  'Water & Fire': ['Waves', 'Soft Waves', 'Stream', 'Small Waterfall', 'Large Waterfall', 'Campfire & River', 'Fireplace'],
  'Forest & Night': ['Forest Sounds', 'Nighttime Forest', 'Summer Night', 'Bamboo Forest', 'Jungle Sounds', 'Morning Birdsong', 'Wind Chimes'],
  'Cozy Indoors': ['Cafe Chatter', 'Turning Pages'],
  Music: ['Seaside Piano', 'Disney Piano', 'Disney Piano 2', 'Christmas Music', 'Tropical House', 'Narnia Winter Music', 'Winter at Hogwarts', 'Soft Jazz'],
  'Parks & Worlds': [
    'Disney Springs', 'EPCOT Area Music', 'Hollywood Studios Area Music', 'Magic Kingdom Area Music',
    'Wizarding World Area Music', 'Lilo & Stitch Soundscape', 'Little Mermaid Soundscape',
    'Lion King Soundscape', 'Disney Parks Soundscape', 'Haunted Mansion Soundscape', 'WDW Today Channel',
  ],
};

// Grouped for the sound mixer; any sound missing from SOUND_GROUPS lands in "More"
export const soundCategories = (() => {
  const grouped = new Set(Object.values(SOUND_GROUPS).flat());
  const more = Object.keys(soundUrls).filter((name) => !grouped.has(name)).sort();
  const categories = Object.entries(SOUND_GROUPS).map(([name, sounds]) => ({
    name,
    sounds: sounds.filter((s) => s in soundUrls),
  }));
  return more.length ? [...categories, { name: 'More', sounds: more }] : categories;
})();
