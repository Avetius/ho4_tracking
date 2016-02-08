'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.myInterval = 3000;
		$scope.slides = [{
			image: 'modules/core/img/image1.png'
		},{
			image: 'modules/core/img/image2.png'
		}];

	}
]);
