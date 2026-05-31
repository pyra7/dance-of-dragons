// generate_images.js - AI 绘画批量生成 (Pollinations.ai 免费方案)
// 用法: node scripts/generate_images.js
// 无需 API Token，100% 免费

var fs = require('fs');
var path = require('path');
var https = require('https');

var SCRIPT_PATH = path.join(__dirname, '..', 'data', 'script.json');
var OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images');

var promptTemplates = {
  'bg_dragonstone.png': 'Dark fantasy oil painting, Dragonstone castle on volcanic island, black stone fortress, stormy sky, smoking volcano, dark waves, moody, cinematic, 1280x720',
  'bg_kings_landing.png': 'Dark fantasy oil painting, medieval city on coast, Red Keep castle on hill, crowded streets, city walls, harbor ships, overcast sky, epic, cinematic, 1280x720',
  'bg_red_keep.png': 'Dark fantasy oil painting, interior of medieval throne room, stone columns, stained glass windows, seven pointed star, long shadows, candlelight, gothic, moody, 1280x720',
  'bg_castle.png': 'Dark fantasy oil painting, small fortified castle on bridge over river, stone towers, banners, countryside hills, overcast, moody, 1280x720',
  'bg_battlefield.png': 'Dark fantasy oil painting, medieval battlefield after dragon attack, scorched earth, broken siege weapons, burning castle walls, smoke and ash, dramatic, 1280x720',
  'bg_war_camp_green.png': 'Dark fantasy oil painting, medieval war camp, green dragon banners, tents, soldiers around campfires, horses, overcast sky, cinematic, 1280x720',
  'bg_war_camp_black.png': 'Dark fantasy oil painting, medieval war camp on beach, black and red dragon banners, tents near sea, dragons resting on rocky shore, dramatic sky, 1280x720',
  'bg_gods_eye.png': 'Dark fantasy oil painting, vast misty lake surrounded by forests, empty sky with single ray of light, still water, melancholic, cinematic, 1280x720',
  'cg_dragon_seed.png': 'Dark fantasy oil painting, person with silver hair approaching a grey dragon in volcanic cave, dragon eye glowing, steam and smoke, tense moment, cinematic, 1280x720',
  'cg_dragon_duel.png': 'Dark fantasy oil painting, two giant dragons battling in sky above lake, one biting other neck, fire and blood, storm clouds, epic, cinematic, 1280x720',
  'cg_iron_throne.png': 'Dark fantasy oil painting, Iron Throne forged from thousand swords, towering in dark great hall, single beam of light, dramatic shadows, epic, cinematic, 1280x720'
};

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function downloadFile(url, dest) {
  return new Promise(function (resolve, reject) {
    var file = fs.createWriteStream(dest);
    https.get(url, function (response) {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        reject(new Error('HTTP ' + response.statusCode));
        return;
      }
      response.pipe(file);
      file.on('finish', function () { file.close(); resolve(); });
    }).on('error', function (err) {
      fs.unlink(dest, function () {});
      reject(err);
    });
  });
}

function generateImage(prompt, outputFile) {
  var encoded = encodeURIComponent(prompt);
  var url = 'https://image.pollinations.ai/prompt/' + encoded + '?width=1280&height=720&nologo=true&model=flux';
  console.log('    URL: ' + url.substring(0, 80) + '...');
  return downloadFile(url, outputFile);
}

function extractImages(scriptData) {
  var unique = {};
  var scenes = scriptData.scenes || {};
  Object.keys(scenes).forEach(function (id) {
    var scene = scenes[id];
    if (scene.image) {
      var fname = path.basename(scene.image);
      if (fname && fname !== 'null') unique[fname] = true;
    }
  });
  var endings = scriptData.endings || {};
  Object.keys(endings).forEach(function (id) {
    var ending = endings[id];
    if (ending.image) {
      var fname = path.basename(ending.image);
      if (fname && fname !== 'null') unique[fname] = true;
    }
  });
  return Object.keys(unique);
}

async function main() {
  console.log('');
  console.log('══════════════════════════════════════');
  console.log('  AI 绘画生成 - 血龙狂舞');
  console.log('  方案: Pollinations.ai (免费, 无需Token)');
  console.log('  模型: Flux');
  console.log('══════════════════════════════════════');
  console.log('');

  var raw = fs.readFileSync(SCRIPT_PATH, 'utf8');
  var scriptData = JSON.parse(raw);
  var filenames = extractImages(scriptData);

  console.log('发现 ' + filenames.length + ' 张图片需要生成:');
  filenames.forEach(function (f) { console.log('  - ' + f); });
  console.log('');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  var total = filenames.length;
  var done = 0;
  var failed = 0;

  for (var i = 0; i < filenames.length; i++) {
    var filename = filenames[i];
    var outputPath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(outputPath)) {
      console.log('[' + (i + 1) + '/' + total + '] 跳过(已存在): ' + filename);
      done++;
      continue;
    }

    var prompt = promptTemplates[filename];
    if (!prompt) {
      console.log('[' + (i + 1) + '/' + total + '] 跳过(无模板): ' + filename);
      done++;
      continue;
    }

    console.log('[' + (i + 1) + '/' + total + '] 生成: ' + filename);
    try {
      await generateImage(prompt, outputPath);
      done++;
      console.log('    完成');
    } catch (e) {
      console.log('    失败: ' + e.message);
      failed++;
    }
    await sleep(3000);
  }

  console.log('');
  console.log('══════════════════════════════════════');
  console.log('  完成: ' + done + '/' + total + '  失败: ' + failed);
  console.log('══════════════════════════════════════');
}

main().catch(function (e) {
  console.error('运行失败: ' + e.message);
  process.exit(1);
});
