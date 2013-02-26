var App = Ember.Application.create({
    
});

App.map = new google.maps.Map(document.getElementById("map"), {});

App.params = {
	pNew: Ember.Object.create({
  		entry_id: "new"
	})
};


App.NavLabelView = Ember.View.extend({
	
	tagName: 'li',
	
	classNames: [ "handCursor" ],
	
	classNameBindings: 'active',
	
	active: false,
	
	value: undefined,
	
	uri: undefined,
	
	select: function() {
		location.href = this.get('uri');
	}
	
});

App.ApplicationController = Ember.Controller.extend({
	
	viewName: "",
	
	searchTags: [],
	
	navLabels: [ 
	             App.NavLabelView.create({ active: true, value: "New", uri: "#/entry/new/edit" }), 
	             App.NavLabelView.create({ active: false, value: "Find", uri: "#/find" }), 
	             App.NavLabelView.create({ active: false, value: "Trips", uri: "#/trips" })   
	           ],
	           
	selectNavLabel: function(navLabel) {
		
		var navLabels = this.get('navLabels');
		for(var i=0; i<navLabels.length; i++) {
			if(navLabels[i].get('value') == navLabel) {
				navLabels[i].set('active', true);
				location.href = navLabels[i].get('uri');
			} else {
				navLabels[i].set('active', false);
			}
		}
		
	}
	
	
});

App.controller = App.ApplicationController.create();

App.ApplicationView = Ember.View.extend({
	
	controllerBinding: 'App.controller',
	
	templateName: 'application'

});

App.controlsController = Ember.ArrayController.create({
	
	selectedAction: undefined

});


App.ControlController = Ember.ObjectController.extend({
	
	triggerAction: function() {
		App.controlsController.set('selectedAction', this.get('content'));
	}
	
});


App.ControlView = Ember.View.extend({
	
	init: function() {
		
		this._super();
		
		var controller = App.ControlController.create();
		controller.set('content', this.get('content'));
		this.set('controller', controller);
		
	}
	
});

App.Router.map(function() {
	
	this.resource("find", function() {
		this.route("index", { path: "/" });
	});
  	
  	this.resource("entry", { path: "/entry/:entry_id" }, function() {
  		this.route("view", { path: "/view" });
  		this.route("edit", { path: "/edit" });
  	});
  	
  	this.resource("route", { path: "/route/:route_id" }, function() {
  		this.route("edit", { path: "/edit" });
  	});
  	
  	this.resource("trip", { path: "/trip/:trip_id" }, function() {
  		this.route("view", { path: "/view" });
  		this.route("edit", { path: "/edit" });
  	});
  	
  	this.resource("trips", { path: "/trips" }, function() {
  		this.route("index", { path: "/" });
  	});
  	
});


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


App.RouteRoute = Ember.Route.extend({
	
	params: undefined,
	
	controller: undefined,
	
	model: function(params, firstLoad) {
		
		console.log("PARAMS("+firstLoad+"): ");
		console.log(params);
		
		var controller = this.get('controller');
		
		if(params != undefined) {
			
			var oldParams = this.get('params');
			
			console.log("paramscheck: "+(oldParams == params));
			
			if(oldParams == params && firstLoad == undefined) {
				console.log("failed params check....");
				return;
			} else {
				this.set('params', params);
			}
			
		}
		
		if(!controller) {
			console.log("no controller");
			return;
		}
		
		console.log("updating params");
		
    	App.controller.set('viewName', "New entry");
    	controller.set('routeId', params.route_id);
    	
  		//console.log("viewname "+App.controller.get('viewName'));
	
	},
	
	setupController: function(controller, model) {
		
		//console.log("setup ctrl");
		this.set('controller', controller);
  		this.model(this.get('params'), true);
  		
  	}
  	
});


App.FindRoute = Ember.Route.extend({
	
	setupController: function(controller, model) {
		
		controller.set('content', Ember.Object.create({ from: null, to: null }));
		
		//App.controller.selectNavLabel("Find");
		App.controller.set('viewName', "Find");
  		
  	}
  	
});

