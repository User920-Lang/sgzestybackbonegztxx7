const MAPS = [
  { name: "tile fall",     id: "level1_tile"    },
  { name: "over and under",id: "level7_moving"  },
  { name: "spin go round", id: "level9_seesaw"  },
  { name: "icy heights",   id: "level3_ice"     },
  { name: "cannon climb",  id: "level16_temple" },
  { name: "pivot push",    id: "level4_pushy"   },
  { name: "floor flip",    id: "level5_pivot"   },
  { name: "super slide",   id: "level14_slide"  },
  { name: "block dash",    id: "level19_block"  },
  { name: "laser tracer",  id: "level15_laser"  },
  { name: "bombardment",   id: "level12_bomb"   },
  { name: "honey drop",    id: "level8_honey"   },
  { name: "lava land",     id: "level11_lava"   },
  { name: "bot bash",      id: "level22_bot"    },
];

function getMap(name) {
  return MAPS.find(m => m.name === name?.toLowerCase()) || null;
}

module.exports = { MAPS, getMap };
