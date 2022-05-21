function visualizeAudio(url) {
  fetch(url)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => visualize(audioBuffer));
}

function filterData(audioBuffer) {
  const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  const samples = (audioBuffer.length / audioBuffer.sampleRate) * 1000; // Number of samples we want to have in our final data set
  const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
  const filteredData = [];
  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i; // the location of the first sample in the block
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
    }
    filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
  }
  return filteredData;
}

function visualize(audioBuffer) {
  const displayedData = (audioBuffer.length / audioBuffer.sampleRate) * 1000
  const filteredData = filterData(audioBuffer);
  const body = document.querySelector('body');
  let times = [];
  const firstNum = 20;
  const secondNum = 20;
  for (let i = 0; i < displayedData; i++) {
    let firstmax = -Infinity;
    let nextmin = Infinity;
    for (let j = 0; j < firstNum; j++) {
      firstmax = Math.max(firstmax, filteredData[i + j]);
    }
    for (let j = firstNum; j < firstNum + secondNum; j++) {
      nextmin = Math.min(nextmin, filteredData[i + j]);
    }
    let first100Sum = 0;
    let middle10Sum = 0;
    let inverse90Max = -Infinity;
    let middle10Max = -Infinity;
    if (i > 50) {
      for (let j = 0; j < 100; j++) {
        if (j > 44 && j < 55) {
          middle10Sum += filteredData[i + j - 50];
          middle10Max = Math.max(middle10Max, filteredData[i + j - 50])
        } else {
          first100Sum += filteredData[i + j - 50];
          inverse90Max = Math.max(inverse90Max, filteredData[i + j - 50])
        }
      }
    }
    let inverse90SumAvg = (first100Sum - middle10Sum) / 9;
    if (firstmax > 0.05 && firstmax < 1.5 * nextmin) {
      times.push(i+20)
      console.log(i + 20);
      i += 100;
    } else if ((middle10Max > 0.05) && (middle10Sum > 1.2 * inverse90SumAvg) && (middle10Max > inverse90Max)) {
      console.log(i)
      times.push(i - 5)
      i += 40
    }
  }
  for (let i = 0; i < times.length; i++) {
    let para = document.createElement("pre");
    para.textContent = `- StartTime: ${times[i]}
  Bpm: 727`
    body.appendChild(para)
  }
}

//visualizeAudio("test.mp3") 
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
visualizeAudio("audio.mp3");