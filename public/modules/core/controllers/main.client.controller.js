'use strict';
//var HomeApp = angular.module('core', ['ui.router']);
angular.module('core').controller('MainController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

		$scope.mainpage_header = true;
		$scope.signup_header = true;

		if($location.path() !== '/') $scope.mainpage_header = false;
		if($location.path() === '/signup') $scope.signup_header = false;

		$rootScope.$on('$stateChangeStart',	function(event, toState, toParams, fromState, fromParams){
			if (toState.name !== 'home') $scope.mainpage_header = false;
			else $scope.mainpage_header = false;

			if(toState.name === 'signup') $scope.signup_header = false;
			else $scope.signup_header = false;
		});
	}
]).controller('ServicesController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

		$scope.mainpage_header = false;


		$scope.signup_header = false;

		/*if($location.path() !== '/') $scope.mainpage_header = true;
		if($location.path() === '/signup') $scope.signup_header = true;

		$rootScope.$on('$stateChangeStart',	function(event, toState, toParams, fromState, fromParams){
			if (toState.name !== 'home') $scope.mainpage_header = true;
			else $scope.mainpage_header = true;

			if(toState.name === 'signup') $scope.signup_header = true;
			else $scope.signup_header = true;
		});*/
		console.log($scope.mainpage_header);
	}
]).controller('ContactController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

		$scope.mainpage_header = true;


		$scope.signup_header = true;

		/*if($location.path() !== '/') $scope.mainpage_header = true;
		 if($location.path() === '/signup') $scope.signup_header = true;

		 $rootScope.$on('$stateChangeStart',	function(event, toState, toParams, fromState, fromParams){
		 if (toState.name !== 'home') $scope.mainpage_header = true;
		 else $scope.mainpage_header = true;

		 if(toState.name === 'signup') $scope.signup_header = true;
		 else $scope.signup_header = true;
		 });*/
		console.log($scope.mainpage_header);
	}
]).controller('FaqsController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

		$scope.mainpage_header = true;


		$scope.signup_header = true;

		/*if($location.path() !== '/') $scope.mainpage_header = true;
		 if($location.path() === '/signup') $scope.signup_header = true;

		 $rootScope.$on('$stateChangeStart',	function(event, toState, toParams, fromState, fromParams){
		 if (toState.name !== 'home') $scope.mainpage_header = true;
		 else $scope.mainpage_header = true;

		 if(toState.name === 'signup') $scope.signup_header = true;
		 else $scope.signup_header = true;
		 });*/
		console.log($scope.mainpage_header);
	}
]).controller('PriPlolicyController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

		$scope.mainpage_header = true;


		$scope.signup_header = true;

		/*if($location.path() !== '/') $scope.mainpage_header = true;
		 if($location.path() === '/signup') $scope.signup_header = true;

		 $rootScope.$on('$stateChangeStart',	function(event, toState, toParams, fromState, fromParams){
		 if (toState.name !== 'home') $scope.mainpage_header = true;
		 else $scope.mainpage_header = true;

		 if(toState.name === 'signup') $scope.signup_header = true;
		 else $scope.signup_header = true;
		 });*/
		console.log($scope.mainpage_header);
	}
]);
