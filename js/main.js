// main.js - 游戏主控制器
(function () {
  var scriptData = null;
  var currentSceneId = null;

  async function init() {
    try {
      var response = await fetch('data/script.json');
      scriptData = await response.json();
      GameEngine.init(scriptData);
      Renderer.init();

      Renderer.registerBack(handleBack);
      Renderer.registerSave(handleSave);
      Renderer.registerLoad(handleLoad);

      Renderer.showSplash(function () {
        showIdentitySelection();
      });
    } catch (e) {
      console.error('初始化失败:', e);
      document.body.innerHTML =
        '<div style="color:#c41e3a;text-align:center;margin-top:120px;">' +
        '<h2>加载失败</h2>' +
        '<p>请确认 data/script.json 存在，并使用 HTTP 服务器打开此页面。</p>' +
        '<p>运行: <code>npx serve .</code> 或 <code>python -m http.server 8080</code></p>' +
        '</div>';
    }
  }

  function showIdentitySelection() {
    var identities = GameEngine.getAllIdentities();
    Renderer.showIdentitySelection(identities, function (identity, name) {
      GameState.newGame(identity.id, name);
      var startingSceneId = GameEngine.getStartingScene(identity.id);
      loadAndShowScene(startingSceneId);
    });
  }

  function loadAndShowScene(sceneId) {
    currentSceneId = sceneId;
    var scene = GameEngine.getScene(sceneId);

    if (!scene) {
      console.error('无法加载场景: ' + sceneId);
      return;
    }

    if (scene.isEnding) {
      Renderer.showEnding(scene);
      return;
    }

    GameState.setCurrentSceneId(sceneId);
    Renderer.showScene(scene, function (choiceIndex) {
      var result = GameEngine.processChoice(scene, choiceIndex);
      if (!result) return;

      if (result.feedback) {
        Renderer.showFeedback(result.feedback, function () {
          loadAndShowScene(result.next_scene);
        });
      } else if (result.next_scene) {
        loadAndShowScene(result.next_scene);
      }
    });
  }

  function handleBack() {
    if (!GameEngine.canGoBack()) {
      alert('无法再返回了。');
      return;
    }
    var prevSceneId = GameState.popSceneHistory();
    if (prevSceneId) {
      loadAndShowScene(prevSceneId);
    }
  }

  function handleSave() {
    var slots = GameState.getSaveSlots();
    Renderer.showSaveSlots(slots, function (slotIndex) {
      GameState.setCurrentSceneId(currentSceneId);
      GameState.save(slotIndex);
    });
  }

  function handleLoad() {
    var slots = GameState.getSaveSlots();
    Renderer.showLoadSlots(slots, function (slotIndex) {
      var success = GameState.load(slotIndex);
      if (success) {
        var sceneId = GameState.getCurrentSceneId();
        if (sceneId) {
          loadAndShowScene(sceneId);
        } else {
          showIdentitySelection();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
