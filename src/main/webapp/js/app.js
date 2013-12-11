var myApp = angular.module('myApp', ['controllers', 'filters', 'ngRoute']);
		
myApp.config(['$routeProvider', function($routeProvider) {
		
	$routeProvider.
		when('/verifyemail/:token', { templateUrl: 'parts/verifyemail.html', controller: 'VerifyEmailCtrl' }).
		when('/front', { templateUrl: 'parts/front.html', controller: 'FrontCtrl' }).
		when('/account', { templateUrl: 'parts/account.html', controller: 'AccountCtrl' }).
		when('/login', { templateUrl: 'parts/login.html', controller: 'LoginCtrl' }).
		when('/recover/:recoveryToken', { templateUrl: 'parts/front.html', controller: 'FrontCtrl' }).
		when('/logout', { templateUrl: 'parts/logout.html', controller: 'LogoutCtrl' }).
		when('/support', { templateUrl: 'parts/support.html' }).
		when('/tos', { templateUrl: 'parts/tos.html' }).
		when('/faq', { templateUrl: 'parts/faq.html' }).
	    when('/tradingSession/:tradingSessionId', { templateUrl: 'parts/tradingSession.html', controller: 'TradingSessionCtrl' }).
	    otherwise( { redirectTo: '/front' } );
	}]

);

myApp.run(function($rootScope, $location) {
	$rootScope.location = $location;
});

/*
console.log = function(obj) {
	// Do nothing
	// this("log output");
};
*/
