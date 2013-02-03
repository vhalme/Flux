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
	
	model: function(params) {
		
		console.log("params changed");
		
		this.set('params', params);
		
		//var params = this.get('params');
		
		var controller = this.get('controller');
		
		if(!controller) {
			return;
		}
		
		//console.log(params);
		
    	if(params.entry_id == "new") {
    		
    		App.controller.set('viewName', "New entry");
    		controller.set('content', App.Entry.create());
    	
    	} else {
    		
    		App.controller.set('viewName', "");
    		App.Entry.find(params.entry_id, controller);
  		
  		}
  		
  		console.log("viewname "+App.controller.get('viewName'));
	
	},
	
	setupController: function(controller, model) {
		
		this.set('controller', controller);
  		
  		console.log("set ctrl");
  		
  		this.model(this.get('params'));
  		
  	}
  	
});

App.IndexRoute = Ember.Route.extend({
	
	enter: function() {
    	location.href = "#/entry/new";
  	}
  	
});


App.FindIndexRoute = Ember.Route.extend({
	
	enter: function() {
		App.get('controller').set('viewName', "Find");
	},
	
});

	
App.Model = Ember.Object.extend({
	
	path: undefined,
	
	save: function() {
		
		var json = JSON.stringify(this, null, 2);
		
		console.log("sending: \n"+json);
		
		$.ajax({
  			
  			type: "PUT",
  			url: "/TravellerLog/service/"+this.get('path'),
  			dataType: "json",
  			contentType: 'application/json',
  			data: json,
  			success: function(data) {
  				console.log("success: "+data);	
  			}
  
		});
		
	},
	
	test: function() {
		console.log("test");
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
  				controller.set('content', data);
  				//App.get('controller').set('viewName', data.from.displayValue+" - "+data.to.displayValue);
  			}
  
		})
		
	}
		
});

App.Entry = App.Model.extend({
	
	id: null,
	type: null,
	date: null,
	reference: null,
	trip: null,
	from: null,
	to: null,
	by: null
	
});

App.Entry.reopenClass({
	path: "entry"
});



App.EntryController = Ember.ObjectController.extend({
	
	init: function() {
		
		this.set('content', App.Entry.create());
		
	},
	
	val: undefined,
	
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
		
		
	}.observes('content.trip', 'content.from', 'content.to', 'content.by', 'content.type', 'content.date', 'content.reference')
	
});


App.CenterSectionContentView = Ember.View.extend({
	
	/*
	currentView: undefined,
	
	didInsertElement: function() {
		
		var view = App.EntryView.create();
		this.set('currentView', view);
		this.get('childViews').pushObject(view);
		
		
	},
	
	changeView: function() {
		
		var currentView = this.get('currentView');
		currentView.remove();
		currentView.destroy();
		
		this.get('childViews').removeObject(0);
		
		var view = App.EntryView.create();
		this.set('currentView', view);
		this.get('childViews').pushObject(view);
			
	}.observes('App.controller.viewName')
	*/
	
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
	
	init: function() {
		
		this._super();
		//this.set('controller', App.EntryController.create());
		Ember.addBeforeObserver(this, 'controller.content', this, 'valueWillChange');
		
	},
	
	valueWillChange: function(obj, keyName, value){
        
        console.log("value will change...");
        
        var element = this.$();
        //console.log(element);
        
        if(element) {
        	var clone = element.clone();
        	this.set('oldContentElem', clone);
        }
        
    },
    
	didInsertElement: function ()
	{
    	
    	/*
    	var element = this.$(); //Ember.$(this.get('element'));
		
		App.transition.comingIn = element;
		element.deg = 90;
    	element.top = -396;
    	element.z = -110;
    	
    	console.log("ANIMATE IN SET UP");
    	App.transition.animate();
		*/
		
	},
	
		
	willDestroyElement: function ()
	{
		
		App.controller.set('actions', []);
		
		/*
		var clone = this.$().clone(); //Ember.$(this.get('element')).clone();
    	this.$().replaceWith(clone); //Ember.$(this.get('element')).replaceWith(clone);
    	
    	
    	App.transition.goingOut = clone;
    	clone.deg = 0;
    	clone.top = 0;
    	clone.z = 0;
    	
    	console.log("ANIMATE OUT CLONE SET UP");
    	*/
    	
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
			console.log("action: "+action);
		}
		
	}.observes('App.controlsController.selectedAction'),
	
	
	contentChanged: function() {
		
		console.log("content changed:");
		console.log(this.get('controller.content'));
		
		var oldElem = this.get('oldContentElem');
		
		var element = this.$(); //Ember.$(this.get('element'));
		
		//var parentView = this.get('parentView');
		
			
		if(oldElem) {
			
			var parentElem = element.parent();
			
			//var newElem = element.clone();
			
			
			//this.$().replaceWith(this.$().clone());
			
			
			element.css("display", "none");
			element.css("visibility", "hidden");
			
			parentElem.append(oldElem);
			
			
			//parentElem.append(oldElem);
			App.transition.goingOut = oldElem;
    		oldElem.deg = 0;
    		oldElem.top = 0;
    		oldElem.z = 0;
    		
    		//console.log("coming in: "+newElem);
    		//parentElem.append(newElem);
    		
    		App.transition.comingIn = element;
			element.deg = 90;
    		element.top = -396;
    		element.z = -110;
			
			App.transition.animate();
			
			
		}
		
		//console.log(element);
		
		
	}.observes('controller.content')
	
	
});


App.FindController = Ember.ObjectController.extend({
});


App.FindView = Em.View.extend({
	
	classNames: [ "nooverflow" ],
	
	didInsertElement: function() {
		
		var element = this.$();
		
		App.transition.comingIn = element;
		element.deg = 90;
    	element.top = -396;
    	element.z = -110;
    	
    	App.transition.animate();
		
		
	},
	
	willDestroyElement: function ()
	{
		
		
		var clone = this.$().clone();
    	this.$().replaceWith(clone);
    	
    	App.transition.goingOut = clone;
    	clone.deg = 0;
    	clone.top = 0;
    	clone.z = 0;
		
		
	}
	
});

App.router = App.Router.create();
App.initialize(App.router);
