let inputArrayElement = document.getElementById("inputArray");
let outputElement = document.getElementById("assignations");
let jsOutputElement = document.getElementById("js-output");
let cOutputElement = document.getElementById("c-output");
let numClustersElement = document.getElementById("numClusters");

function generateRandomArray() {
  let arraySize = parseInt(document.getElementById("arraySize").value);
  let inputArray = [];
  for (let i = 0; i < arraySize; i++) {
    inputArray.push(Math.floor(Math.random() * 1000));
  }
  inputArrayElement.value = inputArray.join(",");
}

Module.onRuntimeInitialized = function () {
  console.log("WebAssembly module initialized");
};

function algorithmInC() {
  let M = parseInt(numClustersElement.value);
  let inputArray = inputArrayElement.value.split(",").map((x) => parseInt(x));
  let N = inputArray.length;

  const begin = performance.now();
  inputArray.sort((a, b) => b - a);
  let inputPtr = Module._malloc(N * Int32Array.BYTES_PER_ELEMENT);
  Module.HEAP32.set(inputArray, inputPtr / Int32Array.BYTES_PER_ELEMENT);

  let outputPtr = Module.ccall("assign_tasks",
    'number',
    ['number', 'number', 'number'],
    [N, M, inputPtr]
  );
  const finish = performance.now();

  let result = "";
  for (let i = 0; i < M; i++) {
    let currentArray = [];
    for (let j = 0; j < N; j++) {
      currentArray.push(
        Module.HEAP32[
          outputPtr / Int32Array.BYTES_PER_ELEMENT + (i * N + j)
        ]
      );
    }
    time = currentArray.reduce((acc, curr) => acc + curr, 0);
    currentArray = currentArray.filter((x) => x != 0);
    result += "Cluster " + i + ": [" + currentArray.join(", ") + "]<br>";
    result += "Total Time: " + time + "<br><br>";
  }
  outputElement.innerHTML = result;

  Module._free(inputPtr);
  Module._free(outputPtr);
  
  return finish - begin;
}

function algorithmInJS() {
  let M = parseInt(numClustersElement.value);
  let inputArray = inputArrayElement.value.split(",").map((x) => parseInt(x));
  let N = inputArray.length;
  
  const begin = performance.now();
  clusters = [];
  inputArray.sort((a, b) => b - a);
  for (let i = 0; i < M; i++) {
    clusters.push({
      tasks: [],
      time: 0,
      tasks_count: 0,
    });
  }
  for (let i = 0; i < N; i++) {
    let min = 0;
    for (let j = 0; j < M; j++) {
      if (clusters[j].time < clusters[min].time) {
        min = j;
      }
    }
    clusters[min].tasks.push(inputArray[i]);
    clusters[min].time += inputArray[i];
    clusters[min].tasks_count++;
  }
  const finish = performance.now();

  let result = "";
  for (let i = 0; i < M; i++) {
    result +=
      "Cluster " +
      i +
      ": [" +
      clusters[i].tasks.join(", ") +
      "]<br>Total Time: " +
      clusters[i].time +
      "<br><br>";
  }
  outputElement.innerHTML = result;

  return finish - begin;
}

function runCAlgorithm() {
  const timeTaken = algorithmInC();
  console.log(`C took ${timeTaken} milliseconds.`);
  cOutputElement.innerHTML = `C: ${timeTaken} milliseconds.`;
}

function runJSAlgorithm() {
  const timeTaken = algorithmInJS();
  console.log(`JS took ${timeTaken} milliseconds.`);
  jsOutputElement.innerHTML = `JS: ${timeTaken} milliseconds.`;
}
