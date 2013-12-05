#include <iostream>
//#include <cv.h>
#include <cxcore.h>
#include <highgui.h>
#include <string.h>
#include <math.h>
#include <stdio.h>

using namespace std;
using namespace cv;

int main(int argc, char **argv) {
  if (argc != 9) {
    printf("Usage: getICPercent <year> <month> <day> <zoom> <tilex> <tiley> <pixelx> <pixely>\n");
    return -1;
  }

  int row = atoi(argv[8]);
  int col = atoi(argv[7]);
  string path = "../html/impervious_cover/assets/map_tiles/";
  path.append(argv[1]);
  path.append("/");
  path.append(argv[4]);
  path.append("/");
  path.append(argv[5]);
  path.append("/");
  path.append(argv[6]);
  path.append(".png");

  Mat image = imread(path,0);
  printf("lol %d", 5);
  int val = floor((float)(image.at<uint8_t>(row,col))*100/255);

  //printf("%d",floor((float)(image.at<uint8_t>(row,col))/255)*100);
  return 0;
}
