App.RouteRoute = Ember.Route.extend({
	
	model: function(params) {
		console.log("1 route model");
		return App.Route.findOne(params.route_id);
	},
	
	setupController: function(controller, model) {
    	console.log("1 route controller");
    	console.log(model);
    	console.log(controller);
    	controller.set('content', model);
  	}
	
	/*
	params: undefined,
	
	controller: undefined,
	
	model: function(params, firstLoad) {
		
		console.log("PARAMS("+firstLoad+"): ");
		console.log(params);
		
		var controller = this.get('controller');
		
		if(params != undefined) {
			
			var oldParams = this.get('params');
			
			console.log("paramscheck: "+(oldParams == params));
			
			if(oldParams == params && firstLoad == undefined) {
				console.log("failed params check....");
				return;
			} else {
				this.set('params', params);
			}
			
		}
		
		if(!controller) {
			console.log("no controller");
			return;
		}
		
		console.log("updating params");
		
    	controller.set('routeId', params.route_id);
    	
	
	},
	
	setupController: function(controller, model) {
		
		this.set('controller', controller);
  		this.model(this.get('params'), true);
  		
  	}
  	*/
	
});


App.Route = App.Model.extend({
	
	path: "route",
	
	idBinding: 'data.id',
	fromBinding: 'data.from',
	toBinding: 'data.to'
	
	
});

App.Route.reopenClass({
	path: "route"
});


App.RouteController = Ember.ObjectController.extend({
	
	entries: undefined,
	
	init: function() {
		
		this.set('content', {});
		
	},
	
	getEntries: function(routeId) {
		
		var entries = this.get('entries');
		if(entries == undefined) {
			var entries = Ember.ArrayProxy.create( { content: [] });
			this.set('entries', entries);
		}
		
		entries.clear();
		
		var controller = this;
		
		$.get("service/entry?routeId="+routeId, function(data) {
			
			console.log(data);
			
			if(data.length > 0) {
				controller.set('from', data[0].route.from.displayValue);
				controller.set('to', data[0].route.to.displayValue);		
			}
			
			var bgClass = "bgWhite";
			
			for(var i=0; i<data.length; i++) {
				
				var entry = App.Entry.create({ data: data[i] });
				
				bgClass = bgClass == "bgGrey" ? "bgWhite" : "bgGrey";
					
				var entryView = Ember.View.extend({
					
					classNames: [ bgClass ]
				
				});
				
				entry.set('view', entryView);
				
				entries.addObject(entry);
				
			}
		});
		
	},
	
	selectEntry: function(entry) {
		location.href="#/entry/"+entry.id+"/view";
	},
	
	paramsChanged: function() {
		
		var routeId = this.get('content.id');
		if(routeId != undefined) {
			this.getEntries(routeId);
		}
		
	}.observes('content.id')
	
	
});


App.RouteView = Ember.View.extend({
	
	
	init: function() {
		
		this._super();
		
		this.set('controller', App.RouteController.create());
		
	},
	
	contentChanged: function() {
		
	}.observes('controller.from')
	
});