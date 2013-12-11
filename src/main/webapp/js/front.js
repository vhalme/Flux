controllers.controller('FrontCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
	
	console.log("USER: "+$scope.user);
	
	if($scope.user != null) {
		console.log($scope.user);
		$scope.go("tradingSession/"+$scope.user.currentTradingSession.id);
	}
	
	$scope.init = function() {
		!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
	};
	
	// EXTRENAL FUNCTIONS
	
	$(function() {
	      $('#slides').slidesjs({
	        width: 600,
	        height: 320,
	        navigation: true,
	        pagination: true
	      });
	    });
	
	(function() {
		var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
		po.src = 'https://apis.google.com/js/plusone.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
		})();
	
	(function(d, s, id) {
  		var js, fjs = d.getElementsByTagName(s)[0];
  		if (d.getElementById(id)) return;
  		js = d.createElement(s); js.id = id;
  		js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=434867826603079";
  		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	
!function(d,s,id){
		
		var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
		
		/*
		var el = d.getElementById(id);
		console.log("element by id "+id+":");
		console.log(el);
		*/
		
		/* if(!d.getElementById(id)) { */
			
			js=d.createElement(s);
			js.id=id;
			js.src=p+'://platform.twitter.com/widgets.js';
			fjs.parentNode.insertBefore(js,fjs);
		
		/* } */
		
	} (document, 'script', 'twitter-wjs');
	
	
}]);