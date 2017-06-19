import * as workerTimers from 'worker-timers';

const waitForBuffer = new Promise(function (resolve, reject) {
    const offlineAudioContext = new OfflineAudioContext(1, 22050, 44100);
    const oscillatorNode = offlineAudioContext.createOscillator();

    oscillatorNode.connect(offlineAudioContext.destination);
    oscillatorNode.start();

    offlineAudioContext
        .startRendering()
        .then((audioBuffer) => resolve(audioBuffer))
        .catch((err) => reject(err));
});
const audioContext = new AudioContext();
const $playWindowTimersButton = document.getElementById('play-window-timers');
const $playWorkerTimersButton = document.getElementById('play-worker-timers');
const $stopButton = document.getElementById('stop');

let windowTimersIntervalId = null;
let workerTimersIntervalId = null;

function clearAnyInterval () {
    if (workerTimersIntervalId !== null) {
        workerTimers.clearInterval(workerTimersIntervalId);
    }

    if (windowTimersIntervalId) {
        clearInterval(windowTimersIntervalId);
    }
}

function scheduleAudioBufferSourceNode (audioBuffer, when) {
    const audioBufferSourceNode = audioContext.createBufferSource();

    audioBufferSourceNode.buffer = audioBuffer;
    audioBufferSourceNode.connect(audioContext.destination);

    let offset = 0;

    if (audioContext.currentTime > when) {
        offset = audioContext.currentTime - when;
        when = audioContext.currentTime;
    }

    audioBufferSourceNode.start(when, offset);

    return audioBufferSourceNode;
}

$playWindowTimersButton.addEventListener('click', function () {
    clearAnyInterval();

    waitForBuffer
        .then((audioBuffer) => {
            let currentTime = audioContext.currentTime + 0.05;

            scheduleAudioBufferSourceNode(audioBuffer, currentTime);

            currentTime += 0.5;

            scheduleAudioBufferSourceNode(audioBuffer, currentTime);

            windowTimersIntervalId = setInterval(function () {
                currentTime += 0.5;

                scheduleAudioBufferSourceNode(audioBuffer, currentTime);
            }, 500);
        });
});

$playWorkerTimersButton.addEventListener('click', function () {
    clearAnyInterval();

    waitForBuffer
        .then((audioBuffer) => {
            let currentTime = audioContext.currentTime + 0.05;

            scheduleAudioBufferSourceNode(audioBuffer, currentTime);

            currentTime += 0.5;

            scheduleAudioBufferSourceNode(audioBuffer, currentTime);

            workerTimersIntervalId = workerTimers.setInterval(function () {
                currentTime += 0.5;

                scheduleAudioBufferSourceNode(audioBuffer, currentTime);
            }, 500);
        });
});

$stopButton.addEventListener('click', function () {
    clearAnyInterval();
});
