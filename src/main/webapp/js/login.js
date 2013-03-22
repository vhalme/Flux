App.LoginRoute = Ember.Route.extend({
	
});


App.LoginController = Ember.Controller.extend({
	
	testVal: "test1"
	
});


App.LoginView = Ember.View.extend({
	
	controller: App.LoginController.create(),
	
	init: function() {
		this._super();
	}
	
});