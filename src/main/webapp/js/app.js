var App = Ember.Application.create();

App.map = new google.maps.Map(document.getElementById("map"), {});

App.ApplicationController = Ember.Controller.extend({
	
	viewName: "Add entry",
	
	action: undefined,
	
	setAction: function(param) {
		
		this.set('action', "save");
		
	}
	
});

App.controller = App.ApplicationController.create();

App.ApplicationView = Ember.View.extend({
	
	controllerBinding: 'App.controller',
	
	templateName: 'application'

});


App.Router.map(function() {
	
	this.resource("find", function() {
		this.route("index", { path: "/" });
	});
	
  	this.resource("add_entry", function() {
  		this.route("index", { path: "/" });
  		this.route("date");
  		this.route("reference");
  	});

});

App.IndexRoute = Ember.Route.extend({
	
	redirect: function() {
    	this.transitionTo("add_entry");
  	}
  	
});

App.AddEntryIndexRoute = Ember.Route.extend({
	
	enter: function() {
		console.log("enter addentry");
		App.get('controller').set('viewName', "Add entry");
	},
	
	redirect: function() {
    	this.transitionTo("add_entry.date");
  	}
  	
});

App.FindIndexRoute = Ember.Route.extend({
	
	enter: function() {
		console.log("enter find");
		App.get('controller').set('viewName', "Find");
	},
	
});

/*
App.Store = DS.Store.extend({
  revision: 11,
  adapter: DS.RESTAdapter.create({
    namespace: 'api'
  })
});

App.Entry = DS.Model.extend({

	type: DS.attr('string'),
	date: DS.attr('string'),
	reference: DS.attr('string'),
	trip: DS.attr('string'),
	from: DS.attr('string'),
	to: DS.attr('string'),
	by: DS.attr('string')
	
});
*/

App.Model = Ember.Object.extend({
	
	path: "",
	
	save: function() {
		
		var json = JSON.stringify(this, null, 2);
		
		//console.log("sending: \n"+json);
		
		$.ajax({
  			
  			type: "POST",
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

App.Entry = App.Model.extend({
	
	path: "entry",
	
	type: null,
	date: null,
	reference: null,
	trip: null,
	from: null,
	to: null,
	by: null
	
});
		
function testData() {
	
	var entry = App.Entry.create();
	entry.save();
	//App.entry.post();
	
}

testData();


/** OTHER STUFF **/

App.testVal = null;

App.EntryController = Ember.ObjectController.extend({
	
	init: function() {
		
		this.set('content', App.Entry.create());	
	
	},
	
	val: undefined,
	
	showChange: function() {
		
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


App.DateInputView = Ember.View.extend({	
}),

App.ReferenceInputView = Ember.View.extend({
}),

App.CenterSectionContentView = Ember.View.extend({
	
});

App.AddEntryView = Em.View.extend({
	
	classNames: [ "nooverflow" ],
	
	entryController: undefined,
	
	init: function() {
		
		this._super();
		this.set('entryController', App.EntryController.create());
		
	},
	
	didInsertElement: function ()
	{
    	
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
