App.transition = Ember.Object.create({
	
	comingIn: undefined,
	
	goingOut: undefined,
	
	animate: function() {
		
		this.animateOut(this.get('animateOut'));
		this.animateIn(this.get('animateIn'));
		
	},
	
	animateOut: function(func) {
		
		var element = App.transition.goingOut;
		
		if(!element) {
			return;
		}
		
		var deg = element.deg;
		var top = element.top;
		var z = element.z;
		
		element.deg = deg-4;
		element.top = top+24;
		element.z = z-5;
		
		var rotVal = "perspective(600px) translateY("+(top)+"px) translateZ("+z+"px) rotateX("+deg+"deg)";
		
		if(deg > -90) {
			
			element.css("transform", rotVal);
			element.css("-webkit-transform", rotVal); /* Safari and Chrome */
			element.css("-moz-transform", rotVal); /* Firefox */
			
		}
		
		if(deg > -90) {
			
			setTimeout(func, 25, func);
		
		} else {
			
			console.log("DESTROY ELEM");
			
			element.css("display", "none");
			element.css("visibility", "hidden");
			element.remove();
			element = null;
			delete element;
			
			var newElement = App.transition.comingIn;
			newElement.css("display", "block");
			newElement.css("visibility", "visible");
			
		}
		
	},
	
	animateIn: function(func) {
		
		var element = App.transition.comingIn;
		
		if(!element) {
			return;
		}
		
		var deg = element.deg-4;
		var top = element.top+18;
		var z = element.z+5;
		
		if(deg < 0) { deg = 0 }
		
		element.deg = deg;
		element.top = top;
		element.z = z;
		
		var rotVal = "perspective(600px) translateY("+(top)+"px) translateZ("+z+"px) rotateX("+deg+"deg)";
		
		if(deg >= 0) {
			
			element.css("transform", rotVal);
			element.css("-webkit-transform", rotVal); /* Safari and Chrome */
			element.css("-moz-transform", rotVal); /* Firefox */
			
		}
		
		if(deg > 0) {
			
			setTimeout(func, 25, func);
		
		} else {
			
			rotVal = "none";
			
			element.css("transform", rotVal);
			element.css("-webkit-transform", rotVal);
			element.css("-moz-transform", rotVal);
			
		}
		
	}
		
});