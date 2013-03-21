App.TripsIndexRoute = Ember.Route.extend({
	
	model: function() {
		console.log("trips model");
		return App.Trip.findAll();
	},
	
	setupController: function(controller, model) {
    	console.log("trips controller");
    	console.log(model);
    	console.log(controller);
    	controller.set('content', model);
  	}
		
});


App.TripRoute = Ember.Route.extend({
	
	model: function(params) {
		console.log("1 trip model");
		return App.Trip.findOne(params.trip_id);
	},
	
	setupController: function(controller, model) {
    	console.log("1 trip controller");
    	console.log(model);
    	console.log(controller);
    	controller.set('content', model);
  	}
	
});


App.Trip = App.Model.extend({
	
	path: "trip",
	
	idBinding: 'data.id',
	displayValueBinding: 'data.displayValue'
	
	
});

App.Trip.reopenClass({
	path: "trip"
});


App.TripsIndexController = Ember.ArrayController.extend({
	
	newTrip: undefined,
	
	init: function() {
		
		this._super();
		
		var trip = App.Trip.create({
			data: {
				displayValue: undefined,
			}
		});
		
		this.set('newTrip', trip);
	
	},
	
	selectTrip: function(trip) {
		
		location.href = "#/trip/"+trip.id;
	
	},
	
	addNewTrip: function() {
		
		var trip = this.get('newTrip');
		
		trip.save(function(data) {
			location.href="#/trip/"+data.id+"/view";
		});
		
	}
	
});

App.TripsIndexView = Ember.View.extend({
	
	didInsertElement: function() {
		
		var trip = App.Trip.create({
			data: {
				displayValue: undefined,
			}
		});
		
		this.set('controller.newTrip', trip);
		
	}
	
});


App.TripController = Ember.ObjectController.extend({
	
	getEntries: function(tripId) {
		
		var controller = this;
		
		console.log("get entries:");
		
		
		$.get("service/entry?tripId="+tripId, function(data) {
			
			var entries = [];
			
			var rowBg = "#ffffff";
			
			for(var i=0; i<data.length; i++) {
				
				var entry = App.Entry.create({ data: data[i] });
				
				var entryView = Ember.View.extend({
					
					didInsertElement: function() {
						
						rowBg = rowBg == "#f2f2f2" ? "#ffffff" : "#f2f2f2";
						this.$().css("background", rowBg);
						
					}
					
					
				});
				
				entry.set('view', entryView);
				
				entries.addObject(entry);
				
			}
			
			controller.set('content.entries', entries);
			
		});
		
	},
	
	selectEntry: function(entry) {
		location.href = "#/entry/"+entry.id+"/view";
	},
	
	newEntry: function() {
		
		var entries = this.get('content.entries');
		var lastEntryParam = "";
		if(entries.length > 0) {
			var lastEntry = entries[entries.length-1];
			lastEntryParam = "&fromName="+lastEntry.route.to.displayValue;
		}
		
		var id = this.get('content.id');
		location.href = "#/entry/new?tripId="+id+lastEntryParam+"/edit";
		
	},
	
	idChanged: function() {
		
		var id = this.get('content.id');
		
		if(id != undefined) {
			this.getEntries(id);
		}
		
	}.observes('content.id')
	
});

App.TripView = Ember.View.extend({
	
	map: undefined,
	
	entryLoaded: function() {
		
		var trip = this.get('controller.content');
		var entries = trip.get('entries');
		
		if(entries == undefined) {			
			return;
		}
		
		console.log("ENTRIES:");
		console.log(entries);
		
		var from = entries[0].route.from;
		
		console.log(from);
		
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
        	
        	center: new google.maps.LatLng(from.lat, from.lng),
          	zoom: 8,
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
        
        var map = new google.maps.Map(document.getElementById("tripMap"), mapOptions);
        
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
        
        this.set('map', map);
        
        var tripPaths = [];
        var bounds = new google.maps.LatLngBounds();
    	
        for(var i=0; i<entries.length; i++) {
    		
    		tripPaths[i] = [];
    		tripPaths[i][0] = new google.maps.LatLng(entries[i].route.from.lat, entries[i].route.from.lng);
    		tripPaths[i][1] = new google.maps.LatLng(entries[i].route.to.lat, entries[i].route.to.lng)
    		
    		bounds.extend(tripPaths[i][0]);
    		bounds.extend(tripPaths[i][1]);
    		
    		var tripPath = new google.maps.Polyline({
    			path: tripPaths[i],
    			strokeColor: "#FF0000",
    			strokeOpacity: 1.0,
    			strokeWeight: 2
  			});
			
			tripPath.setMap(map);
    	}
		
		map.fitBounds(bounds);
        
	}.observes('controller.content.entries')
	
});