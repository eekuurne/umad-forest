const $ = require('jquery');
const Tone = require('tone');

const layerMinValue = -20;
const layerMaxValue = 5;
const accelerometerMaxValue = 200;

const players = new Tone.Players({
  bg: 'audio/bg.mp3',
  drone: 'audio/drone.mp3',
  layer: 'audio/layer.mp3',
  click: 'audio/click.wav'
}, () => {
  console.log('samples ready');
  main();
}).toMaster();

function main() {
  const bg = players.get('bg');
  const drone = players.get('drone');
  const layer = players.get('layer');
  const click = players.get('click');

  bg.loop = true;
  drone.loop = true;
  layer.loop = true;
  click.loop = false;
  layer.volume.value = layerMinValue;
}

let running = false;
$('#toggle').click(() => {
  running = !running;
  if (running) {
    players.get('bg').start();
    players.get('drone').start();
    players.get('layer').start();
  } else {
    players.get('bg').stop();
    players.get('drone').stop();
    players.get('layer').stop();
  }
  const state = running ? 'playing' : 'stopped';
  $('#state').text(state);
});

function getVolume(normalized) {
  const value = normalized < 0.5 ?
    normalized * 2 :
    (1 - (normalized * 2)) + 1;

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

  const tempo = clickTempo - value;
  throttledFunctionCall(playClick, tempo);

  $('#acceleration').text(tempo);
}

window.addEventListener('deviceorientation', handleOrientation);
window.addEventListener('devicemotion', handleMotion, true);

/* Slider */

var slider = document.getElementById("myRange");

let lastPlayed = Date.now();

let clickTempo = 220;
const clickMaxTempo = 300;

// Update the current slider value (each time you drag the slider handle)
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
  if (clickTempo > clickMinTempo) {
    clickTempo -= 3;
  }
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
