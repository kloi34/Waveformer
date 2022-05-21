window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let currentBuffer = null;
function visualizeAudio(url) {
  fetch(url)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => visualize(audioBuffer));
}

function filterData(audioBuffer) {
  // const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  // const samples = 5000; // Number of samples we want to have in our final data set
  // const blockSize = Math.floor(rawData.length / samples); // Number of samples in each subdivision
  // const filteredData = [];
  // for (let i = 0; i < samples; i++) {
  //   filteredData.push(rawData[i * blockSize]); 
  // }
  // return filteredData;
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
  const displayedData = 10000
  const canvasHeight = 200;
  //const canvasWidth = 420;
  const canvasWidth = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
  //const canvasWidth = 20000;
  const filteredData = filterData(audioBuffer);
  const body = document.querySelector('body');
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.border = "1px solid #000000";
  const ctx = canvas.getContext("2d");
  // const lineThickness = 6
  // ctx.lineWidth = lineThickness;
  //for (let i = 0; i < filteredData.length; i++) {
    for (let i = 0; i < displayedData; i++) {
    const dataPoint = filteredData[i];
    const xCord = canvasWidth * (i / filteredData.length);
    // ctx.moveTo(xCord, canvasHeight / 2);
    // ctx.lineTo(xCord, canvasHeight / 2 * (1 + dataPoint));
    ctx.moveTo(xCord, 0);
    ctx.lineTo(xCord, canvasHeight * dataPoint);
    ctx.stroke();
    // console.log(29 * xCord / canvasWidth)
  }

  const durationInSeconds = audioBuffer.length / audioBuffer.sampleRate;
  // for (let i = 0; i < durationInSeconds; i++) { 
  //   const xCord = canvasWidth * i / durationInSeconds;
  //   ctx.moveTo(xCord, canvasHeight);
  //   ctx.lineTo(xCord, 0);
  //   //ctx.strokeStyle = "#0000ff";
  //   ctx.stroke();    
  //   ctx.font = "30px Arial";
  //   ctx.fillText(i + "s", xCord, canvasHeight);
  // }
  // If the 20 first points's maximum is less than the next 20 points minimum, draw a line
  const firstNum = 20;
  const secondNum = 20;
  for (let i = 0; i < displayedData; i++) {
    let firstmax = -Infinity;
    let nextmin = Infinity;
    for (let j = 0; j < firstNum; j++) {
      firstmax = Math.max(firstmax, filteredData[i + j]);
    }
    // for (let j = firstNum; j < firstNum + secondNum; j++) {
    //   nextmin = Math.min(nextmin, filteredData[i + j]);
    // }
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
    if (firstmax < 1.5 * nextmin) {
      const xCord = canvasWidth * (i / filteredData.length) + 20;
      ctx.moveTo(xCord, canvasHeight);
      ctx.lineTo(xCord, 0);
      ctx.stroke();    
      ctx.font = "30px Arial";
      ctx.fillText((i + 20) + "ms", xCord, canvasHeight);
      console.log(i + 20);
      i += 100;
    } else if (middle10Sum > 1.2 * inverse90SumAvg && middle10Max > inverse90Max) {
      const xCord = canvasWidth * (i / filteredData.length);
      ctx.moveTo(xCord, canvasHeight);
      ctx.lineTo(xCord, 0);
      ctx.stroke();    
      ctx.font = "30px Arial";
      ctx.fillText((i) + "ms", xCord, canvasHeight);
      //console.log("Case 2: " + i + "ms, " + inverse90Max + " inverse90Max, " + middle10Max + " middle10Max");
      i += 40
    }
  }
  body.appendChild(canvas);
}

visualizeAudio("test.mp3") 
//visualizeAudio("audio.mp3");