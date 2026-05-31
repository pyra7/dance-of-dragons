// state.js - 全局状态管理与存档系统
const GameState = (() => {
  const STORAGE_KEY = 'dod_save_slot';

  const createDefaults = () => ({
    identity: null,
    name: '',
    leaning: null,
    faction: null,
    legitimized: false,
    tamed_dragon: false,
    survived: true,
    declared_self: false,
    helaena_affection: 0,
    rhaenyra_affection: 0,
    hightower_affection: 0,
    velaryon_affection: 0,
    alliance: [],
    betrayal_count: 0,
    battles_won: 0,
    scene_history: []
  });

  let flags = createDefaults();
  let currentSceneId = null;

  function newGame(identity, name) {
    flags = createDefaults();
    flags.identity = identity;
    flags.name = name;
    currentSceneId = null;
  }

  function getFlag(key) {
    return flags[key];
  }

  function setFlag(key, value) {
    flags[key] = value;
  }

  function setFlags(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'affection' && value) {
        for (const [affKey, affVal] of Object.entries(value)) {
          if (flags[affKey] !== undefined) {
            flags[affKey] += affVal;
          }
        }
      } else {
        flags[key] = value;
      }
    }
  }

  function pushSceneHistory(sceneId) {
    flags.scene_history.push(sceneId);
  }

  function popSceneHistory() {
    return flags.scene_history.pop();
  }

  function getSceneHistory() {
    return [...flags.scene_history];
  }

  function save(slot) {
    slot = slot || 0;
    const data = { flags, currentSceneId };
    localStorage.setItem(STORAGE_KEY + '_' + slot, JSON.stringify(data));
    return true;
  }

  function load(slot) {
    slot = slot || 0;
    const raw = localStorage.getItem(STORAGE_KEY + '_' + slot);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      flags = data.flags;
      currentSceneId = data.currentSceneId;
      return true;
    } catch (e) {
      return false;
    }
  }

  function getSaveSlots() {
    const slots = [];
    for (let i = 0; i < 5; i++) {
      const raw = localStorage.getItem(STORAGE_KEY + '_' + i);
      slots.push(raw ? JSON.parse(raw) : null);
    }
    return slots;
  }

  function reset() {
    flags = createDefaults();
    currentSceneId = null;
  }

  function getCurrentSceneId() {
    return currentSceneId;
  }

  function setCurrentSceneId(id) {
    currentSceneId = id;
  }

  return {
    newGame, getFlag, setFlag, setFlags,
    pushSceneHistory, popSceneHistory, getSceneHistory,
    save, load, getSaveSlots, reset,
    getCurrentSceneId, setCurrentSceneId
  };
})();
