impervious_cover_webapp
-----------------------
The following explains the contents of this repository. There's a lot of extraneous code that remains because version control was not used during development. This repository is meant to change that.

# Directory Tree
----------------
impervious_cover_webapp -- [TOP]

* .gitignore
* README.md
* convert.sh
* www
   * cgi-bin
      * account_delete.php
      * checkSession2.php
      * getICInfo.py
      * login2.php
      * logout2.php
      * register2.php
      * save_subscriptions2.php
      * send_email2.php
      * original -- **[deprecated version]**
      * secure -- **[to be deleted]**
      * tests
         * Makefile
         * getICInfo.php
         * getICPercent.cpp
         * mapredirect.php
         * sendNotification.php
         * sendNotification.py
         * send_message.py
         * send_message.pyc
         * test.c
   * error -- **[to be deleted]**
   * html
      * index.html
      * impervious_cover -- **[deprecated version]**
      * impervious_cover2
         * assets
            * gui_images
               * [images for webapp page backdrops]
            * map_tiles
               * [subdirectories with png images]
            * watersheds -- [unnecessary directory]
         * css
            * app.css
            * login.css
            * main.css
            * mapapp.css
            * register.css
            * tempmap.css
         * html
            * app.html
            * login.html
            * manage_account.html
            * mapapp.html
            * register.html
         * src
            * apiKeys.js
            * ContextMenu.js
            * app.js
            * custom_map_tooltip.js
            * gmap3.js
            * infobox.js
            * jquery-2.0.2.js
            * mapapp.js
            * mapapp2.js
            * register.js
            * submitlogin.js
            * jquery-ui-1.10.3.custom
              * [accordion menu javascript plugin]
      * secure -- **[to be deleted]**
   * icons -- **[to be deleted]**
   * manual -- **[to be deleted]**
* map_tiles
   * [subdirectories with png images]

Client side content is all in `impervious_cover_webapp/www/impervious_cover2`. Server side content is all in `impervious_cover_webapp/www/cgi-bin`.

# Getting Started
-----------------
All files discussed in this document refer to files in the path <impervious_cover_webapp/www/impervious_cover2>.

### System Requirements
* GDAL/OGR Python Package
* Apache2 Web Server, CGI-enabled
* PHP5 Server
* MySQL Server
* Python Runtime Environment
* GDAL friendly operating system

MacOS X and Windows have large amounts of support. Linux was the preferred operating system for this project. Debian distros such as Ubuntu 12+ have been proven to run GDAL tools very well. These tests were done on a separate but related project. Development was done on CentOS 6.4, but our setup with CentOS was not GDAL friendly. It is our recommendation that Red Hat Linux distributions be avoided until better support is more readily available.

Until automation is completed, we do not yet know the minimum hardware requirements. 

### Main Portal
The app starts at `html/app.html`. This is the main portal for the app and only contains links to the login page, account registration page, and main application. Styling can be found in `css/app.css`. This page has functional Javascript code embedded in the html document.

### Login Page
The login page can be found in `html/login.html`. This is a portal through which users can login to previously registered profiles. The page uses a jQuery 2.0.2 plugin, found in `src/jquery-2.0.2.js`. Styling can be found in `css/login.css`.

This page first loads `src/apiKeys.js`. This script contains the domain name variable of the remote server that hosts all resources, including the MySQL database containing. Should the host domain name or IP address change, one need only change this variable to maintain functionality of the rest of the app.

Upon loading the domain name variable, `src/submitlogin.js` is loaded. The script loads event loops for all inputs on the page and also checks if the particular computer has a running session. If it does, the page redirects to `html/mapapp.html`. Otherwise, it waits for user login info submission. Checking session data and submitting login data are done through ajax 'get' and 'post' queries respectively

All ajax queries in the login page invoke PHP scripts located in `../../../cgi-bin`. The MySQL database is accessed using the `mysqli` modules built into PHP5.

### Account Registration page
The account registration page can be found in `html/register.html`. This is a portal through which users can create an account with the web app host server by registering an email address. The page also uses jQuery 2.0.2, and styling can be found in `css/register.css`. The page uses similar scripts to the login page. The page first loads `src/apiKeys.js` for the server domain name variable and then loads `src/register.js`, a script that contains all the ajax queries involved in communicating with the MySQL database.

### Main Application
The main application page is `html/mapapp.html`. This page is styled with `css/mapapp.css`, and sources the following Javascript files:

1. src/jquery-2.0.2.js
2. src/jquery-ui-1.10.3.custom/jquery-ui.1.10.3.custom/js/jquery-ui-1.10.3.custom.js
3. The [Google Maps engine](http://maps.google.com/maps/api/js?sensor=false&libraries=drawing)
4. src/apiKeys.js
5. src/ContextMenu.js
6. src/mapapp2.js

Script 1 is the same jQuery plugin used in the login and registration pages. Scripts 2 and 5 are purely for styling and enhanced interactivity. The primary scripts that provide actual functionality are 3, 4, and 6. For more details on the styling scripts, visit the site for the [jQuery user interface accordion plugin](http://jqueryui.com/accordion/) and the site for creating [context menus for Google Maps](http://googlemapsmania.blogspot.com/2012/04/create-google-maps-context-menu.html). The source code for the context menu API can be found [here](http://code.martinpearman.co.uk/googlemapsapi/contextmenu/1.0/).

###### 

# Author
--------
James Yang

University of Pennsylvania

NASA Stennis Space Center

#### Contact
james.yang92@gmail.com

# Copyright
-----------
All files contained in this repository are property of the NASA Stennis Space Center.
