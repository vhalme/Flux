App.EntryRoute = Ember.Route.extend({
	
	params: undefined,
	
	controller: undefined,
	
	model: function(params, firstLoad) {
		
		//console.log("PARAMS("+firstLoad+"): ");
		//console.log(params);
		
		var controller = this.get('controller');
		
		if(params != undefined) {
			
			var oldParams = this.get('params');
			
			//console.log("paramscheck: "+(oldParams == params));
			
			if(oldParams == params && firstLoad == undefined) {
				return;
			} else {
				this.set('params', params);
			}
			
		}
		
		if(!controller) {
			return;
		}
		
		//console.log("changing entry content: "+firstLoad+" / "+params.entry_id+" ()");
		
    	if(params.entry_id == "new") {
    		
    		App.controller.set('viewName', "New entry");
    		//App.controller.selectNavLabel("New");
    		
    		controller.set('content', App.Entry.create());
    	
    	} else {
    		
    		App.controller.set('viewName', "");
    		App.Entry.find(params.entry_id, controller);
  		
  		}
  		
  		//console.log("viewname "+App.controller.get('viewName'));
	
	},
	
	setupController: function(controller, model) {
		
		//console.log("setup ctrl");
		this.set('controller', controller);
  		this.model(this.get('params'), true);
  		
  	}
  	
});


App.EntryViewRoute = Ember.Route.extend({
  	
});


App.EntryEditRoute = Ember.Route.extend({
  	
});


App.Entry = App.Model.extend({
	
	path: "entry",
	
	idBinding: 'data.id',
	typeBinding: 'data.type',
	dateBinding: 'data.date',
	referenceBinding: 'data.reference',
	tripBinding: 'data.trip',
	fromBinding: 'data.from',
	toBinding: 'data.to',
	byBinding: 'data.by',
	byIdBinding: 'data.byId',
	byDepTimeBinding: 'data.byDepTime',
	byArrTimeBinding: 'data.byArrTime',
	byAddDaysBinding: 'data.byAddDays',
	scheduleInfoBinding: 'data.scheduleInfo',
	costBinding: 'data.cost',
	depDateYearBinding: 'data.depDateYear',
	depDateMonthBinding: 'data.depDateMonth',
	depDateDayBinding: 'data.depDateDay',
	
	init: function() {
		
		this._super();
		
		if(this.get('data') == null) {
			this.set('data', {});
			this.set('data.trip', App.Trip.create( { displayValue: "(none)" } ));
		}
		
	}
	
});

App.Entry.reopenClass({
	path: "entry"
});


App.Trip = App.Model.extend({
	
	path: "trip",
	
	id: null,
	displayValue: null
	
});

App.EntryController = Ember.ObjectController.extend({
	
	
	init: function() {
		this.set('content', App.Entry.create());
	},
	
	showChange: function() {
		
		//App.controlsController.set('content', [ { actionName: "save" } ]);
		
		
		var type = this.get('content.type');
		var date = this.get('content.date');
		var reference = this.get('content.reference');
		var trip = this.get('content.trip');
		var from = this.get('content.from');
		var to = this.get('content.to');
		var by = this.get('content.by');
		
		console.log(trip + " from "+from+" to "+to+" by "+by+", type "+type+", date "+date+", reference "+reference);
		
		
	}.observes('content.trip', 'content.from', 'content.to', 'content.by', 'content.type', 'content.date', 'content.reference'),
	
	modelUpdated: function(data) {
		
		var entry = App.Entry.create({ data: data });
		this.set('content', entry);
		
	},
	
	saveEntry: function() {
			
		var entry = this.get('content');
		entry.save();
		
	}
	
	
});


App.EntryView = Em.View.extend({
	
	oldContentElem: undefined,
	
	contentType: undefined,
	
	init: function() {
		
		this._super();
		console.log("init entryview");
		Ember.addBeforeObserver(this, 'controller.content', this, 'valueWillChange');
		
	},
	
	valueWillChange: function(obj, keyName, value) {
        
        var element = this.$();
        
        if(element) {
        	var clone = element.clone();
        	this.set('oldContentElem', clone);
        }
        
    },
    
	didInsertElement: function ()
	{
    	
    	console.log("insert entryview");
    	var contentType = Math.random();
		this.set('contentType', contentType);
		
		
	},
	
	
	actionTriggered: function() {
		
		if(action == "save") {
			
			var entry = this.get('controller.content');
			entry.save();
			
		}
		
	}.observes('App.controlsController.selectedAction'),
	
	
	contentChanged: function() {
		
		var entry = this.get('controller.content');
		
		if(entry != undefined) {
			
			var from = entry.get('from');
			var to = entry.get('to');
			
			console.log("FROM/TO>>>");
			console.log(from);
			console.log(to);
			
			if(from != undefined && to != undefined) {
				App.controller.set('searchTags', [ from.localityName, to.localityName ]);
			}
			
		}
		
		var element = this.$();
		
		var contentType = Math.random();
		this.set('contentType', contentType);
		
		
	}.observes('controller.content')
	
	
});


App.EntryContentView = Ember.View.extend({
	
	didInsertElement: function ()
	{
    	
    	console.log("insert entryviewview");
    	var contentType = Math.random();
		this.set('parentView.contentType', contentType);
		
    	this.transitIn();
		
		
	},
	
	transitIn: function() {
		
		var element = this.$();
    	
    	element.addClass("nooverflow");
    	
    	var container = $('#centerSection');
    	
		setTimeout(function() {
		//element.bind('trans-end', function() {
    		container.css("overflow", "");
		//});
		}, 1200);
		
    	setTimeout(function() {
    		
    		element.removeClass("slideOut");
    		element.addClass("slideIn");
    		
    	}, 10);
    	
	},
	
	willDestroyElement: function ()
	{
		
		var clone = this.$().clone();
		clone.css("position", "absolute");
		clone.css("z-index", "-1");
    	this.$().replaceWith(clone);
    	
    	this.transitOut(clone);
		
	},
	
	transitOut: function(clone) {
		
		var container = $('#centerSection');
		//container.css("overflow", "hidden");
		
		
    	setTimeout(function() {
    	//clone.bind('trans-end', function() { 
    		console.log("remove clone");
			console.log(clone);
			clone.remove();
    		delete clone;
    		container.css("overflow", "");
    	//});
    	}, 1200);
		
		setTimeout(function() {
			clone.removeClass("slideIn");
			clone.addClass("slideOut");
		}, 10);
			
	}
	
	
});

App.EntryViewView = App.EntryContentView.extend({
	
	controllerBinding: 'parentView.controller',
	
	entryLoaded: function() {
		
		var entry = this.get('controller.content');
		
		if(entry == undefined) {
			return;	
		}
		
		var from = entry.get('from');
		
		
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
        
        var map = new google.maps.Map(document.getElementById("entryMap"), mapOptions);
        
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
        
        this.set('map', map);
        
        
	}.observes('App.controller.searchTags')
	
});


App.EntryEditView = App.EntryContentView.extend({
	
	controllerBinding: 'parentView.controller'
	
});

