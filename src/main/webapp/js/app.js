var App = Ember.Application.create();

App.map = new google.maps.Map(document.getElementById("map"), {});

App.ApplicationController = Ember.Controller.extend({
	viewName: "Add entry"
});

App.ApplicationView = Ember.View.extend({
	templateName: 'application'
});


App.Router.map(function() {
	
	this.resource("find");
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
	
	redirect: function() {
    	this.transitionTo("add_entry.date");
  	}
  	
});

/** OTHER STUFF **/

App.AddEntryController = Ember.ObjectController.extend({
	
	init: function() {
		this.set('content', Ember.Object.create());	
	},
	
	entryType: -1,
	trip: undefined,
	from: undefined,
	to: undefined,
	by: undefined
	
});


App.DateInputView = Ember.View.extend({	
}),

App.ReferenceInputView = Ember.View.extend({
}),

App.CenterSectionContentView = Ember.View.extend({
	
});

App.AddEntryView = Em.View.extend({
	
	classNames: [ "nooverflow" ],
	
	init: function() {
		
		this._super();
		this.set('controller', App.AddEntryController.create());
			
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
