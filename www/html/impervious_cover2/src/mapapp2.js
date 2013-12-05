//**************************
// LAUNCH INITIALIZER ******
//**************************

$(document).ready(function() {
	google.maps.event.addDomListener(window, 'load', initialize);
    });

//**************************
// GLOBAL VARIABLES ********
//**************************

var map; // main map
var drawingManager; // drawing tool
var selectedShape; // drawn shape
var geocoder; // geocoder for turning addresses into coordinates
var TILE_SIZE = 256; // map and overlay tile size

var hucLayer; // huc zone overlay
var icLayer; // impervious cover overlay

var name="Guest"; // user name
var subscriptions; // user subscriptions

var rectangle;
//**************************
// API LOADER **************
//**************************

function initialize() {
    rectangle = new google.maps.Rectangle();
    var mapOptions = {
	center: new google.maps.LatLng(25,-90),
	zoom: 6,
	mapTypeId: google.maps.MapTypeId.HYBRID
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    
    // initialize geocoder
    geocoder = new google.maps.Geocoder();
    
    // initialize huc zone boundary layer
    hucLayer=new google.maps.FusionTablesLayer();
    
    //initialize impervious cover image overlay layer
    var icOptions = {
	getTileUrl: function(coord,zoom) {
	    // get tile coordinates to access proper tiles
	    var normalizedCoord = getNormalizedCoord(coord,zoom);
	    if (!normalizedCoord)
		return null;
	    
	    // get selection criteria
	    var date=$('#date-picker').val().split('-');
	    var year = date[0];
	    var month = date[1];
	    var day = date[2];
	    var bound = Math.pow(2,zoom);
	    
	    // create path string of tiles
	    var imgpath = "../assets/map_tiles/"+year+"/"+zoom+"/"+normalizedCoord.x+"/"+(bound-normalizedCoord.y-1)+".png";
	    
	    // return path string
	    return imgpath;
	},
	tileSize: new google.maps.Size(TILE_SIZE,TILE_SIZE),
	opacity: 0.6,
	name: "IC"
    };
    // create impervious cover overlay image layer object
    icLayer = new google.maps.ImageMapType(icOptions);
    
    // create info window object
    var coordInfoWindow = new google.maps.InfoWindow();
    
    // populate huc zone state drop down menu
    var statestring='<option value="null" selected="selected">Select State</option>';
    for (var i=0; i<hucStates.length; i++) {
	statestring+=('<option value="' + hucStates[i] + '">' + hucStates[i] + "</option>");
    }
    $('#state-select').html(statestring);
    
    // handle login info
    loggedIn();
    
    // drawing manager
    var polyOptions = {
	strokeWeight: 1,
	strokeColor: '#fff',
	fillColor: '#eee',
	fillOpacity: 0.1,
	editable: true,
	clickable: false
    };
    
    drawingManager = new google.maps.drawing.DrawingManager({
	    drawingControlOptions: {drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]},
	    polylineOptions: {editable: true},
	    markerOptions: {
		draggable: true,
		icon: 'http://inotesapp.com/images/white_dot.png'
	    },
	    polylineOptions: {editable: true},
	    rectangleOptions: polyOptions,
	    map: map,
	    drawingControl: false
	});
    
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
	    if (e.type != google.maps.drawing.OverlayType.MARKER) {
		drawingManager.setDrawingMode(null);
		drawingManager.setOptions({drawingControl: false});
		var newShape = e.overlay;
		newShape.type = e.type;
		google.maps.event.addListener(newShape,'click',function() {
			setSelection(newShape);
		    });
		setSelection(newShape);
	    }
	});
    
    // directions and navigation services
    var directionsRendererOptions={};
    directionsRendererOptions.draggable=false;
    directionsRendererOptions.hideRouteList=true;
    directionsRendererOptions.suppressMarkers=false;
    directionsRendererOptions.preserveViewport=false;
    var directionsRenderer=new google.maps.DirectionsRenderer(directionsRendererOptions);
    var directionsService=new google.maps.DirectionsService();
    
    //create markers to show directions origin and destination
    //both are not visible by default
    var markerOptions={};
    markerOptions.icon='http://www.google.com/intl/en_ALL/mapfiles/markerA.png';
    markerOptions.map=null;
    markerOptions.position=new google.maps.LatLng(0, 0);
    markerOptions.title='Directions origin';
    
    var originMarker=new google.maps.Marker(markerOptions);
    
    markerOptions.icon='http://www.google.com/intl/en_ALL/mapfiles/markerB.png';
    markerOptions.title='Directions destination';
    var destinationMarker=new google.maps.Marker(markerOptions);
    
    // initialize context menu items and stying options
        
    var contextMenuOptions={};
    contextMenuOptions.classNames={menu:'context_menu', menuSeparator:'context_menu_separator'};
    
    //create an array of ContextMenuItem objects
    //an 'id' is defined for each of the four directions related items
    var menuItems=[];
    menuItems.push({className:'context_menu_item', eventName:'select_region_click', id:'regionSelectItem', label:'Select Region'});
    menuItems.push({className:'context_menu_item', eventName:'view_point_data_click',id:'viewPointDataItem', label:'View Data at This Point'});
    menuItems.push({className:'context_menu_item', eventName: 'select_region_cancel', id:'regionCancelItem', label:'Cancel Select'});
    menuItems.push({className:'context_menu_item', eventName: 'view_region_data_click', id:'viewDataItem', label:'View Data of Selected Region'});
    menuItems.push({className:'context_menu_item', eventName: 'subscribe_region_click',id:'regionSaveItem', label:'Save Selected Region'});
    menuItems.push({});
    menuItems.push({className:'context_menu_item', eventName:'directions_origin_click', id:'directionsOriginItem', label:'Directions From Here'});
    menuItems.push({className:'context_menu_item', eventName:'directions_destination_click', id:'directionsDestinationItem', label:'Directions To Here'});
    menuItems.push({className:'context_menu_item', eventName:'clear_directions_click', id:'clearDirectionsItem', label:'Clear Directions'});
    menuItems.push({className:'context_menu_item', eventName:'get_directions_click', id:'getDirectionsItem', label:'Get Directions'});
    
    //a menuItem with no properties will be rendered as a separator
    menuItems.push({});
    menuItems.push({className:'context_menu_item', eventName:'zoom_in_click', label:'Zoom In'});
    menuItems.push({className:'context_menu_item', eventName:'zoom_out_click', label:'Zoom Out'});
    menuItems.push({});
    menuItems.push({className:'context_menu_item', eventName:'center_map_click', label:'Center Map Here'});
    contextMenuOptions.menuItems=menuItems;
    
    // initialize context menu
    var contextMenu=new ContextMenu(map, contextMenuOptions);
    
    google.maps.event.addListener(map, 'rightclick', function(mouseEvent){
	    contextMenu.show(mouseEvent.latLng);
	});
    
    
    //listen for the ContextMenu 'menu_item_selected' event
    google.maps.event.addListener(contextMenu, 'menu_item_selected', function(latLng, eventName){
	    switch(eventName){
	    case 'select_region_click':
		if (selectedShape == null) {
		    drawingManager.setOptions({
			    drawingControl:true
				});
		    
		    $('#regionCancelItem').show();
		    $('#viewDataItem').show();
		    $('#regionSaveItem').show();
		    $('#regionSelectItem').hide();
		    $('#viewPointDataItem').hide();
		}
		else if(selectedShape.getMap() == null) {
		    drawingManager.setOptions({
			    drawingControl:true
				});
		    
		    $('#regionCancelItem').show();
		    $('#viewDataItem').show();
		    $('#regionSaveItem').show();
		    $('#regionSelectItem').hide();
		}
		break;
	    case 'view_point_data_click':
		// generate info window content
		coordInfoWindow.setContent(createInfoWindowContent(latLng));
		// place info window on map
		coordInfoWindow.setPosition(latLng);
		// display info window
		coordInfoWindow.open(map);
		break;
	    case 'select_region_cancel':
		deleteSelectedShape();
		drawingManager.setOptions({
			drawingControl:false
			    });
		$('#regionCancelItem').hide();
		$('#viewDataItem').hide();
		$('#regionSaveItem').hide();
		$('#regionSelectItem').show();
		$('#viewPointDataItem').show();
		break;
	    case 'view_region_data_click':
		if (selectedShape != null) {
		    if (selectedShape.getMap() != null){
			var bounds = selectedShape.getBounds();
			var NW = bounds.getNorthEast();
			var center = selectedShape.getBounds().getCenter();
			coordInfoWindow.setContent(createInfoWindowContent(center));
			coordInfoWindow.setPosition(center);
			coordInfoWindow.open(map);
		    }
		    else
			alert("You must select a region first!");
		}
		else
		    alert("You must select a region first!");
		break;
	    case 'subscribe_region_click':
		if (name!='Guest') {
		    $('#region-edit').dialog("open");
		}
		else {
		    alert("You must be signed in to use this feature!");
		    deleteSelectedShape();
		    drawingManager.setOptions({
			    drawingControl:false
				});
		    $('#regionCancelItem').hide();
		    $('#viewDataItem').hide();
		    $('#regionSaveItem').hide();
		    $('#regionSelectItem').show();
		    $('#viewPointDataItem').show();
		}
		break;
	    case 'directions_origin_click':
		originMarker.setPosition(latLng);
		if(!originMarker.getMap()){
		    originMarker.setMap(map);
		}
		break;
	    case 'directions_destination_click':
		destinationMarker.setPosition(latLng);
		if(!destinationMarker.getMap()){
		    destinationMarker.setMap(map);
		}
		break;
	    case 'clear_directions_click':
		directionsRenderer.setMap(null);
		//set CSS styles to defaults
		document.getElementById('clearDirectionsItem').style.display='';
		document.getElementById('directionsDestinationItem').style.display='';
		document.getElementById('directionsOriginItem').style.display='';
		document.getElementById('getDirectionsItem').style.display='';
		break;
	    case 'get_directions_click':
		var directionsRequest={};
		directionsRequest.destination=destinationMarker.getPosition();
		directionsRequest.origin=originMarker.getPosition();
		directionsRequest.travelMode=google.maps.TravelMode.DRIVING;
		
		directionsService.route(directionsRequest, function(result, status){
			if(status===google.maps.DirectionsStatus.OK){
			    //hide the origin and destination markers as the DirectionsRenderer will render Markers itself
			    originMarker.setMap(null);
			    destinationMarker.setMap(null);
			    directionsRenderer.setDirections(result);
			    directionsRenderer.setMap(map);
			    //hide all but the 'Clear directions' menu item
			    document.getElementById('clearDirectionsItem').style.display='block';
			    document.getElementById('directionsDestinationItem').style.display='none';
			    document.getElementById('directionsOriginItem').style.display='none';
			    document.getElementById('getDirectionsItem').style.display='none';
			} else {
			    alert('Sorry, the map was unable to obtain directions.\n\nThe request failed with the message: '+status);
			}
		    });
		break;
	    case 'zoom_in_click':
		map.setZoom(map.getZoom()+1);
		break;
	    case 'zoom_out_click':
		map.setZoom(map.getZoom()-1);
		break;
	    case 'center_map_click':
		map.panTo(latLng);
		break;
	    }
	    if(originMarker.getMap() && destinationMarker.getMap() && document.getElementById('getDirectionsItem').style.display===''){
		//display the 'Get directions' menu item if it is not visible and both directions origin and destination have been selected
		document.getElementById('getDirectionsItem').style.display='block';
	    }
	});
}

