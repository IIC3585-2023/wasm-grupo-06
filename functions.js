let inputArrayElement = document.getElementById("inputArray");
let outputElement = document.getElementById("output");
let numWorkersElement = document.getElementById("numWorkers");

Module.onRuntimeInitialized = function () {
  console.log("WebAssembly module initialized");
};

function processInput() {
  let numWorkers = parseInt(numWorkersElement.value);
  let inputArray = inputArrayElement.value.split(",").map((x) => parseInt(x));
  let length = inputArray.length;
  let process_array = Module.cwrap("process_array", "number", [
    "number",
    "number",
    "number",
  ]);

  let inputPtr = Module._malloc(length * Int32Array.BYTES_PER_ELEMENT);
  Module.HEAP32.set(inputArray, inputPtr / Int32Array.BYTES_PER_ELEMENT);

  let outputPtr = process_array(length, numWorkers, inputPtr);
  let result = "";
  for (let i = 0; i < numWorkers; i++) {
    let currentArray = [];
    for (let j = 0; j < length; j++) {
      currentArray.push(
        Module.HEAP32[
          outputPtr / Int32Array.BYTES_PER_ELEMENT + (i * length + j)
        ]
      );
    }
    console.log(currentArray);
    time = calculateTotalTime(currentArray);
    currentArray = currentArray.filter((x) => x != 0);
    result += "Cluster " + i + ": [" + currentArray.join(", ") + "]<br>";
    result += "Total Time: " + time + "<br><br>";
  }

  outputElement.innerHTML = result;
  Module._free(inputPtr);
}
function calculateTotalTime(tasks) {
  let inputArray = inputArrayElement.value.split(",").map((x) => parseInt(x));
  let total = 0;
  for (let i = 0; i < inputArray.length; i++) {
    if (tasks[i] != 0) {
      total += inputArray[tasks[i] - 1];
    } else {
      break;
    }
  }
  return total;
}
function generateRandomArray() {
  let arraySize = parseInt(document.getElementById("arraySize").value);
  let inputArray = [];
  for (let i = 0; i < arraySize; i++) {
    inputArray.push(Math.floor(Math.random() * 100));
  }
  inputArrayElement.value = inputArray.join(",");
}

function algorithmInJS() {
  let M = parseInt(numWorkersElement.value);
  let inputArray = inputArrayElement.value.split(",").map((x) => parseInt(x));
  let N = inputArray.length;
  workers = [];
  for (let i = 0; i < M; i++) {
    workers.push({
      tasks: [],
      time: 0,
      tasks_count: 0,
    });
  }
  for (let i = 0; i < N; i++) {
    let min = 0;
    for (let j = 0; j < M; j++) {
      if (workers[j].time < workers[min].time) {
        min = j;
      }
    }
    workers[min].tasks.push(i + 1);
    workers[min].time += inputArray[i];
    workers[min].tasks_count++;
  }
  let result = "";
  for (let i = 0; i < M; i++) {
    result +=
      "Cluster " +
      i +
      ": [" +
      workers[i].tasks.join(", ") +
      "]<br>Total Time: " +
      workers[i].time +
      "<br><br>";
  }
  outputElement.innerHTML = result;
}
