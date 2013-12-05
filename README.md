impervious_cover_webapp
-----------------------
The following explains the contents of this repository. There's a lot of extraneous code that remains because version control was not used during development. Hopefully that will change soon.

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
      * secure
         * index.html
   * icons -- **[to be deleted]**
   * manual -- **[to be deleted]**
* map_tiles
   * [subdirectories with png images]

# Author
--------
James Yang, August-December 2013
jayang@seas.upenn.edu
james.yang92@gmail.com.

# Copyright
-----------
All code written here was drawn from public domain. Therefore, all code written here belongs to the public. Code was developed at the NASA Stennis Space Center.
