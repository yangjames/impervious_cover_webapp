#include <stdio.h>

int main(int argc, char* argv[]) {
  if (argc < 6) {
    printf("Error");
    return -1;
  }
  long zoom, tilex, tiley, pixelx, pixely;
  zoom = strtol(argv[1]);
  tilex = strtol(argv[2]);
  tiley = strtol(argv[3]);
  pixelx = strtol(argv[4]);
  pixely = strtol(argv[5]);

  int c = 5;
  printf("%d hello\n",c);
  printf("world");
  return 0;
}