//**************************
// DRAWING TOOL FUNCTIONS **
//**************************

function clearSelection() {
    if (selectedShape) {
	selectedShape.setEditable(false);
	selectedShape = null;
    }
}

function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(true);
}

function deleteSelectedShape() {
    if (selectedShape) {
	selectedShape.setMap(null);
    }
}

//**************************
// MAP WINDOW LOCALIZATION *
//**************************
function getNormalizedCoord(coord, zoom) {
    var y = coord.y;
    var x = coord.x;
    
    // tile range in one direction range is dependent on zoom level
    // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    var tileRange = 1 << zoom;
    
    // don't repeat across y-axis (vertically)
    if (y < 0 || y >= tileRange) {
	return null;
    }
    
    // repeat across x-axis
    if (x < 0 || x >= tileRange) {
	x = (x % tileRange + tileRange) % tileRange;
    }
    
    return {
	x: x,
	    y: y
	    };
}

//**************************
// GEOCODER ****************
//**************************
function geocode(address) {
    geocoder.geocode({'address':address},function(results,status) {
	    if (status == google.maps.GeocoderStatus.OK) {
		map.setCenter(results[0].geometry.location);
		map.setZoom(9);
	    }
	});
}

//**************************
// HUC ZONE STUFF **********
//**************************

