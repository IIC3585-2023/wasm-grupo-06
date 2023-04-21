// main.c
#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// int *process_array(int *input, int length) {
//   int *output = (int *)malloc(length * 4 * sizeof(int));
//   for (int i = 0; i < 4; i++) {
//     for (int j = 0; j < length; j++) {
//       output[i * length + j] = input[j] * (1 << i);
//     }
//   }
//   return output;
// }

typedef struct {
  int time;
  int *tasks;
  int task_count;
} Worker;

int compare(const void *a, const void *b) {
  Worker *workerA = (Worker *)a;
  Worker *workerB = (Worker *)b;
  return workerA->time - workerB->time;
}

EMSCRIPTEN_KEEPALIVE
int *process_array(int N, int M, int *Times) {
  Worker workersTasks[M];
  for (int i = 0; i < M; ++i) {
    workersTasks[i].time = 0;
    workersTasks[i].tasks = (int *)malloc(N * sizeof(int));
    workersTasks[i].task_count = 0;
  }

  for (int i = 0; i < N; ++i) {
    int min = 0;
    for (int j = 0; j < M; ++j) {
      if (workersTasks[j].time < workersTasks[min].time) {
        min = j;
      }
    }
    workersTasks[min].tasks[workersTasks[min].task_count++] = i;
    workersTasks[min].time += Times[i];
  }

  // Allocate 2D array to hold worker tasks
  int *workerTasks = (int *)malloc(M * N * sizeof(int *));
  for (int i = 0; i < M; ++i) {
    for (int j = 0; j < workersTasks[i].task_count; ++j) {
      workerTasks[i * N + j] = workersTasks[i].tasks[j] + 1;
    }
  }

  // Free allocated memory in Worker structs
  for (int i = 0; i < M; ++i) {
    free(workersTasks[i].tasks);
  }

  // Return array of arrays containing worker tasks
  return workerTasks;
}
