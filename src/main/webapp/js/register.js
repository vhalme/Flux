App.RegisterRoute = Ember.Route.extend({
	
});


App.RegisterController = Ember.Controller.extend({
	
	testVal: "test2"
	
});


App.RegisterView = Ember.View.extend({
	
	controller: App.RegisterController.create(),
	
	init: function() {
		this._super();
	}
	
});