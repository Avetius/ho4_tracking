'use strict';

// Properties controller
angular.module('properties').controller('CompanyPrIdController', ['$scope', '$stateParams', '$location', 'Authentication',
	'Properties', 'PropertySmartList', '$modal', '$rootScope', 'prompt', '$http',
	function($scope, $stateParams, $location, Authentication, Properties, PropertySmartList, $modal, $rootScope, prompt, $http) {
		$scope.authentication = Authentication;
		if(!$scope.authentication.user || $scope.authentication.user.roles.indexOf('admin') < 0) return $location.path('/');
		if($scope.authentication.user.roles.indexOf('admin') > -1){
			$rootScope.admin = true;
		}
		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.itemsByPage = 20;
		$scope.pages = [];
		$scope.stDisplayedPages = 3;
		$scope.tableState = {
			pagination: {
				number: $scope.itemsByPage,
				numberOfPages: $scope.numberOfPages,
				start: 0
			},
			search: null,
			sort: null
		};		

		if($stateParams.pr_id == ''){
			 return $location.path('/companies');
		}		

		$http.post('http://api.rllinsure.com/api/property/'+$stateParams.pr_id, {username: 'mbarrus', password: 'password', c_id: $stateParams.id}).success(function (data) {
			$scope.property = data;
		}).catch(function(){
			return $location.path('/companies');
		});

	}
]);