const $ = require('jquery');
const Tone = require('tone');

const layerMinValue = -51;
const layerMaxValue = 26;
const accelerometerMaxValue = 190;

const droneMinValue = 17;
const droneMaxValue = 24;

const bgValue = 30;

const clickValue = 18;

let players = null;
let soundsInitialized = false;

$('#initLarge').click(() => {
  initSoundFiles('audio/BGL.mp3', 'audio/DroneL.mp3', 'audio/LayerL.mp3', 'audio/ClickL.wav');
});

$('#initMedium').click(() => {
  initSoundFiles('audio/BGM.mp3', 'audio/DroneM.mp3', 'audio/LayerM.mp3', 'audio/ClickM.wav');
});

$('#initSmall').click(() => {
  initSoundFiles('audio/BGS.mp3', 'audio/DroneS.mp3', 'audio/LayerS.mp3', 'audio/ClickS.wav');
});

function initSoundFiles(bgPath, dronePath, layerPath, clickPath) {
  if (players != null) {
    players.stopAll();
    running = false;
    const state = running ? 'playing' : 'stopped';
    $('#state').text(state);
  }
  players = new Tone.Players({
    bg: bgPath,
    drone: dronePath,
    layer: layerPath,
    click: clickPath
  }, () => {
    console.log('samples ready');
    main();
    soundsInitialized = true;
  }).toMaster();
}

function main() {
  const bg = players.get('bg');
  const drone = players.get('drone');
  const layer = players.get('layer');
  const click = players.get('click');

  bg.loop = true;
  bg.volume.value = bgValue;
  drone.loop = true;
  drone.volume.value = droneMinValue;
  layer.loop = true;
  layer.volume.value = layerMinValue;
  click.loop = false;
  click.volume.value = clickValue;

  $('#initialized').text('ok!');
}

let running = false;
$('#toggle').click(() => {
  if (soundsInitialized) {
    players.stopAll();
    running = !running;
    if (running) {
      players.get('bg').start();
      players.get('drone').start();
      players.get('layer').start();
    }
    const state = running ? 'playing' : 'stopped';
    $('#state').text(state);
  }
});

function getVolume(normalized) {
  const value = Math.abs(Math.sin(normalized * Math.PI * 2));

  return ((-layerMinValue + layerMaxValue) * value) + layerMinValue;
}

function handleOrientation(event) {
  const value = event.alpha / 360.0;
  players.get('layer').volume.value = getVolume(value);
  players.get('drone').volume.value = getDroneVolume(event.alpha);

  const text = Math.floor(event.alpha);
  $('#value').text(text);
}

function handleMotion(event) {
  let value = Math.floor(Math.abs(event.rotationRate.gamma));
  if (value > accelerometerMaxValue) {
    value = accelerometerMaxValue;
  }

  $('#acceleration').text(value);

  if (value > 25 && running) {
    const delay = clickTempo - value;
    throttledFunctionCall(playClick, delay);
  }
}

function getDroneVolume(value) {
  if (value > 40 && value < 320) {
     return droneMaxValue;
  }
  return droneMinValue;
}

window.addEventListener('deviceorientation', handleOrientation);
window.addEventListener('devicemotion', handleMotion, true);

var slider = document.getElementById("myRange");
let lastPlayed = Date.now();
let clickTempo = 240;

slider.oninput = function() {
    const value = this.value / 360;
    players.get('layer').volume.value = getVolume(value);
    players.get('drone').volume.value = getDroneVolume(this.value);

    const text = Math.floor(this.value);
    $('#value').text(text);

    lastPlayed = Date.now();

    throttledFunctionCall(playClick, clickTempo );
}

function playClick() {
  players.get('click').start();
}

let calledFunctions = {};

function throttledFunctionCall(functionCall, maxFrequency) {
  let key = functionCall.toString();
  
  if (!(key in calledFunctions)) {
    calledFunctions[key] = {firstCall: false, secondCall: false};
  }
  if (!calledFunctions[key].firstCall) {
    instantCall(functionCall, key, maxFrequency);
  } 
};

function instantCall(functionCall, key, maxFrequency) {
  functionCall();
  calledFunctions[key].firstCall = true;
  window.setTimeout(
    function() {
      calledFunctions[key].firstCall = false;
  }, maxFrequency)
}
