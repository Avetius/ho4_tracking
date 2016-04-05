'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$http', '$location', '$state', '$rootScope',
	function($scope, Authentication, Menus, $http, $location, $state, $rootScope) {
		$scope.authentication = Authentication;

		$scope.mainpage_header = false;
		$scope.signup_header = false;
		$scope.signin_header = false;

		if($location.path() !== '/') $scope.mainpage_header = true;
		if($location.path().indexOf('/signup') > -1) $scope.signup_header = true;
		if($location.path().indexOf('/signin') > -1) $scope.signin_header = true;

		$rootScope.$on('$stateChangeStart',	function(event, toState, toParams, fromState, fromParams){
			if (toState.name !== 'home') $scope.mainpage_header = true;
			else $scope.mainpage_header = false;

			if(toState.name.indexOf('signup') > -1) $scope.signup_header = true;
			else $scope.signup_header = false;

			if(toState.name.indexOf('signin') > -1) $scope.signin_header = true;
			else $scope.signin_header = false;
		});


		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/insurances');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
