#!/usr/bin/python

import os, sys, cgi, json, Image, re

fs = cgi.FieldStorage()

sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n")
sys.stdout.write("\n")

year = fs.getvalue('year');
month = re.sub(r"\b0{2}","",fs.getvalue('month'));
day = fs.getvalue('day');
zoom = fs.getvalue('zoom');
tilex = fs.getvalue('tilex');
tiley = fs.getvalue('tiley');
pixelx = fs.getvalue('pixelx');
pixely = fs.getvalue('pixely');

path = "../html/impervious_cover/assets/map_tiles/";
path += year + '/';
#path += month + '/';
#path += day + '/';
path += zoom + '/';
path += tilex + '/';
path += tiley + '.png';

col=int(pixelx);
row=int(pixely);

result = {};
#result['success'] = True
#result['message'] = "Completed";
result['percentage']=-1;
#result['path']=path;
#result['pixelx']=col;
#result['pixely']=row;
"""
path = "../html/impervious_cover/assets/map_tiles/2008/11/522/1207.png";
pixel = {};
pixel['x']=157;
pixel['y']=136;
"""

try:
    im = Image.open(path).convert('LA');
    pix = im.load();
    result['percentage']=pix[row,col][0]*100/255;
except:
    result['percentage']=-1;

sys.stdout.write(json.dumps(result))
sys.stdout.write("\n")
sys.stdout.close()
#print result['percentage'];
