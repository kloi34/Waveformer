function visualizeAudio(url) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  fetch(url)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => visualize(audioBuffer));
}

function visualizeAudio2(file) {
  visualizeAudio(URL.createObjectURL(file));
}

function filterData(audioBuffer) {
  const rawData = audioBuffer.getChannelData(0);
  const samples = Math.floor(1000 * audioBuffer.duration);
  const blockSize = Math.floor(rawData.length / samples);
  //console.log(rawData, samples, blockSize);
  const filteredData = [];
  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]);
    }
    filteredData.push(sum / blockSize);
  }
  let remainingOffset = 1000 * (rawData.length - (samples * blockSize)) / audioBuffer.sampleRate;
  console.log(remainingOffset);
  return {filteredData, remainingOffset};
}

function visualize(audioBuffer) {
  // const displayedData = 1000;
  // const canvasHeight = 200;
  // const canvasWidth = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
  const {filteredData, remainingOffset} = filterData(audioBuffer);
  //const displayedData = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
  const displayedData = filteredData.length;
  const div = document.getElementById('timing');
  div.innerHTML = '';
  // const canvas = document.createElement('canvas');
  // canvas.width = canvasWidth;
  // canvas.height = canvasHeight;
  // canvas.style.border = "1px solid #000000";
  // const ctx = canvas.getContext("2d");
  // for (let i = 0; i < displayedData; i++) {
  //   const dataPoint = filteredData[i];
  //   const xCord = canvasWidth * (i / filteredData.length);
  //   ctx.moveTo(xCord, 0);
  //   ctx.lineTo(xCord, canvasHeight * dataPoint);
  //   ctx.stroke();
  // }
  // const durationInSeconds = audioBuffer.length / audioBuffer.sampleRate;
  // for (let i = 0; i < durationInSeconds; i++) { 
  //   const xCord = canvasWidth * i / durationInSeconds;
  //   ctx.moveTo(xCord, canvasHeight);
  //   ctx.lineTo(xCord, 0);
  //   //ctx.strokeStyle = "#0000ff";
  //   ctx.stroke();    
  //   ctx.font = "30px Arial";
  //   ctx.fillText(i + "s", xCord, canvasHeight);
  // }
  const firstNum = 15;
  const secondNum = 15;
  let times = [];
  for (let i = 0; i < displayedData - firstNum - secondNum; i++) {
    let firstmax = -Infinity;
    let firstSum = 0;
    let nextmin = Infinity;
    let nextmax = -Infinity;
    let nextSum = 0;
    for (let j = 0; j < firstNum; j++) {
      firstmax = Math.max(firstmax, filteredData[i + j]);
      firstSum += filteredData[i + j]
    }
    for (let j = firstNum; j < firstNum + secondNum; j++) {
      nextmax =  Math.max(nextmax, filteredData[i + j]);
      nextSum += filteredData[i + j]
    }
    for (let j = firstNum; j < firstNum + secondNum; j++) {
      if (nextmin + 0.1 > nextmax) {
        nextmin = Math.min(nextmin, filteredData[i + j]);
      }
    }
    if ((firstmax < nextmin) && (nextSum > firstSum - 0.15 * firstNum) && (filteredData[i + firstNum] > filteredData[i + firstNum - 1])) {
      // const xCord = canvasWidth * (i / filteredData.length) + firstNum;
      // ctx.moveTo(xCord, canvasHeight);
      // ctx.lineTo(xCord, 0);
      // ctx.stroke();    
      // ctx.font = "30px Arial";
      // ctx.fillText((i + firstNum) + "ms", xCord, canvasHeight);
      
      let correctingCoeff = Math.floor(remainingOffset * i / (displayedData - firstNum - secondNum))
      times.push(i + firstNum - correctingCoeff);
      i += firstNum + secondNum;
    }
  }
  // body.appendChild(canvas);

  for (let i = 0; i < times.length; i++) {
    let para = document.createElement("pre");
    para.style.margin = 0;
    para.textContent = `- StartTime: ${times[i]}
  Bpm: 0.05000000074505806`;
    div.appendChild(para);
  }
}

//visualizeAudio("test.mp3") ;
//visualizeAudio("audio3.mp3");