App.IndexRoute = Ember.Route.extend({
	
	enter: function() {
    	location.href = "#/entry/new/edit";
  	}
  	
});

	
App.Model = Ember.Object.extend({
	
	path: undefined,
	
	data: null,
	
	init: function() {
	},
	
	save: function() {
		
		var json = JSON.stringify(this.get('data'), null, 2);
		
		console.log("sending: \n"+json);
		
		$.ajax({
  			
  			type: "PUT",
  			url: "service/"+this.get('path'),
  			dataType: "json",
  			contentType: 'application/json',
  			data: json,
  			success: function(data) {
  				console.log("success: "+data.id);
  				location.href="#/entry/"+data.id+"/view";
  			}
  
		});
		
	},
	
	test: function() {
		//console.log("test");
	}
	
});


App.Model.reopenClass({
	
	findAll: function() {
		
		var model = this;
		var result = Ember.ArrayProxy.create({
			content: []
		})
		
		$.ajax({
  			
  			type: "GET",
  			url: "service/"+model.path,
  			dataType: "json",
  			contentType: 'application/json',
  			success: function(data) {
  				console.log("content received: "+data);
  				for(var i=0; i<data.length; i++) {
  					result.addObject(data[i]);
  				}
  			}
  
		});
		
		return result;
		
	},
	
	findOne: function(id) {
		
		var model = this.create();
		console.log(model)
		
		$.ajax({
  			
  			type: "GET",
  			url: "service/"+model.path+"/"+id,
  			dataType: "json",
  			contentType: 'application/json',
  			success: function(data) {
  				console.log("content received: "+data);
  				model.set('data', data);
  			}
  
		});
		
		return model;
		
	},
	
	find: function(id, controller) {
		
		var model = this;
		
		$.ajax({
  			
  			type: "GET",
  			url: "service/"+model.path+"/"+id,
  			dataType: "json",
  			contentType: 'application/json',
  			success: function(data) {
  				console.log("content received: "+data);
  				controller.modelUpdated(data);
  				//controller.set('content', App.Entry.create({ data: data }));
  				//App.get('controller').set('viewName', data.from.displayValue+" - "+data.to.displayValue);
  			}
  
		});
		
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



App.CenterSectionContentView = Ember.View.extend({
	
});

App.TypeInfoView = Ember.View.extend({
	
	typeBinding: 'parentView.controller.type',
	
	dateSelectTemplate: Ember.Handlebars.compile('{{view view.DateSelect}}'),
	refSelectTemplate: Ember.Handlebars.compile('{{view view.ReferenceSelect}}'),
	
	DateSelect: Ember.View.extend({
		templateName: 'entry/edit/date'
	}),
	
	ReferenceSelect: Ember.View.extend({
		templateName: 'entry/edit/reference'
	}),
	
	init: function() {
			
		this._super();
		
		this.set('template', this.get('refSelectTemplate'));
		
	},
		
	toggleTypeInfo: function() {
		
		var type = this.get('type');
		
		if(type == null) {
			return;
		}
		
		if(type.textValue == "I travelled") {
			this.set('template', this.get('dateSelectTemplate'));
		} else if(type.textValue == "I planned") {
			this.set('template', this.get('refSelectTemplate'));
		}
			
		this.rerender();
			
	}.observes('type')
		
});


App.FindController = Ember.Controller.extend({
	
	content: Ember.Object.create( { from: null, to: null } ),
	
	selectRoute: function(route) {
		location.href = "#/route/"+route.id;
	}
	
	
});


App.FindView = Em.View.extend({
	
	//classNames: [ "withOverflow" ],
	
	map: undefined,
	
	searchLocation: undefined,
	
	fromSuggestions: undefined,
	
	toSuggestions: undefined,
	
	results: undefined,
	
	searchResultsHeight: 0,
	
	init: function() {
		
		this._super();
		
		this.set('fromSuggestions', Ember.ArrayProxy.create({ content: [] }));
		this.set('toSuggestions', Ember.ArrayProxy.create({ content: [] }));
		this.set('results', Ember.ArrayProxy.create({ content: [] }));
		
	},
	
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
		
		var map = this.get('map');
		var location = new google.maps.LatLng(searchLocation.lat, searchLocation.lng);
		map.setCenter(location);
		
		toSuggestions.clear();
		fromSuggestions.clear();
		
		if(searchLocation.length == 0) {
			return;
		}
		
		
		var bounds = new google.maps.LatLngBounds();
		
		$.get("service/route?from="+searchLocation.id, function(data) {
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
		
		$.get("service/route?to="+searchLocation.id, function(data) {
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
		
	}.observes('searchLocation')
	
	
});

App.InputTextField = Ember.TextField.extend({
	
	test: function() {
		
		var value = this.get('value');
		
	}
	
});


App.FeedController = Ember.ArrayController.extend({
	
	init: function() {
		this.set('content', []);
	},
	
	getContent: function(tags) {
		
		var query = "";
		
		for(var i=0; i<tags.length; i++) {
			
			query += "%23"+tags[i];
			
			if(i < tags.length-1) {
				query += " OR ";
			}
			
		}
		
		console.log("QUERY: "+query);
		
		this.clear();
		
		var controller = this;
		
		$.ajax({  
			
			url : "https://search.twitter.com/search.json?q="+query+"&lang=en&callback=?",
			dataType : "json",  
			timeout:15000,  
			
			success : function(data)  {  
				
				var results = data.results;
              
				for(var i=0; i<results.length; i++) {
					
					console.log(results[i]);
					
					var post = results[i];
					var text = post.text;
					
					var urlIndex = text.indexOf("http://");
					
					if(urlIndex != -1) {
						
						var text1 = text.substring(0, urlIndex);
						var text2 = text.substring(urlIndex, text.length);
						
						var spaceIndex = text2.indexOf(" ");
						var urlEnd = spaceIndex != -1 ? spaceIndex : text2.length;
						var url = text2.substring(0, urlEnd);
						var text3 = text2.substring(urlEnd);
						var finalText = text1 + "<a href=\""+url+"\">"+url+"</a>" + text3;
						post.text = finalText;
						
						
					}
					
					var feedItemView = Ember.View.create({
						
						image: post.profile_image_url,
						from: post.from_user_name,
						date: post.created_at,
						
  						template: Ember.Handlebars.compile(post.text)
					
					});
					
					controller.addObject(feedItemView);      	
				
				}
			},  
			
			error : function(error)  
			{
				console.log("Failure!");
				console.log(error);
			},
    });  
		
	}
	
});


App.FeedView = Ember.View.extend({
	
	init: function() {
		this._super();
		this.set('controller', App.FeedController.create());
	},
	
	didInsertElement: function() {
		
		//this.get('controller').getContent(["Helsinki"]);
		
	},
	
	searchTagsChanged: function() {
		
		this.get('controller').getContent(App.controller.get('searchTags'));
		
	}.observes('App.controller.searchTags')
	
});


App.RouteController = Ember.Controller.extend({
	
	routeId: undefined,
	
	from: undefined,
	to: undefined,
	
	entries: undefined,
	
	init: function() {
		
		var entries = Ember.ArrayProxy.create( { content: [] });
		this.set('entries', entries);
		
	},
	
	getEntries: function(routeId) {
		
		var entries = this.get('entries');
		
		entries.clear();
		
		var controller = this;
		
		$.get("service/entry?routeId="+routeId, function(data) {
			
			console.log(data);
			
			if(data.length > 0) {
				controller.set('from', data[0].route.from.displayValue);
				controller.set('to', data[0].route.to.displayValue);		
			}
			
			for(var i=0; i<data.length; i++) {
				entries.addObject(
					App.Entry.create({ data: data[i] })
				);
			}
		});
		
	},
	
	selectEntry: function(entry) {
		location.href="#/entry/"+entry.id+"/view";
	},
	
	paramsChanged: function() {
		
		var routeId = this.get('routeId');
		
		this.getEntries(routeId);
		
	}.observes('routeId')
	
	
});


App.RouteView = Ember.View.extend({
	
	didInsertView: function() {
		
	},
	
	contentChanged: function() {
		
		
		
	}.observes('controller.from')
	
});

App.TripsIndexController = Ember.ArrayController.extend({
	
	selectTrip: function(trip) {
		location.href = "#/trip/"+trip.id;
	}
		
});

App.TripsIndexView = Ember.View.extend({
	
});


App.TripController = Ember.ObjectController.extend({

	getEntries: function(tripId) {
		
		var controller = this;
		
		console.log("get entries:");
		
		$.get("service/entry?tripId="+tripId, function(data) {
			console.log(data);
			controller.set('content.entries', data);
			
		});
		
	},
	
	selectEntry: function(entry) {
		location.href = "#/entry/"+entry.id+"/view";
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


App.router = App.Router.create();
App.initialize(App.router);
