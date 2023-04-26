#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>


typedef struct {
  int time;
  int *tasks;
  int tasks_count;
} Cluster;

int cmpfunc(const void *a, const void *b) {
  return (*(int*)b - *(int*)a);
}

EMSCRIPTEN_KEEPALIVE
int *assign_tasks(int N, int M, int *Times) {
  qsort(Times, N, sizeof(int), cmpfunc);
  
  Cluster clusters[M];
  for (int i = 0; i < M; ++i) {
    clusters[i].time = 0;
    // clusters[i].tasks = (int *)malloc(N * sizeof(int));
    clusters[i].tasks = (int *)calloc(N, sizeof(int));
    clusters[i].tasks_count = 0;
  }

  int *clusterTasks = (int *)calloc(M * N, sizeof(int));

  for (int i = 0; i < N; i++) {
    int min = 0;
    for (int j = 0; j < M; j++) {
      if (clusters[j].time < clusters[min].time) {
        min = j;
      }
    }
    
    // clusters[min].tasks[clusters[min].tasks_count++] = Times[i];
    clusterTasks[min * N + clusters[min].tasks_count++] = Times[i];
    clusters[min].time += Times[i];
  }

  // Allocate 2D array to hold cluster tasks
  // int *clusterTasks = (int *)malloc(M * N * sizeof(int));
  
  // for (int i = 0; i < M; ++i) {
  //   for (int j = 0; j < clusters[i].tasks_count; ++j) {
  //     clusterTasks[i * N + j] = clusters[i].tasks[j];
  //   }
  // }

  // Free allocated memory in Cluster structs
  for (int i = 0; i < M; ++i) {
    free(clusters[i].tasks);
  }
  // Return array of arrays containing cluster tasks
  return clusterTasks;
}
