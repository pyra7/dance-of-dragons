// engine.js - 剧本引擎：场景推进、选择分发、flag 管理、结局判定
const GameEngine = (() => {
  let scriptData = null;

  function init(data) {
    scriptData = data;
  }

  function getScene(sceneId) {
    if (sceneId && sceneId.startsWith('ending_')) {
      return {
        id: sceneId,
        isEnding: true,
        ending: scriptData.endings[sceneId] || null
      };
    }

    const scene = scriptData.scenes[sceneId];
    if (!scene) {
      console.error('[Engine] 场景未找到: ' + sceneId);
      return null;
    }

    var filtered = filterChoices(scene.choices);
    return {
      id: scene.id,
      title: scene.title,
      image: scene.image || null,
      fallback_ascii: scene.fallback_ascii || null,
      narrative: filterNarrative(scene.narrative),
      choices: scene.choices,
      availableChoices: filtered,
      isEnding: false
    };
  }

  function filterChoices(choices) {
    if (!choices) return [];
    return choices.filter(function(choice) {
      if (!choice.condition) return true;
      for (var key in choice.condition) {
        if (choice.condition.hasOwnProperty(key)) {
          if (GameState.getFlag(key) !== choice.condition[key]) return false;
        }
      }
      return true;
    });
  }

  function filterNarrative(narratives) {
    if (!narratives) return [];
    var result = [];
    for (var i = 0; i < narratives.length; i++) {
      var item = narratives[i];
      if (typeof item === 'string') {
        result.push(item);
      } else if (item && item.text) {
        if (!item.condition) {
          result.push(item.text);
        } else {
          var match = true;
          for (var key in item.condition) {
            if (item.condition.hasOwnProperty(key)) {
              if (GameState.getFlag(key) !== item.condition[key]) {
                match = false;
                break;
              }
            }
          }
          if (match) result.push(item.text);
        }
      }
    }
    return result;
  }

  function processChoice(scene, choiceIndex) {
    var available = scene.availableChoices || filterChoices(scene.choices);
    var choice = available[choiceIndex];
    if (!choice) {
      console.error('[Engine] 无效选择: ' + choiceIndex);
      return null;
    }

    if (choice.set_flag) {
      GameState.setFlags(choice.set_flag);
    }

    GameState.pushSceneHistory(scene.id);

    return {
      next_scene: choice.next_scene,
      feedback: choice.feedback || null
    };
  }

  function getIdentity(id) {
    if (!scriptData) return null;
    for (var i = 0; i < scriptData.identities.length; i++) {
      if (scriptData.identities[i].id === id) return scriptData.identities[i];
    }
    return null;
  }

  function getAllIdentities() {
    return scriptData ? scriptData.identities : [];
  }

  function getEnding(endingId) {
    return scriptData && scriptData.endings ? (scriptData.endings[endingId] || null) : null;
  }

  function checkEndingConditions(endingId) {
    var ending = getEnding(endingId);
    if (!ending || !ending.conditions) return false;
    for (var key in ending.conditions) {
      if (ending.conditions.hasOwnProperty(key)) {
        if (GameState.getFlag(key) !== ending.conditions[key]) return false;
      }
    }
    return true;
  }

  function getStartingScene(identityId) {
    var identity = getIdentity(identityId);
    return identity ? identity.starting_scene : null;
  }

  function canGoBack() {
    return GameState.getSceneHistory().length > 0;
  }

  function goBack() {
    var history = GameState.getSceneHistory();
    if (history.length === 0) return null;
    var prevSceneId = history.pop();
    return getScene(prevSceneId);
  }

  return {
    init, getScene, processChoice, getIdentity, getAllIdentities,
    getEnding, checkEndingConditions, getStartingScene,
    canGoBack, goBack
  };
})();
