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
  				//console.log("success: "+data);	
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
	
	classNames: [ "nooverflow" ],
	
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
    	
    	//console.log("did insert entry");
    	
    	
    	var element = this.$();
		
		App.transition.comingIn = element;
    	element.top = 600;
    	
    	App.transition.animate();
		
		
	},
	
		
	willDestroyElement: function ()
	{
		
		//console.log("will destroy entry");
		
		App.controlsController.set('content', []);
		
		
		var clone = this.$().clone();
    	this.$().replaceWith(clone);
    	
    	
    	App.transition.goingOut = clone;
    	clone.top = 0;
    	
    	App.transition.animate();
    	
    	
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
		
		var oldElem = this.get('oldContentElem');
		
		var element = this.$();
		
		this.set('contentType', (new Date().getTime()));
		
		if(oldElem && !App.transition.animatingOut) {
			
			var parentElem = element.parent();
			
			parentElem.append(oldElem);
			
			App.transition.goingOut = oldElem;
    		oldElem.top = 0;
    		
    		App.transition.comingIn = element;
    		element.top = 600;
			
			App.transition.animate();
			
			
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
	
	classNames: [ "withOverflow" ],
	
	searchLocation: undefined,
	
	fromSuggestions: Ember.ArrayProxy.create({ content: [] }),
	
	toSuggestions: Ember.ArrayProxy.create({ content: [] }),
	
	results: Ember.ArrayProxy.create({ content: [] }),
	
	
	didInsertElement: function() {
		
		//console.log("did insert find");
		
		var mapOptions = {
        	
        	center: new google.maps.LatLng(-34.397, 150.644),
          	zoom: 8,
          	mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        var map = new google.maps.Map(document.getElementById("findMap"), mapOptions);
            
		var element = this.$();
		
		App.findTransition.comingIn = element;
		element.deg = 90;
    	element.top = -396;
    	element.z = -110;
    	
    	console.log("gonna animate...");
    	App.findTransition.animate();
		
		
	},
	
	willDestroyElement: function ()
	{
		
		//console.log("will destroy find");
		
		var clone = this.$().clone();
    	this.$().replaceWith(clone);
    	
    	App.findTransition.goingOut = clone;
    	clone.deg = 0;
    	clone.top = 0;
    	clone.z = 0;
    	
    	App.findTransition.animate();
    	//console.log("will animate out:");
		//console.log(App.transition.goingOut);
		
	},
	
	searchTermsChanged: function() {
		
		var searchLocation = this.get('searchLocation');
		var toSuggestions = this.get('toSuggestions');
		var fromSuggestions = this.get('fromSuggestions');
		
		toSuggestions.clear();
		fromSuggestions.clear();
		
		if(searchLocation.length == 0) {
			return;
		}
		
		//console.log("SEARCHLOCATION CHANGE: ID="+searchLocation.id);
		
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
			//console.log(to+"/"+from);
			//console.log("both undefined");
			return;
		}
		
		console.log(from.id+" "+to.id);
		
		$.get("/TravellerLog/service/entry?from="+from.id+"&to="+to.id, function(data) {
			for(var i=0; i<data.length; i++) {
				results.addObject(
					App.Entry.create({ data: data[i] })
				);
			}
		});
		
	}.observes('controller.from', 'controller.to')
	
});

App.router = App.Router.create();
App.initialize(App.router);
