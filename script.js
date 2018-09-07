const $ = require('jquery');
const Tone = require('tone');

const maxCutoff = 8000;

const filter = new Tone.Filter({
  type: 'lowpass',
  frequency: 0,
  rolloff: -24,
  Q: 1,
  gain: 0
});

const osc = new Tone.Oscillator({
  type: 'sawtooth',
  frequency : 220
});

osc.connect(filter);
filter.toMaster();

let running = false;
$('#toggle').click(() => {
  running = !running;
  if (running) {
    osc.start();
  } else {
    osc.stop();
  }
  const state = running ? 'playing' : 'stopped';
  $('#state').text(state);
});

function handleOrientation(event) {
  const cutoff = Math.floor(event.alpha / 360 * maxCutoff);
  filter.frequency.linearRampToValueAtTime(cutoff, 0);

  const text = Math.floor(event.alpha);
  $('#value').text(text);
}

window.addEventListener('deviceorientation', handleOrientation);

/* Slider */

var slider = document.getElementById("myRange");

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    const cutoff = Math.floor(this.value / 360 * maxCutoff);
    filter.frequency.linearRampToValueAtTime(cutoff, 0);

    const text = Math.floor(this.value);
    $('#value').text(text);
}
