const $ = require('jquery');
const Tone = require('tone');

const layerMinValue = -20;
const layerMaxValue = 5;

const players = new Tone.Players({
  bg: 'audio/bg.mp3',
  drone: 'audio/drone.mp3',
  layer: 'audio/layer.mp3'
}, () => {
  console.log('samples ready');
  main();
}).toMaster();

function main() {
  const bg = players.get('bg');
  const drone = players.get('drone');
  const layer = players.get('layer');

  bg.loop = true;
  drone.loop = true;
  layer.loop = true;
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

window.addEventListener('deviceorientation', handleOrientation);

/* Slider */

var slider = document.getElementById("myRange");

let lastPlayed = Date.now();
let layerVolume = 0;

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    const value = this.value / 360;
    players.get('layer').volume.value = getVolume(value);

    const text = Math.floor(this.value);
    $('#value').text(text);

    lastPlayed = Date.now();

    window.setTimeout(
      function() {
        if (Date.now() > lastPlayed + 199) {
          players.get('layer').volume.value = layerMinValue;
        }
      }, 200);
}
