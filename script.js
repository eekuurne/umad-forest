const $ = require('jquery');
const Tone = require('tone');

const layerMinValue = -50;
const layerMaxValue = -2;
const accelerometerMaxValue = 190;

const droneMinValue = 0;
const droneMaxValue = 15;

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
  drone.loop = true;
  drone.volume.value = droneMinValue - droneMaxValue;
  layer.loop = true;
  layer.volume.value = layerMinValue;
  click.loop = false;
  //click.volume.value = -20;

  console.log(drone.volume.value);

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

  const text = Math.floor(event.alpha);
  $('#value').text(text);
}

function handleMotion(event) {
  let value = Math.floor(Math.abs(event.rotationRate.gamma));
  if (value > accelerometerMaxValue) {
    value = accelerometerMaxValue;
  }

  $('#acceleration').text(value);

  let droneVolume = value / accelerometerMaxValue * droneMaxValue - droneMaxValue;
  players.get('drone').volume.value = droneVolume;

  if (value > 30 && running) {
    const delay = clickTempo - value;
    throttledFunctionCall(playClick, delay);
  }
}

window.addEventListener('deviceorientation', handleOrientation);
window.addEventListener('devicemotion', handleMotion, true);

var slider = document.getElementById("myRange");
let lastPlayed = Date.now();
let clickTempo = 240;

slider.oninput = function() {
    const value = this.value / 360;
    players.get('layer').volume.value = getVolume(value);

    const text = Math.floor(this.value);
    $('#value').text(text);

    lastPlayed = Date.now();

    throttledFunctionCall(playClick, clickTempo );

    window.setTimeout(
      function() {
        if (Date.now() > lastPlayed + 199) {
          players.get('layer').volume.value = layerMinValue;
          clickTempo = 200;
        }
      }, 200);
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
