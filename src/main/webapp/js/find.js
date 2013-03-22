App.FindRoute = Ember.Route.extend({
	
  	
});


App.FindController = Ember.Controller.extend({
	
	searchLocation: undefined,
	
	selectRoute: function(route) {
		location.href = "#/route/"+route.id;
	},
	
	newFromEntry: function(name) {
		
		var nameEncoded = encodeURIComponent(name);
		location.href = "#/entry/new?fromName="+nameEncoded+"/edit";
		
	},
	
	newToEntry: function(name) {
		
		var nameEncoded = encodeURIComponent(name);
		location.href = "#/entry/new?toName="+nameEncoded+"/edit";
		
	}
	
	
});


App.FindView = Em.View.extend({
	
	map: undefined,
	
	searchLocation: undefined,
	
	fromSuggestions: Ember.ArrayProxy.create({ content: [] }),
	
	toSuggestions: Ember.ArrayProxy.create({ content: [] }),
	
	results: undefined,
	
	searchResultsHeight: 0,
	
	searchLocationDefined: false,
	
	controller: App.FindController.create(),
	
	/*
	init: function() {
		
		this._super();
		
		//this.set('fromSuggestions', Ember.ArrayProxy.create({ content: [] }));
		//this.set('toSuggestions', Ember.ArrayProxy.create({ content: [] }));
		//this.set('results', Ember.ArrayProxy.create({ content: [] }));
		
	},
	*/
	
	didInsertElement: function() {
		
		//console.log("did insert find");
		
		var styles = [
		              {
		            	    "stylers": [
		            	      { "saturation": -100 }
		            	    ]
		            	  }
		            	];
		
		var styledMap = new google.maps.StyledMapType(styles,
			    {name: "Styled Map"});
		
		var mapOptions = {
        	
        	center: new google.maps.LatLng(-34.397, 150.644),
          	zoom: 6,
          	mapTypeId: google.maps.MapTypeId.ROADMAP,
          	panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            }
		
        };
        
        var map = new google.maps.Map(document.getElementById("searchMap"), mapOptions);
        
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
        
        this.set('map', map);
        
		var element = this.$();
		element.addClass("nooverflow");
		
    	//var searchBox = element.find(".searchBox");
		//var searchResults = element.find(".searchResults");
		
		var container = $('#centerSection');
		//container.css("height", (($(window).height()-container.offset().top))+"px");
		//container.css("overflow", "hidden");
		
		setTimeout(function() {
		//element.bind('trans-end', function() {
    		container.css("overflow", "");
		//});
		}, 1200);
		
		setTimeout(function() {
			element.removeClass("slideOut");
			element.addClass("slideIn");
			//searchResults.removeClass("searchResultsSlideDown");
			//searchResults.addClass("searchResultsSlideUp");
		}, 10);
    	
		var searchLocation = this.get('controller.searchLocation');
		if(searchLocation != undefined) {
			this.set('searchLocation', searchLocation);
		};
		
	},
	
	willDestroyElement: function ()
	{
		
		var clone = this.$().clone();
    	this.$().replaceWith(clone);
    	
    	clone.css("z-index", "-1");
    	clone.css("position", "absolute");
    	
    	var container = $("centerSection");
    	
		//var searchBox = clone.find(".searchBox");
		//var searchResults = clone.find(".searchResults");
		//searchResults.css("z-index", -1);
		
		//container.css("overflow", "hidden");
		
		setTimeout(function() {
		//clone.bind('trans-end', function() {
    		clone.remove();
    		delete clone;
    		container.css("overflow", "");
    		//container.css("height", "");
		//});
		}, 1200);
		
		setTimeout(function() {
			clone.removeClass("slideIn");
			clone.addClass("slideOut");
			//searchResults.removeClass("searchResultsSlideUp");
			//searchResults.addClass("searchResultsSlideDown");
		}, 0);
		
		
	},

	
	searchTermsChanged: function() {
		
		var searchLocation = this.get('searchLocation');
		var toSuggestions = this.get('toSuggestions');
		var fromSuggestions = this.get('fromSuggestions');
		
		console.log("search terms changed:");
		console.log(searchLocation);
		console.log(searchLocation.id+"/"+searchLocation.localityName);
		
		if(searchLocation.localityName == undefined) {
			return;
		}
		
		if(searchLocation == this.get('controller.searchLocation')) {
			return;
		} else {
			this.set('controller.searchLocation', searchLocation);
		}
		
		
		this.set('searchLocationDefined', true);
		
		var map = this.get('map');
		var location = new google.maps.LatLng(searchLocation.lat, searchLocation.lng);
		map.setCenter(location);
		
		toSuggestions.clear();
		fromSuggestions.clear();
		
		var bounds = new google.maps.LatLngBounds();
		
		$.get("service/route?fromId="+searchLocation.id, function(data) {
			for(var i=0; i<data.length; i++) {
				
				var route = data[i];
				toSuggestions.addObject(route);
				
				var routeCoordinates = [];
				routeCoordinates[0] = new google.maps.LatLng(route.to.lat, route.to.lng);
    			routeCoordinates[1] = new google.maps.LatLng(searchLocation.lat, searchLocation.lng);
    	
    			bounds.extend(routeCoordinates[0]);
    			bounds.extend(routeCoordinates[1]);
    			
    			
    			var routePath = new google.maps.Polyline({
    				path: routeCoordinates,
    				strokeColor: "#FF0000",
    				strokeOpacity: 1.0,
    				strokeWeight: 2
  				});
			
				routePath.setMap(map);
		
			}
		});
		
		$.get("service/route?toId="+searchLocation.id, function(data) {
			for(var i=0; i<data.length; i++) {
				
				var route = data[i];
				fromSuggestions.addObject(route);
				
				var routeCoordinates = [];
				routeCoordinates[0] = new google.maps.LatLng(route.from.lat, route.from.lng);
    			routeCoordinates[1] = new google.maps.LatLng(searchLocation.lat, searchLocation.lng);
    	
    			bounds.extend(routeCoordinates[0]);
    			bounds.extend(routeCoordinates[1]);
    	
    			var routePath = new google.maps.Polyline({
    				path: routeCoordinates,
    				strokeColor: "#00FF00",
    				strokeOpacity: 1.0,
    				strokeWeight: 2
  				});
			
				routePath.setMap(map);
				
			}
		});
		
		map.setZoom(6);
		
	}.observes('searchLocation.localityName')
	
	
});