function assignHUCMap() {
    var idx = jQuery.inArray($('#state-select').val(),hucStates);
    if (idx > -1) {
	hucLayer.setOptions({
		query: {
		    select: "geometry",
			from: hucTables[idx],
			},
		    styles: [{
			polygonOptions: {
			    fillColor: '#f8f8f8',
				fillOpacity: 0.01,
				strokeColor: '#ffffff'
				}
		    }],
		    suppressInfoWindows: true,
		    clickable: false
		    });
	hucLayer.setMap(map);
    }
}


//**************************
// SUBSCRIPTIONS **********
//**************************

function saveSubscriptions() {
    $.ajax({
	    url: serverURL+'/cgi-bin/save_subscriptions2.php',
		type: 'post',
		data: {subscriptions:JSON.stringify(subscriptions)},
		async: false,
		error: function(jqXHR, textStatus, errorThrown) {
		alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
	    },
		success: function(response) {
		populateSubscriptionList();
	    }
	});
}

function populateSubscriptionList() {
    if (subscriptions.length > 0) {
	var region_names = new Array();
	for (var i=0; i < subscriptions.length; i++) {
	    var NE = new google.maps.LatLng(subscriptions[i].nelat,subscriptions[i].nelng);
	    var SW = new google.maps.LatLng(subscriptions[i].swlat,subscriptions[i].swlng);
	    var bounds = new google.maps.LatLngBounds(SW,NE);
	    var center = bounds.getCenter();
	    geocoder.geocode({'latLng':center},function(results,status) {
		    if (status == google.maps.GeocoderStatus.OK) {
			if(results[0]) {
			    region_names.push(results[0].formatted_address);
			    if (i == subscriptions.length) {
				var subscriptions_list_string='';
				subscriptions_list_string+='<option>';
				subscriptions_list_string+=region_names.join('</option><option>');
				subscriptions_list_string+='</option>';
				$('#subscriptions-list').html(subscriptions_list_string);
			    }
			}
		    }
		});
	}
    }
    else
	$('#subscriptions-list').html('');
}

