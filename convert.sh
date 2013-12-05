#!/bin/bash

# this shell script converts the erdas imagine impervious cover
# products (.img format) into GEOTIFF format, merges the resulting
# images, and creates map tiles out of them (for google maps
# image overlay).
#
# IMG_DIR = source directory of impervious cover product
# TIFF_OUT_DIR = output directory of all the geotiffs
# MAP_TILE_OUT_DIR = output directory for map tiles

IMG_DIR=./ErdasImagineFormat/HUC12IMCProducts
TIFF_OUT_DIR=./geotiffs
MAP_TILE_OUT_DIR=./map_tiles

if [ -d "$IMG_DIR" ]; then
    if [ ! -d "$TIFF_OUT_DIR" ]; then
	mkdir $TIFF_OUT_DIR
    fi
    
    if [ ! -d "$MAP_TILE_OUT_DIR" ]; then
	mkdir $MAP_TILE_OUT_DIR
    fi
    
    year_list=`ls $IMG_DIR | awk -F "\t" '{print $1}'`

    if [ -n "$year_list" ]; then
	for word in $year_list
	do
	    directory=$word
	    FILES=`ls $IMG_DIR/$word | grep ".img"`
	    for word in $FILES
	    do
		FILE_NAME="${word%.*}"
		echo $IMG_DIR/$directory/$word
		if [ ! -d "$TIFF_OUT_DIR/$directory" ]; then
		    mkdir $TIFF_OUT_DIR/$directory
		fi
		echo "converting $IMG_DIR/$directory/$word"
		gdal_translate -of gtiff -expand rgba $IMG_DIR/$directory/$word $TIFF_OUT_DIR/$directory/$FILE_NAME.tif
	    done
	done
    fi

    MERGED_TIFF_DIR=$TIFF_OUT_DIR/merged
    
    if [ ! -d "$MERGED_TIFF_DIR" ]; then
	mkdir $MERGED_TIFF_DIR
    fi
    for word in $year_list
    do
	directory=$word
	echo "merging $TIFF_OUT_DIR/$directory TIFFs"
	gdal_merge.py -n "0" $TIFF_OUT_DIR/$directory/*.tif -o $MERGED_TIFF_DIR/$directory.tif
	if [ ! -d "$MAP_TILE_OUT_DIR/$directory" ]; then
	    mkdir $MAP_TILE_OUT_DIR/$directory
	fi
	gdal2tiles.py -z 9-13 -n $MERGED_TIFF_DIR/$directory.tif $MAP_TILE_OUT_DIR/$directory
    done
else
    echo "$IMG_DIR is not a valid directory!"
    exit 1
fi

exit 0