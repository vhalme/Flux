var myApp = angular.module('myApp', ['filters']);

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
				element.css('width', (value*100)+'%');            
			});
			
		}
		
   }
	
});

var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;
myApp.directive('smartFloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (FLOAT_REGEXP.test(viewValue)) {
          ctrl.$setValidity('float', true);
          return parseFloat(viewValue.replace(',', '.'));
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
      });
    }
  };
});

myApp.config(['$routeProvider', function($routeProvider) {
	
	$routeProvider.
    	when('/tradeStats/:tradeStatsId', { templateUrl: 'parts/tradeStats.html', controller: TradeStatsCtrl }).
    	otherwise( { redirectTo: '/tradeStats/0' } );
	}]

);
