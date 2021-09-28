'use strict';
let fceux = null;
let gamepad = null;
let bits = 0;
const keys = [
  ['KeyA', 'A'],
  ['KeyZ', 'B'],
  ['Space', 'Select'],
  ['Enter', 'Start'],
  ['ArrowUp', 'Up'],
  ['ArrowDown', 'Down'],
  ['ArrowLeft', 'Left'],
  ['ArrowRight', 'Right'],
];


function getGames() {
  return localStorage.hasOwnProperty('games')
    ? JSON.parse(localStorage['games'])
    : {};
}
function startGame(u8){
  console.log(fceux);
  fceux._initialized = !0,
  fceux.init('#output');
  fceux.removeEventListener('game-loaded', loadGame);
  fceux.addEventListener('game-loaded', loadGame);
  storeState();
  gamepad = new GAMEPAD();
  fceux.loadGame(u8);

  const updateLoop = () => {
    window.requestAnimationFrame(updateLoop);
    fceux.update();
    gamepad.updateGamepad();
  };
  window.requestAnimationFrame(updateLoop);
}
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  var fileReader = new FileReader();
  fileReader.onload = function () {
    if (!this.result) return;
    const u8 = new Uint8Array(this.result);
    storeGame(file.name, u8);
    startGame(u8);
  };
  fileReader.readAsArrayBuffer(file);
});
document.getElementById('resetButton').addEventListener('click', (e) => {
  fceux.reset();
});
document.getElementById('pauseButton').addEventListener('click', (e) => {
  let flg = fceux.paused();
  fceux.setPaused(!flg);
});
document.getElementById('speed').addEventListener('change', (e) => {
  if(e.target.value-0 === 1){
    fceux.setThrottling(false);
  }else{
    fceux.setThrottling(true);
  }
});
document.getElementById('setteings').addEventListener('click', (e) => {
  showSetting();
});
document.getElementById('settingdiv').addEventListener('click', (e) => {
  hideSetting();
});
document.getElementById('gamepad_button_container').addEventListener(
  'click',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
  },
  true
);
document.getElementById('saveButton').addEventListener('click', (e) => {
  localStorage['save_game'] = localStorage['recent'];
  fceux.saveState();
});
document.getElementById('loadButton').addEventListener('click', (e) => {
  const game = localStorage['save_game'];
  if(!game)return;
  const u8 = new Uint8Array(JSON.parse(game));
  startGame(u8);
  fceux.loadState();
});
function storeState() {
  setInterval(() => {
    const t = fceux.gameMd5();
    if (t) {
      const e = fceux.exportSaveFiles(),
        i = {};
      for (let t in e) i[t] = Array.from(e[t]);
      localStorage['save-' + t] = JSON.stringify(i);
    }
  }, 1e3);
}
function loadGame() {
  const t = fceux.gameMd5();
  if (t && localStorage.hasOwnProperty('save-' + t)) {
    const e = JSON.parse(localStorage['save-' + t]);
    for (let t in e) e[t] = new Uint8Array(e[t]);
    fceux.importSaveFiles(e);
  }
}
function storeGame(name, u8) {
  const games = getGames();
  let _u8 = Array.from(u8);
  games[name] = _u8;
  localStorage['recent'] = JSON.stringify(_u8);
}
function resizeCanvas() {
  setTimeout(() => {
    let canvas = document.getElementById('output_container');
    const wh = window.innerHeight;
    const ww = window.innerWidth;
    const nw = 522;
    const nh = 400;
    const waspct = ww / wh;
    const naspct = nw / nh;

    if (waspct > naspct) {
      var val = wh / nh;
    } else {
      var val = ww / nw;
    }
    let ctrldiv = document.querySelector('.ctrl_div');
    canvas.style.height = 400 * val - ctrldiv.offsetHeight - 18 + 'px';
    canvas.style.width = 522 * val - 24 + 'px';
  }, 1200);
}
function keyHandler(e) {
  for (let i = 0; i < keys.length; ++i) {
    if (e.code == keys[i][0]) {
      if (e.type == 'keydown') {
        bits |= 1 << i;
      } else {
        bits &= ~(1 << i);
      }
      fceux.setControllerBits(bits);
      e.preventDefault();
    }
  }
}
function hideSetting() {
  let elem = document.getElementById('settingdiv');
  if (elem.style.display == 'block') {
    elem.style.left = '-500px';
    setTimeout(function () {
      elem.style.display = 'none';
    }, 400);
  }
}
function showSetting() {
  document.getElementById('settingdiv').style.display = 'block';
  setTimeout(function () {
    document.getElementById('settingdiv').style.left = 0;
  }, 10);
}
window.addEventListener('keydown', keyHandler);
window.addEventListener('keyup', keyHandler);
window.addEventListener('resize', resizeCanvas);
FCEUX().then((fceux_) => {
  fceux = fceux_;
});
resizeCanvas();