//**************************
// GUI EVENT LISTENER ******
//**************************
function accordion_expand_all()
{
    var sections = $('#accordion').find("h3");
    sections.each(function(index, section){
	    if ($(section).hasClass('ui-state-default')) {
		$(section).click();
	    }
	});
}

$(document).ready(function() {
	// nice little effect when you load the page
	$('html').css('opacity', '0').fadeTo(500, 1,'swing');
	
	// accordion menu items
	$('#accordion').accordion({
		active: false,
		    collapsible: true,
		    heightStyle: 'content',
		    beforeActivate: function(event, ui) {
		    // The accordion believes a panel is being opened
		    if (ui.newHeader[0]) {
			var currHeader  = ui.newHeader;
			var currContent = currHeader.next('.ui-accordion-content');
			// The accordion believes a panel is being closed
		    } else {
			var currHeader  = ui.oldHeader;
			var currContent = currHeader.next('.ui-accordion-content');
		    }
		    // Since we've changed the default behavior, this detects the actual status
		    var isPanelSelected = currHeader.attr('aria-selected') == 'true';
		    
		    // Toggle the panel's header
		    currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
		    
		    // Toggle the panel's icon
		    currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
		    
		    // Toggle the panel's content
		    currContent.toggleClass('accordion-content-active',!isPanelSelected)    
			if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }
		    
		    return false; // Cancels the default action
		}
	    });
	accordion_expand_all();
	
	// help menu
	$("#help").click(function( event ) {
		$("#dialog").dialog( "open" );
		event.preventDefault();
	    });
	
	$( "#help" ).hover(function() {
		$( this ).addClass( "ui-state-hover" );
	    },
	    function() {
		$( this ).removeClass( "ui-state-hover" );
	    });
	
	$('#dialog').dialog({
		autoOpen: false,
		    width: 400,
		    buttons: [{text: "Ok",click: function() {
			    $(this).dialog("close");
			}
		    }]
		    });

	// edit menus
	$('#region-edit').dialog({
		autoOpen: false,
		    width: 350,
		    buttons: [{text: "Cancel",click: function() {
			    $(this).dialog("close");
			}
		    }]
		    });
	
	$('#region-edit2').dialog({
		autoOpen: false,
		    width: 350,
		    buttons: [{text: "Cancel",click: function() {
			    $(this).dialog("close");
			}
		    }]
		    });
	
	// going to address
	$('#geocoder-text').bind('keypress',function(e) {
		if(e.keyCode==13)
		    geocode($('#geocoder-text').val());
	    });
	
	$('#geocoder-button').click(function() {
		geocode($('#geocoder-text').val());
	    });
	
	// huc zone stuff
	$('#state-select').change(function() {
		assignHUCMap();
	    });
	
	$('#huc-zones').change(function() {
		if (this.checked) {
		    $('#huc-zone-state').show();
		    assignHUCMap();
		}
		else {
		    if (hucLayer.getMap() != null)
			hucLayer.setMap(null);
		    $('#huc-zone-state').hide();
		}
	    });
	
	$('#impervious-cover').change(function() {
		if (this.checked) {
		    $('#ic-date').show();
		    map.overlayMapTypes.push(icLayer);
		}	
		else {
		    $('#ic-date').hide();
		    map.overlayMapTypes.pop(icLayer);
		}
	    });
	
	$('#ic-select').change(function() {
		var op=$('#ic-select').val();
		if (op=='specific-date') {
		    $('#specific-date').show();
		    $('#diff-date').hide();
		}
		else if (op == 'diff-date') {
		    $('#diff-date').show();
		    $('#specific-date').hide();
		}
		else {
		    $('#diff-date').hide();
		    $('#specific-date').hide();
		}
	    });
	
	$('#my-subscriptions').change(function() {
		if (this.checked) {
		    rectangle.setMap(map);
		    $('#subscription-management').show();
		}
		else {
		    rectangle.setMap(null);
		    $('#subscription-management').hide();
		}
	    });

	$('#manage-subscriptions').click(function() {
		$('#manage-subscriptions').hide();
		$('#subscription-edit').show();
		$('#subscription-save').show();
		$('#subscriptions-list').show();
		$('#subscription-delete').show();
		$('#subscription-management-close').show();
	    });

	function singleClick(e) {
	    var idx=$('#subscriptions-list')[0].selectedIndex;
	    if (idx > -1) {
		
		var NE = new google.maps.LatLng(subscriptions[idx].nelat,subscriptions[idx].nelng);
		var SW = new google.maps.LatLng(subscriptions[idx].swlat,subscriptions[idx].swlng);
		var bounds = new google.maps.LatLngBounds(SW,NE);
		
		rectangle.setOptions({
			map: map,
			    bounds: bounds,
			    clickable: false
			    });
	    }
	}

	function doubleClick(e) {
	    var idx=$('#subscriptions-list')[0].selectedIndex;
	    if (idx > -1) {
		
		var NE = new google.maps.LatLng(subscriptions[idx].nelat,subscriptions[idx].nelng);
		var SW = new google.maps.LatLng(subscriptions[idx].swlat,subscriptions[idx].swlng);
		var bounds = new google.maps.LatLngBounds(SW,NE);
		
		rectangle.setOptions({
			map: map,
			    bounds: bounds,
			    clickable: false
			    });
		map.setCenter(bounds.getCenter());
		map.fitBounds(bounds);
	    }
	}

	$('#subscriptions-list').click(function(e) {
		var that = this;
		setTimeout(function() {
			var dblclick = parseInt($(that).data('double'),10);
			if (dblclick > 0)
			    $(that).data('double',dblclick-1);
			else
			    singleClick.call(that,e);
		    },300);
	    }).dblclick(function(e) {
		    $(this).data('double',2);
		    doubleClick.call(this,e);
		});

	$('#subscription-save').click(function() {
		saveSubscriptions();
		populateSubscriptionList();
		alert("Your settings have been saved!");
	    });

	$('#edit-subscription-save').click(function() {
		if (selectedShape != null) {
		    if (selectedShape.getMap() != null) {
			var bounds = selectedShape.getBounds();
			var NE = bounds.getNorthEast();
			var SW = bounds.getSouthWest();
			var region = {
			    subscribe: $('#new-data-subscribe-checkbox').is(":checked"),
			    nelat: NE.lat(),
			    nelng: NE.lng(),
			    swlat: SW.lat(),
			    swlng: SW.lng()
			};
			subscriptions.push(region);
			saveSubscriptions();
			populateSubscriptionList();
			deleteSelectedShape();
			drawingManager.setOptions({
				drawingControl:false
				    });
			$('#regionCancelItem').hide();
			$('#viewDataItem').hide();
			$('#regionSaveItem').hide();
			$('#regionSelectItem').show();
			$('#viewPointDataItem').show();
			$('#region-edit').dialog("close");
		    }
		    else
			alert("You must select a region first!");
		}
		else
		    alert("You must select a region first!");
	    });

	$('#subscription-edit').click(function() {
		var idx=$('#subscriptions-list')[0].selectedIndex;
		if (idx > -1) {
		    $('#data-subscribe-checkbox').prop('checked',subscriptions[idx].subscribe);
		    rectangle.setEditable(true);
		    $('#region-edit2').dialog("open");
		}
	    });

	$('#edit-save').click(function() {
		var bounds = rectangle.getBounds();
		var NE = bounds.getNorthEast();
		var SW = bounds.getSouthWest();
		var region = {
		    subscribe: $('#data-subscribe-checkbox').is(":checked"),
		    nelat: NE.lat(),
		    nelng: NE.lng(),
		    swlat: SW.lat(),
		    swlng: SW.lng()
		};
		var idx=$('#subscriptions-list')[0].selectedIndex;
		subscriptions[idx]=region;
		saveSubscriptions();
		populateSubscriptionList();
		rectangle.setEditable(false);
		$('#region-edit2').dialog("close");
	    });	
	
	$('#subscription-delete').click(function() {
		if (subscriptions.length > 0) {
		    rectangle.setMap(null);
		    var idx = $('#subscriptions-list')[0].selectedIndex;
		    subscriptions.splice(idx,1);
		    populateSubscriptionList();
		}
	    });

	$('#subscription-management-close').click(function() {
		$('#subscription-delete').hide();
		$('#subscriptions-list').hide();
		$('#manage-subscriptions').show();
		$('#subscription-management-close').hide();
		$('#subscription-edit').hide();
		$('#subscription-save').hide();
	    });
	
	$('#logout').click(function() {
		$.ajax({
			url: serverURL+'cgi-bin/logout2.php',
			    type: 'get',
			    error: function(jqXHR,textStatus, errorThrown) {
			    alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
			},
			    success: function(response) {
			    location.reload();
			}
		    });
		$('#logout').hide();
	    });
	$('#login').click(function() {
		location.replace('login.html');
	    });
    });


