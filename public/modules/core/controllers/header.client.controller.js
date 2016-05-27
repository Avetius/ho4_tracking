'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', 'PropertySmartList','$http', '$location', '$state', '$rootScope', '$stateParams',
	function($scope, Authentication, Menus, PropertySmartList, $http, $location, $state, $rootScope, $stateParams) {
		$scope.authentication = Authentication;
		$scope.mainpage_header = false;
		$scope.signup_header = false;
		$scope.signin_header = false;
		$scope.logo_link = '/#!/';
		if($scope.authentication.user) {
			if($scope.authentication.user.roles.indexOf('admin')> -1) {
				$scope.logo_link = '/#!/resident_insurances';
			} else if($scope.authentication.user.roles.indexOf('pmanager')> -1 && $scope.current_property) {
				$scope.logo_link = '/#!/property_insurances/'+$scope.current_property._id+'/insurances';
			} else if($scope.authentication.user.roles.indexOf('user')> -1) {
				$scope.logo_link = '/#!/insurances';
			}
		}
		if($scope.authentication.user && $scope.authentication.user.roles.indexOf('pmanager')> -1) {
			PropertySmartList.getProperties().then(function(result) {
				$scope.properties = result;
			});
		}
		if($location.path().indexOf('/signup') > -1) $scope.signup_header = true;
		if($location.path().indexOf('/signin') > -1) $scope.signin_header = true;

		$rootScope.$on('$stateChangeStart',	function(event, toState, toParams, fromState, fromParams){
			if (toState.name !== 'home') $scope.mainpage_header = true;
			else $scope.mainpage_header = true;

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
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
			$scope.isCollapsed = false;
			if($scope.authentication.user) {
				if($scope.authentication.user.roles.indexOf('pmanager')> -1) {
					PropertySmartList.getProperties().then(function(result) {
						$scope.properties = result;
						if(toParams.propertyId)
							$scope.current_property = result.filter(function(obj) {return obj._id == toParams.propertyId})[0];
						else
							$scope.current_property = result[0];
						$scope.logo_link = '/#!/property_insurances/'+$scope.current_property._id+'/insurances';
					});
				} else if($scope.authentication.user.roles.indexOf('user')> -1) {
					$scope.logo_link = '/#!/insurances';
				}
			}
		});

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				$scope.current_property = response.property;
				// And redirect to the index page
				if($scope.authentication.user.roles.indexOf('pmanager')> -1) $location.path('/property_insurances/'+response.property._id+'/insurances');
				else if($scope.authentication.user.roles.indexOf('admin')> -1) $location.path('/resident_insurances');
				else $location.path('/insurances');

			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
