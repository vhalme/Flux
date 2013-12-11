var controllers = angular.module('controllers', []);

angular.module('filters', []).filter('truncate', function () {
    
	return function (text, length, end) {
		
		text = ""+text;
		
		if(isNaN(length))
			length = 10;

        if(end === undefined)
        	end = "...";

        if(text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length-end.length) + end;
        }

    };
});

myApp.directive('customstyle', function () {
	
	return {
		
		restrict: 'AC',
		link: function (scope, element, attrs) {          
			
			element.css('width', attrs.myWidth);
			
			scope.$watch(attrs.myWidth, function(value) {     
				//console.log("myWidth: "+value);
				var pctVal = value*100;
				//console.log("pctVal="+pctVal);
				if(100-pctVal < 0.1) {
					pctVal = 100;
				}
				element.css('width', pctVal+'%');            
			});
			
		}
		
   }
	
});


var INTEGER_REGEXP = /^\-?\d*$/;
myApp.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('integer', true);
          return viewValue;
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('integer', false);
          return undefined;
        }
      });
    }
  };
});
 
var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;
myApp.directive('smartFloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (FLOAT_REGEXP.test(viewValue)) {
          var val = parseFloat(viewValue.replace(',', '.'));
          if(val >= 0) {
        	  ctrl.$setValidity('float', true);
        	  return val;
          } else {
        	  ctrl.$setValidity('float', false);
              return undefined;
          }
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
      });
    }
  };
});


var EMAIL_REGEXP = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
myApp.directive('email', function() {
	  return {
	    require: 'ngModel',
	    link: function(scope, elm, attrs, ctrl) {
	      ctrl.$parsers.unshift(function(viewValue) {
	        if (EMAIL_REGEXP.test(viewValue) || viewValue == undefined || viewValue.length == 0) {
	          ctrl.$setValidity('email', true);
	          if(viewValue == undefined) {
	        	  return "";
	          } else {
	        	  return viewValue;
	          }
	        } else {
	          ctrl.$setValidity('email', false);
	          return undefined;
	        }
	      });
	    }
	  };
	});