//**************************
// POINT TO TILE CONVERTER *
//**************************
function bound(value, opt_min, opt_max) {
    if (opt_min != null) value = Math.max(value, opt_min);
    if (opt_max != null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
					      TILE_SIZE / 2);
    this.pixelsPerLonDegree_ = TILE_SIZE / 360;
    this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function(latLng,
							  opt_point) {
    var me = this;
    var point = opt_point || new google.maps.Point(0, 0);
    var origin = me.pixelOrigin_;
    
    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;
    
    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999,
		     0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
    -me.pixelsPerLonRadian_;
    return point;}
    ;

MercatorProjection.prototype.fromPointToLatLng = function(point) {
    var me = this;
    var origin = me.pixelOrigin_;
    var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) -
			       Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

function createInfoWindowContent(coords) {
    var numTiles = 1 << map.getZoom();
    var projection = new MercatorProjection();
    var worldCoordinate = projection.fromLatLngToPoint(coords);
    var pixelCoordinate = new google.maps.Point(
    						worldCoordinate.x * numTiles,
    						worldCoordinate.y * numTiles);
    var tileCoordinate = new google.maps.Point(
    					       Math.floor(pixelCoordinate.x / TILE_SIZE),
    					       Math.floor(pixelCoordinate.y / TILE_SIZE));
    
    
    var zoom = map.getZoom();
    
    var	tilePix = new google.maps.Point(pixelCoordinate.x-tileCoordinate.x*TILE_SIZE,pixelCoordinate.y-tileCoordinate.y*TILE_SIZE);
    
    //////////////////////////////////////////////////////////////////
    var contentStart = '<style type="text/css">' +
	'#content {' +
	'color: #555;' +
	'font-family: Arial, Helvetica, sans-serif;' +
	'font-size: 12px;' +
	'padding: .5em 1em' +
	'}' +
	'</style>' +
	'<div id="content">';
    var contentEnd = '</div>';
    
    var content = [
		   'LatLng: ' + coords.lat() + ' , ' + coords.lng(),
		   'Tile Coordinate: ' + tileCoordinate.x + ' , ' + ((Math.pow(2,zoom)-1)-tileCoordinate.y) + ' at Zoom Level: ' + map.getZoom(),
		   'Pixel on tile: ' + Math.floor(tilePix.x) + ' , ' + Math.floor(tilePix.y)
		   ].join('<br>');
    var date=$('#date-picker').val().split('-');
    
    var ic_json={
	year: date[0],
	month: date[1],
	day: date[2],
	zoom: map.getZoom(),
	tilex: Math.floor(tileCoordinate.x),
	tiley: (Math.pow(2,zoom)-1)-tileCoordinate.y,
	pixelx: Math.floor(tilePix.x),
	pixely: Math.floor(tilePix.y)
    };
    
    var ajaxresponse = $.ajax({
	    url: serverURL+'/cgi-bin/getICInfo.py',
	    type: 'post',
	    data: ic_json,
	    async: false
	}).responseText;
    if (!jQuery.isEmptyObject(ajaxresponse)){
	var obj = jQuery.parseJSON(ajaxresponse);
	if (obj.percentage == '-1') {
	    if (name != 'Guest')
		obj.percentage = 'Impervious Coverage Data: Not available<br><br><input id="send-notification" type="button" value = "Let us know" onclick="sendNotification()" />. You will be notified about any changes.';
	    else
		obj.percentage = 'Impervious Coverage Data: Not available<br><br>If you would like to receive a notification for when this information is available, please <a href="../html/login.html">login</a>.';
	}
	else
	    obj.percentage = 'Impervious Coverage Data: ' + obj.percentage + '%';
	content += '<br><br>' + obj.percentage;
    }
    return contentStart + content + contentEnd;
}


function sendNotification() {
    $.ajax({
	    url: serverURL+'cgi-bin/sendNotification2.php',
		success: function(response) {
		alert(response);
	    }
	});
}

//**************************
// LOGIN CHECKER ***********
//**************************

function loggedIn() {
    $.ajax({
	    url: serverURL+'/cgi-bin/checkSession2.php',
		type: 'get',
		error: function(jqXHR,textStatus, errorThrown) {
		alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
	    },
		success: function(response) {
		
		if (response != "" && response != null) {
		    var obj = JSON.parse(response);
		    name = obj.first_name;
		    if (obj.subscriptions != '') {
			if (JSON.parse(obj.subscriptions) != null) {
			    subscriptions = JSON.parse(obj.subscriptions);
			    populateSubscriptionList();
			}
			else
			    subscriptions = new Array();
		    }
		    $('#notification').html("Hi, " + name + "!");
		    $('#logout').show();
		    $('#login').hide();
		}
		else
		    $('#notification').html("Hi, " + name + "!");
		
	    }
	});
}