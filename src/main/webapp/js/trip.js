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
	coverPhotoBinding: 'data.coverPhoto',
	albumUrlBinding: 'data.albumUrl',
	albumNameBinding: 'data.albumName',
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
		trip.set('coverPhoto', "img/NoPhotos.png");
		
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
	
	albumUrlVisible: false,
	
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
		
		var albumUrl = this.get('content.albumUrl');
		
		$.get(albumUrl, function(data) {
			
			var entries = data.feed.entry;
			console.log(data);
			
			var photos = [];
			
			for(var i=0; i<entries.length; i++) {
				
				var georss = entries[i].georss$where;
				
				if(georss != undefined) {
					
					var posStr = georss.gml$Point.gml$pos.$t;
					var coords = posStr.split(" ");
					var lat = parseFloat(coords[0]);
					var lng = parseFloat(coords[1]);
					
					var photo = { 
							src: entries[i].content.src,
							latLng: { lat: lat, lng: lng } 
					};
					
					photos.addObject(photo);
					
					console.log(photo);
	
				}
				
			}
			
			controller.set('content.photos', photos);
			
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
	
	openAlbumUrlInput: function() {
		
		this.set('albumUrlVisible', true);
		
	},
	
	setAlbumUrl: function() {
		
		this.set('albumUrlVisible', false);
		
		var albumUrl = this.get('content.albumUrl');
		
		if(albumUrl != undefined && albumUrl.length > 0) {
			
			console.log("album url: "+this.get('content.albumUrl'));
			
			var trip = this.get('content');
			
			$.get(albumUrl, function(data) {
				
				var coverPhoto = data.feed.icon.$t;
				var albumName = data.feed.title.$t;
				
				console.log("cover photo: "+coverPhoto);
				
				trip.set('data.coverPhoto', coverPhoto);
				trip.set('data.albumName', albumName);
				
				trip.save(function(data) {
				});
				
			});
			
		}
		
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
	
	albumUrlVisibleBinding: 'controller.albumUrlVisible',
	
	AlbumUrlInputView: Ember.TextField.extend({
		
		albumUrlVisibleBinding: 'parentView.albumUrlVisible',
		
        classNameBindings: 'albumUrlVisible:visible:invisible'
        
	}),
    
	entryLoaded: function() {
		
		var trip = this.get('controller.content');
		var entries = trip.get('entries');
		
		if(entries == undefined) {			
			return;
		}
		
		console.log("ENTRIES:");
		console.log(entries);
		
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
        	
        	center: new google.maps.LatLng(0, 0),
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
		
        
	}.observes('controller.content.entries'),
	
	photosLoaded: function() {
		
		var photos = this.get('controller.content.photos');
		
		if(photos == undefined) {
			return;
		}
		
		var map = this.get('map');
		
		for(var i=0; i<photos.length; i++) {
			
			var photo = photos[i];
			
			var latlng = new google.maps.LatLng(photos[i].latLng.lat, photos[i].latLng.lng);

			var marker = new google.maps.Marker({
			    position: latlng,
			    title: "Click to view full photo",
			    map: map
			});
			
			
			this.addMarkerMessage(marker, photos[i].src);
			
			
		}
		
	}.observes('controller.content.photos'),
	
	addMarkerMessage: function(marker, photoSrc) {
		
		var map = this.get('map');
		
		var contentString = "<img src=\""+photoSrc+"\" width=\"150px\"/>";
		
		var infowindow = new google.maps.InfoWindow(
				{ 
					content: contentString
			     
				});
		
		google.maps.event.addListener(marker, 'mouseover', function() {
			infowindow.open(map, marker);
		});
		
		google.maps.event.addListener(marker, 'mouseout', function() {
			infowindow.close();
		});
		
		google.maps.event.addListener(marker, 'click', function() {
			location.href = photoSrc;
		});
		
	}
	
});