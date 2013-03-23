App.RegisterRoute = Ember.Route.extend({
	
});


App.RegisterController = Ember.Controller.extend({
	
	email: undefined,
	
	password: undefined,
	
});


App.RegisterView = Ember.View.extend({
	
	controller: App.RegisterController.create(),
	
	init: function() {
		this._super();
	}
	
});