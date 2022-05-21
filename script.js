function visualizeAudio(url) {
  fetch(url)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => visualize(audioBuffer));
}

function filterData(audioBuffer) {
  const rawData = audioBuffer.getChannelData(0);
  const samples = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
  const blockSize = Math.floor(rawData.length / samples);
  const filteredData = [];
  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j])
    }
    filteredData.push(sum / blockSize);
  }
  return filteredData;
}

function visualize(audioBuffer) {
  const displayedData = 10000
  const canvasHeight = 200;
  const canvasWidth = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
  const filteredData = filterData(audioBuffer);
  const body = document.querySelector('body');
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.border = "1px solid #000000";
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < displayedData; i++) {
    const dataPoint = filteredData[i];
    const xCord = canvasWidth * (i / filteredData.length);
    ctx.moveTo(xCord, 0);
    ctx.lineTo(xCord, canvasHeight * dataPoint);
    ctx.stroke();
  }
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
  for (let i = 0; i < displayedData; i++) {
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
    if (firstmax < nextmin && nextSum > firstSum - 0.15 * firstNum ) {
      const xCord = canvasWidth * (i / filteredData.length) + firstNum;
      ctx.moveTo(xCord, canvasHeight);
      ctx.lineTo(xCord, 0);
      ctx.stroke();    
      ctx.font = "30px Arial";
      ctx.fillText((i + firstNum) + "ms", xCord, canvasHeight);
      console.log(i + firstNum);
      i += firstNum + secondNum;
    }
  }
  body.appendChild(canvas);
}

  
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
visualizeAudio("test.mp3") 
//visualizeAudio("audio.mp3");