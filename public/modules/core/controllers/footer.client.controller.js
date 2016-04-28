'use strict';


angular.module('core').controller('FooterController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.isFooterCollapsed = false;
		$scope.toggleCollapsibleFooterMenu = function() {
			$scope.isFooterCollapsed = !$scope.isFooterCollapsed;
		}
	}
]);
