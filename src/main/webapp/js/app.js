var App = Ember.Application.create();

App.map = new google.maps.Map(document.getElementById("map"), {});

App.params = {
	pNew: Ember.Object.create({
  		entry_id: "new"
	})
};

App.ApplicationController = Ember.Controller.extend({
	
	viewName: "",
	
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
  		this.route("edit", { path: "/edit" });
  	});
  	
});


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


App.FindRoute = Ember.Route.extend({
	
	setupController: function(controller, model) {
		
		controller.set('content', Ember.Object.create({ from: null, to: null }));
		App.controller.set('viewName', "Find");
  		
  	}
  	
});

App.IndexRoute = Ember.Route.extend({
	
	enter: function() {
    	location.href = "#/entry/new";
  	}
  	
});

	
App.Model = Ember.Object.extend({
	
	path: undefined,
	
	data: null,
	
	init: function() {
	},
	
	save: function() {
		
		var json = JSON.stringify(this.get('data'), null, 2);
		
		//console.log("sending: \n"+json);
		
		$.ajax({
  			
  			type: "PUT",
  			url: "/TravellerLog/service/"+this.get('path'),
  			dataType: "json",
  			contentType: 'application/json',
  			data: json,
  			success: function(data) {
  				console.log("success: "+data.id);
  				location.href="#/entry/"+data.id;
  			}
  
		});
		
	},
	
	test: function() {
		//console.log("test");
	}
	
});


App.Model.reopenClass({
	
	find: function(id, controller) {
		
		var model = this;
		
		$.ajax({
  			
  			type: "GET",
  			url: "/TravellerLog/service/"+model.path+"/"+id,
  			dataType: "json",
  			contentType: 'application/json',
  			success: function(data) {
  				console.log("content received: "+data);
  				controller.modelUpdated(data);
  				//controller.set('content', App.Entry.create({ data: data }));
  				//App.get('controller').set('viewName', data.from.displayValue+" - "+data.to.displayValue);
  			}
  
		})
		
	}
		
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
	displayValue: null,
	
	/*
	init: function() {
		
		this._super();
		
		if(this.get('data') == null) {
			this.set('data', {});
		}
		
	}
	*/
	
});

App.EntryController = Ember.ObjectController.extend({
	
	
	init: function() {
		this.set('content', App.Entry.create());
	},
	
	showChange: function() {
		
		App.controlsController.set('content', [ { actionName: "save" } ]);
		
		
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
		
	}
	
	
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
		
		if(type.textValue == "I travelled this route") {
			this.set('template', this.get('dateSelectTemplate'));
		} else if(type.textValue == "I researched this route") {
			this.set('template', this.get('refSelectTemplate'));
		}
			
		this.rerender();
			
	}.observes('type')
		
});


App.EntryView = Em.View.extend({
	
	templateName: 'entry',
	
	oldContentElem: undefined,
	
	contentType: undefined,
	
	init: function() {
		
		this._super();
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
    	
    	var contentType = Math.random();
		this.set('contentType', contentType);
		
    	this.transitIn();
		
		
	},
	
	transitIn: function() {
		
		var element = this.$();
    	
    	element.addClass("nooverflow");
    	
    	var container = $('#centerSection .centerSectionContent');
    	container.css("height", (($(window).height()-container.offset().top))+"px");
		container.css("overflow", "hidden");
		
		element.bind('trans-end', function() {
    		container.css("overflow", "");
    		var docHeight = $(document).height();
			$("#document").height((docHeight)+"px");
		});
		
    	setTimeout(function() {	
    		
    		element.removeClass("verticalSlideDown");
    		element.addClass("verticalSlideUp");
    		
    	}, 10);
    	
	},
	
	willDestroyElement: function ()
	{
		
		//console.log("will destroy entry");
		
		App.controlsController.set('content', []);
		
		var clone = this.$().clone();
    	this.$().replaceWith(clone);
    	
    	this.transitOut(clone);
		
	},
	
	transitOut: function(clone) {
		
		var container = $('#centerSection .centerSectionContent');
    	container.css("height", (($(window).height()-container.offset().top))+"px");
		container.css("overflow", "hidden");
		
		clone.css("z-index", -1);
		
    	setTimeout(function() {
    	//clone.bind('trans-end', function() { 
    		console.log("remove clone");
			console.log(clone);
			clone.remove();
    		delete clone;
    		container.css("overflow", "");
		}, 1200);
		
		setTimeout(function() {
			clone.removeClass("verticalSlideUp");
			clone.addClass("verticalSlideDown");
		}, 0);
			
	},
	
	
	actionTriggered: function() {
		
		var action = App.controlsController.get('selectedAction');
		
		if(action == "save") {
			
			var entry = this.get('controller.content');
			entry.save();
			
			App.controlsController.set('content', []);
			
		}
		
		if(action != null) {
			App.controlsController.set('selectedAction', null);	
		}
		
	}.observes('App.controlsController.selectedAction'),
	
	
	contentChanged: function() {
		
		var element = this.$();
		
		var contentType = Math.random();
		this.set('contentType', contentType);
		
		if(element != undefined) {
			
			element.toggleClass("verticalSlideUp");
			
			var clone = this.get('oldContentElem');
			if(clone != undefined) {
				this.get('parentView').$().append(clone);
				this.transitOut(clone);
			}
			
			this.transitIn();
			
		}
		
	}.observes('controller.content')
	
	
});


