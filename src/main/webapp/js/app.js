var App = Ember.Application.create({
    
});

App.map = new google.maps.Map(document.getElementById("map"), {});

App.params = {
	pNew: Ember.Object.create({
  		entry_id: "new"
	})
};


App.NavLabelView = Ember.View.extend({
	
	tagName: 'li',
	
	classNames: [ "handCursor" ],
	
	classNameBindings: 'active',
	
	active: false,
	
	value: undefined,
	
	uri: undefined,
	
	select: function() {
		location.href = this.get('uri');
	}
	
});

App.ApplicationController = Ember.Controller.extend({
	
	searchTags: [],
	
	navLabels: [ 
	             App.NavLabelView.create({ active: true, value: "New", uri: "#/entry/new/edit" }), 
	             App.NavLabelView.create({ active: false, value: "Find", uri: "#/find" }), 
	             App.NavLabelView.create({ active: false, value: "Trips", uri: "#/trips" })   
	           ],
	           
	selectNavLabel: function(navLabel) {
		
		var navLabels = this.get('navLabels');
		for(var i=0; i<navLabels.length; i++) {
			if(navLabels[i].get('value') == navLabel) {
				navLabels[i].set('active', true);
				location.href = navLabels[i].get('uri');
			} else {
				navLabels[i].set('active', false);
			}
		}
		
	}
	
	
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
  		this.route("view", { path: "/view" });
  		this.route("edit", { path: "/edit" });
  	});
  	
  	this.resource("route", { path: "/route/:route_id" }, function() {
  		this.route("edit", { path: "/edit" });
  	});
  	
  	this.resource("trip", { path: "/trip/:trip_id" }, function() {
  		this.route("view", { path: "/view" });
  		this.route("edit", { path: "/edit" });
  	});
  	
  	this.resource("trips", { path: "/trips" }, function() {
  		this.route("index", { path: "/" });
  	});
  	
});


App.IndexRoute = Ember.Route.extend({
	
	enter: function() {
    	location.href = "#/entry/new/edit";
  	}
  	
});

	
App.Model = Ember.Object.extend({
	
	path: undefined,
	
	data: null,
	
	init: function() {
	},
	
	save: function(callback) {
		
		var path = this.get('path');
		
		var json = JSON.stringify(this.get('data'), null, 2);
		
		console.log("sending: \n"+json);
		
		$.ajax({
  			
  			type: "PUT",
  			url: "service/"+path,
  			dataType: "json",
  			contentType: 'application/json',
  			data: json,
  			success: function(data) {
  				console.log("success: "+data.id);
  				callback(data);
  			}
  
		});
		
	},
	
	test: function() {
		//console.log("test");
	}
	
});


App.Model.reopenClass({
	
	findAll: function() {
		
		var model = this;
		var result = Ember.ArrayProxy.create({
			content: []
		})
		
		$.ajax({
  			
  			type: "GET",
  			url: "service/"+model.path,
  			dataType: "json",
  			contentType: 'application/json',
  			success: function(data) {
  				console.log("content received: "+data);
  				for(var i=0; i<data.length; i++) {
  					result.addObject(data[i]);
  				}
  			}
  
		});
		
		return result;
		
	},
	
	findOne: function(id) {
		
		var model = this.create();
		console.log(model)
		
		$.ajax({
  			
  			type: "GET",
  			url: "service/"+model.path+"/"+id,
  			dataType: "json",
  			contentType: 'application/json',
  			success: function(data) {
  				console.log("content received: "+data);
  				model.set('data', data);
  			}
  
		});
		
		return model;
		
	},
	
	find: function(id, controller) {
		
		var model = this;
		
		$.ajax({
  			
  			type: "GET",
  			url: "service/"+model.path+"/"+id,
  			dataType: "json",
  			contentType: 'application/json',
  			success: function(data) {
  				console.log("content received: "+data);
  				controller.modelUpdated(data);
  			}
  
		});
		
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
		
		if(type.textValue == "I travelled") {
			this.set('template', this.get('dateSelectTemplate'));
		} else if(type.textValue == "I planned") {
			this.set('template', this.get('refSelectTemplate'));
		}
			
		this.rerender();
			
	}.observes('type')
		
});

App.router = App.Router.create();
App.initialize(App.router);
