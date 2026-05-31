// renderer.js - 渲染模块：打字机效果、ASCII/图片渲染、UI 更新
var Renderer = (function () {
  var root, asciiPane, imagePane, narrativePane, choicesPane, hudPane, water;
  var typingSpeed = 30;
  var onChoiceCallback = null;
  var onBackRequest = null;
  var onSaveRequest = null;
  var onLoadRequest = null;
  var currentTheme = '';

  function init() {
    root = document.getElementById('game-root');
    root.innerHTML =
      '<div id="ascii-pane"></div>' +
      '<div id="image-pane" style="display:none;"></div>' +
      '<div id="narrative-pane"></div>' +
      '<div id="choices-pane"></div>' +
      '<div id="hud-pane">' +
      '  <span class="hud-watermark">buaa · 葳蕤 · 出品</span>' +
      '  <span class="hud-controls">' +
      '    <button class="hud-btn" id="btn-back" title="返回">&larr; 返回</button>' +
      '    <button class="hud-btn" id="btn-save" title="存档">存档</button>' +
      '    <button class="hud-btn" id="btn-load" title="读档">读档</button>' +
      '  </span>' +
      '</div>';

    asciiPane = document.getElementById('ascii-pane');
    imagePane = document.getElementById('image-pane');
    narrativePane = document.getElementById('narrative-pane');
    choicesPane = document.getElementById('choices-pane');
    hudPane = document.getElementById('hud-pane');
    water = hudPane.querySelector('.hud-watermark');

    var btnBack = document.getElementById('btn-back');
    var btnSave = document.getElementById('btn-save');
    var btnLoad = document.getElementById('btn-load');

    if (btnBack) {
      btnBack.addEventListener('click', function () {
        if (typeof onBackRequest === 'function') onBackRequest();
      });
    }
    if (btnSave) {
      btnSave.addEventListener('click', function () {
        if (typeof onSaveRequest === 'function') onSaveRequest();
      });
    }
    if (btnLoad) {
      btnLoad.addEventListener('click', function () {
        if (typeof onLoadRequest === 'function') onLoadRequest();
      });
    }
  }

  function setTheme(theme) {
    currentTheme = theme;
    document.body.className = 'theme-' + theme;
    if (water) {
      water.className = 'hud-watermark theme-' + theme;
    }
  }

  function clearAll() {
    if (asciiPane) asciiPane.innerHTML = '';
    if (imagePane) { imagePane.innerHTML = ''; imagePane.style.display = 'none'; }
    if (narrativePane) narrativePane.innerHTML = '';
    if (choicesPane) choicesPane.innerHTML = '';
    onChoiceCallback = null;
  }

  function showAscii(artKey) {
    if (!asciiPane) return;
    var art = AsciiArt[artKey];
    if (art) {
      asciiPane.innerHTML = '<pre class="ascii-art">' + escapeHtml(art) + '</pre>';
      asciiPane.style.display = 'block';
    } else {
      asciiPane.style.display = 'none';
    }
  }

  function showImage(imagePath, fallbackKey) {
    if (!imagePath) {
      showAscii(fallbackKey);
      return;
    }

    if (imagePane && asciiPane) {
      imagePane.innerHTML = '';
      var img = document.createElement('img');
      img.className = 'scene-image';
      img.src = imagePath;
      img.onerror = function () {
        this.style.display = 'none';
        if (asciiPane) asciiPane.style.display = 'block';
        showAscii(fallbackKey || '');
      };
      img.onload = function () {
        imagePane.style.display = 'block';
        asciiPane.style.display = 'none';
      };
      imagePane.appendChild(img);
      imagePane.style.display = 'block';
      asciiPane.style.display = 'none';
    } else {
      showAscii(fallbackKey);
    }
  }

  function showSplash(callback) {
    clearAll();
    setTheme('neutral');
    showAscii('splash_dragon');

    setTimeout(function () {
      if (callback) callback();
    }, 1500);
  }

  function showIdentitySelection(identities, callback) {
    clearAll();
    setTheme('neutral');

    if (narrativePane) {
      narrativePane.innerHTML = '<div class="identity-title">选择你的开局身份</div>';
    }

    if (choicesPane) {
      choicesPane.innerHTML = '';
      for (var i = 0; i < identities.length; i++) {
        (function (index) {
          var ident = identities[index];
          var card = document.createElement('div');
          card.className = 'identity-card';
          card.innerHTML =
            '<div class="identity-name">' + escapeHtml(ident.name) + '</div>' +
            '<div class="identity-tagline">' + escapeHtml(ident.tagline) + '</div>' +
            '<div class="identity-desc">' + escapeHtml(ident.description) + '</div>';
          card.addEventListener('click', function () {
            var defaultName = ident.defaultName || '无名氏';
            var name = prompt('请输入角色名 (留空为 "' + defaultName + '"):');
            if (!name || name.trim() === '') {
              name = defaultName;
            }
            callback(ident, name);
          });
          choicesPane.appendChild(card);
        })(i);
      }
    }
  }

  function showScene(scene, callback) {
    clearAll();
    onChoiceCallback = callback;

    var faction = '';
    try { faction = GameState.getFlag('faction'); } catch (e) {}

    if (scene.isEnding) {
      showEnding(scene);
      return;
    }

    setTheme(faction || 'neutral');
    showImage(scene.image, scene.fallback_ascii);

    var titleEl = document.createElement('div');
    titleEl.className = 'scene-title';
    titleEl.textContent = scene.title;
    narrativePane.appendChild(titleEl);

    typeParagraphs(scene.narrative, 0, function () {
      showChoices(scene.availableChoices);
    });
  }

  function typeParagraphs(paragraphs, index, doneCallback) {
    if (index >= paragraphs.length) {
      if (doneCallback) doneCallback();
      return;
    }

    var p = document.createElement('p');
    p.className = 'narrative-line';
    narrativePane.appendChild(p);
    typeText(p, paragraphs[index], typingSpeed, function () {
      var nextIndex = index + 1;
      typeParagraphs(paragraphs, nextIndex, doneCallback);
    });

    narrativePane.scrollTop = narrativePane.scrollHeight;
  }

  function typeText(element, text, speed, callback) {
    var i = 0;
    element.textContent = '';
    element.classList.add('typing');

    var timer = setInterval(function () {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        narrativePane.scrollTop = narrativePane.scrollHeight;
      } else {
        clearInterval(timer);
        element.classList.remove('typing');
        element.classList.add('typed');
        if (callback) callback();
      }
    }, speed);
  }

  function showChoices(choices) {
    if (!choices || choices.length === 0) return;
    if (!choicesPane) return;

    choicesPane.innerHTML = '';
    var container = document.createElement('div');
    container.className = 'choices-container';

    for (var i = 0; i < choices.length; i++) {
      (function (index) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = (index + 1) + '. ' + choices[index].text;
        btn.addEventListener('click', function () {
          if (onChoiceCallback) {
            choicesPane.innerHTML = '';
            onChoiceCallback(index);
          }
        });
        container.appendChild(btn);
      })(i);
    }

    choicesPane.appendChild(container);
  }

  function showEnding(scene) {
    clearAll();
    var ending = scene.ending;

    if (ending) {
      var endingId = ending.id || '';
      if (endingId.indexOf('green') >= 0) setTheme('green');
      else if (endingId.indexOf('black') >= 0) setTheme('black');
      else if (endingId.indexOf('death') >= 0) setTheme('death');
      else if (endingId.indexOf('iron') >= 0) setTheme('iron');
      else setTheme('neutral');

      showImage(ending.image, ending.fallback_ascii || 'death_skull');

      var titleEl = document.createElement('div');
      titleEl.className = 'ending-title';
      titleEl.textContent = ending.title;
      narrativePane.appendChild(titleEl);

      if (ending.narrative) {
        var texts = Array.isArray(ending.narrative) ? ending.narrative : [ending.narrative];
        for (var i = 0; i < texts.length; i++) {
          var p = document.createElement('p');
          p.className = 'ending-text';
          p.textContent = texts[i];
          narrativePane.appendChild(p);
        }
      }

      if (ending.epilogue) {
        var epi = document.createElement('div');
        epi.className = 'epilogue';
        epi.textContent = typeof ending.epilogue === 'string' ? ending.epilogue : (ending.epilogue.standard || '');
        narrativePane.appendChild(epi);
      }
    }

    var thanks = document.createElement('div');
    thanks.className = 'thanks';
    thanks.textContent = '— buaa · 葳蕤 · 出品 —';
    narrativePane.appendChild(thanks);

    var restart = document.createElement('button');
    restart.className = 'restart-btn';
    restart.textContent = '重新开始';
    restart.addEventListener('click', function () {
      location.reload();
    });
    narrativePane.appendChild(restart);
  }

  function registerBack(fn) { onBackRequest = fn; }
  function registerSave(fn) { onSaveRequest = fn; }
  function registerLoad(fn) { onLoadRequest = fn; }

  function showSaveSlots(slots, onSelect) {
    showSlotModal('保存存档', 'save', slots, onSelect);
  }

  function showLoadSlots(slots, onSelect) {
    showSlotModal('读取存档', 'load', slots, onSelect);
  }

  function showSlotModal(title, action, slots, onSelect) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    var modal = document.createElement('div');
    modal.className = 'modal-box';

    var h = document.createElement('div');
    h.className = 'modal-title';
    h.textContent = title;
    modal.appendChild(h);

    for (var i = 0; i < 5; i++) {
      (function (slotIndex) {
        var slotData = slots[slotIndex];
        var row = document.createElement('div');
        row.className = 'modal-slot' + (slotData ? ' has-data' : '');

        var label = document.createElement('span');
        label.className = 'slot-label';
        label.textContent = '槽位 ' + (slotIndex + 1);

        var info = document.createElement('span');
        info.className = 'slot-info';
        if (slotData && slotData.flags) {
          var idName = '';
          try {
            var identities = [
              { id: 'dragon_seed', name: '龙种私生子' },
              { id: 'kingsguard', name: '御林铁卫' },
              { id: 'noble_lord', name: '贵族领主' }
            ];
            for (var j = 0; j < identities.length; j++) {
              if (identities[j].id === slotData.flags.identity) {
                idName = identities[j].name;
              }
            }
          } catch (e) {}
          info.textContent = idName + ' · ' + (slotData.flags.name || '?') +
            ' · ' + (slotData.flags.scene_history ? slotData.flags.scene_history.length + '步' : '');
        } else {
          info.textContent = '空';
        }

        row.appendChild(label);
        row.appendChild(info);

        row.addEventListener('click', function () {
          if (action === 'save') {
            if (slotData) {
              if (!confirm('该槽位已有存档，确定覆盖？')) return;
            }
            onSelect(slotIndex);
            document.body.removeChild(overlay);
          } else {
            if (!slotData) return;
            onSelect(slotIndex);
            document.body.removeChild(overlay);
          }
        });

        modal.appendChild(row);
      })(i);
    }

    var closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.textContent = '关闭';
    closeBtn.addEventListener('click', function () {
      document.body.removeChild(overlay);
    });
    modal.appendChild(closeBtn);

    overlay.appendChild(modal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
    document.body.appendChild(overlay);
  }

  function showFeedback(text, callback) {
    if (!narrativePane) { if (callback) callback(); return; }

    var fb = document.createElement('div');
    fb.className = 'feedback-text';
    fb.textContent = '';
    narrativePane.appendChild(fb);

    typeText(fb, text, 25, function () {
      setTimeout(function () {
        if (fb.parentNode) fb.parentNode.removeChild(fb);
        if (callback) callback();
      }, 1200);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    init: init, clearAll: clearAll, setTheme: setTheme,
    showAscii: showAscii, showImage: showImage,
    showSplash: showSplash, showIdentitySelection: showIdentitySelection,
    showScene: showScene, showEnding: showEnding,
    showSaveSlots: showSaveSlots, showLoadSlots: showLoadSlots,
    registerBack: registerBack, registerSave: registerSave, registerLoad: registerLoad,
    showFeedback: showFeedback,
    escapeHtml: escapeHtml
  };
})();