App.FindController = Ember.Controller.extend({
	
	content: Ember.Object.create( { from: null, to: null } ),
	
	selectFromTerm: function(param) {
		this.set('to', null);
		this.set('from', param.from);
	},

	selectToTerm: function(param) {
		this.set('from', null);
		this.set('to', param.to);
	},
	
	selectEntry: function(entry) {
		location.href = "#/entry/"+entry.id;	
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
		
		var mapOptions = {
        	
        	center: new google.maps.LatLng(-34.397, 150.644),
          	zoom: 8,
          	mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        var map = new google.maps.Map(document.getElementById("findMap"), mapOptions);
        
        this.set('map', map);
        
		var element = this.$();
		
    	var searchBox = element.find(".searchBox");
		var searchResults = element.find(".searchResults");
		
		var container = $('#centerSection .centerSectionContent');
		container.css("height", (($(window).height()-container.offset().top))+"px");
		container.css("overflow", "hidden");
		
		searchBox.bind('trans-end', function() {
    		container.css("overflow", "");
		});
		
		setTimeout(function() {
			searchBox.removeClass("rollOut");
			searchBox.addClass("rollIn");
			searchResults.removeClass("searchResultsSlideDown");
			searchResults.addClass("searchResultsSlideUp");
		}, 10);
    	
		
	},
	
	willDestroyElement: function ()
	{
		
		var clone = this.$().clone();
    	this.$().replaceWith(clone);
    	
    	clone.css("z-index", -1);
    	
		var searchBox = clone.find(".searchBox");
		var searchResults = clone.find(".searchResults");
		searchResults.css("z-index", -1);
		
		var container = $('#centerSection .centerSectionContent');
		container.css("height", (($(window).height()-container.offset().top))+"px");
		container.css("overflow", "hidden");
		
		var docHeight = $(document).height();
		$("#document").height(($(window).height())+"px");
		
		searchBox.bind('trans-end', function() {
    		clone.remove();
    		delete clone;
    		container.css("overflow", "");
    		container.css("height", "");
		});
		
		setTimeout(function() {
			searchBox.removeClass("rollIn");
			searchBox.addClass("rollOut");
			searchResults.removeClass("searchResultsSlideUp");
			searchResults.addClass("searchResultsSlideDown");
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
		
		$.get("/TravellerLog/service/entry?from="+searchLocation.id, function(data) {
			for(var i=0; i<data.length; i++) {
				toSuggestions.addObject(
					App.Entry.create({ data: data[i] })
				);
			}
		});
		
		$.get("/TravellerLog/service/entry?to="+searchLocation.id, function(data) {
			for(var i=0; i<data.length; i++) {
				fromSuggestions.addObject(
					App.Entry.create({ data: data[i] })
				);
			}
		});
		
	}.observes('searchLocation'),
	
	searchTermsSelected: function() {
		
		var from = this.get('controller.from');
		var to = this.get('controller.to');
		
		if(this.get('searchLocation') == undefined) {
			return;
		}
		
		if(from == undefined && to == undefined) {
			return;
		}
		
		if(from != null) {
			to = this.get('searchLocation');
		} else if(to != null) {
			from = this.get('searchLocation');
		}
		
		var results = this.get('results');
		results.clear();
		
		if(from == null && to == null) {
			return;
		}
		
		console.log(from.id+" "+to.id);
		
		var view = this;
		var oldDocHeight = $(document).height();
		
		$.get("/TravellerLog/service/entry?from="+from.id+"&to="+to.id, function(data) {
			
			for(var i=0; i<data.length; i++) {
				results.addObject(
					App.Entry.create({ data: data[i] })
				);
			}
			
			setTimeout(function() {
				
				var docHeight = $(document).height();
				$("#document").height((docHeight)+"px");
				
			}, 100);
			
		});
		
	}.observes('controller.from', 'controller.to')
	
});

App.router = App.Router.create();
App.initialize(App.router);
