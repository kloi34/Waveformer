function visualizeAudio(url) {
  fetch(url)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => visualize(audioBuffer));
}

function filterData(audioBuffer) {
  const rawData = audioBuffer.getChannelData(0);
  const samples = Math.floor(1000 * audioBuffer.duration)
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
  console.log(audioBuffer.duration*1000);
  // const displayedData = 1000;
  // const canvasHeight = 200;
  // const canvasWidth = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
  const filteredData = filterData(audioBuffer);
  console.log(filteredData.length)
  //const displayedData = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
  const displayedData = filteredData.length;
  const body = document.querySelector('body');
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
  let dummy = [];
  let count = 0;
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
      
      // correcting
       //227134 -- > 518
      //29000 -- > 60
      //let correctingCoeff = Math.floor(491 * i / (displayedData - firstNum - secondNum))
      let correctingCoeff = Math.floor((0.002275 * filteredData.length) * i / (displayedData - firstNum - secondNum))
      //227134 -- > 518
      //29000 -- > 60
      //216196 -- > 491
     times.push(i + firstNum - correctingCoeff)
     //times.push(i + firstNum)
      i += firstNum + secondNum;
    }
    dummy.push(0)
    count++
  }
  console.log(dummy.length, count, firstNum)
  // body.appendChild(canvas);

  for (let i = 0; i < times.length; i++) {
    let para = document.createElement("pre");
    para.textContent = `- StartTime: ${times[i]}
  Bpm: 0.05000000074505806`;
    body.appendChild(para);
  }
}

  
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
//visualizeAudio("test.mp3") ;
visualizeAudio("audio2.mp3");