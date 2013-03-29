App.RegisterRoute = Ember.Route.extend({
	
});


App.RegisterController = Ember.Controller.extend({
	
	email: undefined,
	
	username: undefined,
	
	password: undefined,
	
	register: function() {
		
		var email = this.get('email');
		var username = this.get('username');
		var password = this.get('password');
		
		var regObj = {
				email: email,
				username: username,
				password: password
		}
		
		var json = JSON.stringify(regObj, null, 2);
		console.log(json);
		
		$.ajax({
  			
  			type: "POST",
  			url: "service/register",
  			dataType: "json",
  			contentType: "application/json",
  			data: json,
  			success: function(data) {
  				console.log("reg ok");
  			}
  
		});
		
	}

});


App.RegisterView = Ember.View.extend({
	
	controller: App.RegisterController.create(),
	
	init: function() {
		this._super();
	}
	
});