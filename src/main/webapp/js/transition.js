App.transition = Ember.Object.create({
	
	animatingOut: false,
	
	comingIn: undefined,
	
	goingOut: undefined,
	
	animate: function() {
		
		this.set('animatingOut', true);
		
		this.animateOut(this.get('animateOut'));
		this.animateIn(this.get('animateIn'));
		
	},
	
	animateOut: function(func) {
		
		//console.log(App.transition.goingOut);
		
		var element = App.transition.goingOut;
		
		if(!element) {
			App.transition.set('animatingOut', false);
			return;
		}
		
		//var deg = element.deg;
		var top = element.top;
		//var z = element.z;
		
		//element.deg = deg-4;
		element.top = top+10;
		//element.z = z-5;
		
		//var rotVal = "perspective(600px) translateY("+(top)+"px) translateZ("+z+"px) rotateX("+deg+"deg)";
		
		if(top < 600) {
			
			//element.css("transform", rotVal);
			//element.css("-webkit-transform", rotVal); /* Safari and Chrome */
			//element.css("-moz-transform", rotVal); /* Firefox */
			
			element.css("top", top+"px");
		}
		
		if(top < 600) {
			
			setTimeout(func, 25, func);
		
		} else {
			
			//console.log("DESTROY ELEM");
			
			element.css("display", "none");
			element.css("visibility", "hidden");
			element.remove();
			element = null;
			delete element;
			
			var newElement = App.transition.comingIn;
			newElement.css("display", "block");
			newElement.css("visibility", "visible");
			
			App.transition.set('animatingOut', false);
			
			//console.log("animatingOut: "+App.transition.get('animatingOut'));
			
		}
		
	},
	
	animateIn: function(func) {
		
		var element = App.transition.comingIn;
		
		//console.log("an in");
		
		if(!element) {
			return;
		}
		
		//var deg = element.deg-4;
		var top = element.top-10;
		//var z = element.z+5;
		
		//if(deg < 0) { deg = 0 }
		
		//element.deg = deg;
		element.top = top;
		//element.z = z;
		
		//var rotVal = "perspective(600px) translateY("+(top)+"px) translateZ("+z+"px) rotateX("+deg+"deg)";
		
		if(top > 0) {
			
			//element.css("transform", rotVal);
			//element.css("-webkit-transform", rotVal); /* Safari and Chrome */
			//element.css("-moz-transform", rotVal); /* Firefox */
			element.css("top", top+"px");
			
		}
		
		if(top > 0) {
			
			setTimeout(func, 25, func);
		
		} else {
			
			//rotVal = "none";
			
			//element.css("transform", rotVal);
			//element.css("-webkit-transform", rotVal);
			//element.css("-moz-transform", rotVal);
			element.css("top", "0px");
		}
		
	}
		
});

App.findTransition = Ember.Object.create({
	
	animatingOut: false,
	
	goingOut: undefined,
	
	animate: function() {
		
		this.set('animatingOut', true);
		
		this.animateOut(this.get('animateOut'));
		this.animateIn(this.get('animateIn'));
		
	},
	
	animateOut: function(func) {
		
		//console.log(App.transition.goingOut);
		
		var element = App.findTransition.goingOut;
		
		if(!element) {
			App.findTransition.set('animatingOut', false);
			return;
		}
		
		var searchBox = element.find(".findContent");
		//var searchResults = element.find(".searchResults");
		
		var deg = element.deg;
		var top = element.top;
		var z = element.z;
		
		element.deg = deg+1;
		//element.top = top-6;
		//element.z = z+5;
		
		console.log("anim "+deg+" deg");
		
		var rotVal = "perspective(600px) rotateX("+deg+"deg)"; // translateY("+(top)+"px) translateZ("+z+"px)";
		
		if(deg < 90) {
			
			searchBox.css("transform", rotVal);
			searchBox.css("-webkit-transform", rotVal); /* Safari and Chrome */
			searchBox.css("-moz-transform", rotVal); /* Firefox */
			
			//searchResults.css("width", (110-z)+"px");
			
		}
		
		if(deg < 90) {
			
			setTimeout(func, 25, func);
		
		} else {
			
			//console.log("DESTROY ELEM");
			
			element.css("display", "none");
			element.css("visibility", "hidden");
			element.remove();
			element = null;
			delete element;
			
			//var newElement = App.transition.comingIn;
			//newElement.css("display", "block");
			//newElement.css("visibility", "visible");
			
			App.findTransition.set('animatingOut', false);
			
			//console.log("animatingOut: "+App.transition.get('animatingOut'));
			
		}
		
	},
	
	animateIn: function(func) {
		
		//console.log("animating in");
		var element = App.findTransition.comingIn;
		
		if(!element) {
			return;
		}
		
		var searchBox = element.find(".findContent");
		
		var deg = element.deg-4;
		var top = element.top+18;
		var z = element.z+5;
		
		if(deg < 0) { deg = 0 }
		
		element.deg = deg;
		element.top = top;
		element.z = z;
		
		var rotVal = "perspective(600px) translateY("+(top)+"px) translateZ("+z+"px) rotateX("+deg+"deg)";
		
		if(deg >= 0) {
			
			searchBox.css("transform", rotVal);
			searchBox.css("-webkit-transform", rotVal); /* Safari and Chrome */
			searchBox.css("-moz-transform", rotVal); /* Firefox */
			
		}
		
		if(deg > 0) {
			
			setTimeout(func, 25, func);
		
		} else {
			
			rotVal = "none";
			
			searchBox.css("transform", rotVal);
			searchBox.css("-webkit-transform", rotVal);
			searchBox.css("-moz-transform", rotVal);
			
		}
		
	}
	
	
});