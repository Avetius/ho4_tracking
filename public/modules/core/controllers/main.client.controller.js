'use strict';
//var HomeApp = angular.module('core', ['ui.router']);
angular.module('core').controller('MainController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

		$rootScope.hide_navigation = false;

		$scope.ResetNavbar = function(){
			$rootScope.hide_navigation = false;
		};



	}
]).controller('ServicesController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

	}
]).controller('ContactController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

	}
]).controller('FaqsController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;


	}
]).controller('PriPlolicyController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;
	}
]);