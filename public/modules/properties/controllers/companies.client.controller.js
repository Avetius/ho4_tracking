'use strict';

// Properties controller
angular.module('properties').controller('CompaniesController', ['$scope', '$stateParams', '$location', 'Authentication',
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


		$http.get('/company_list').success(function (data) {
			$scope.companies = data;
		}).catch(function(){
			return $location.path('/properties');
		});

		$scope.pageSize = 9999999;
		$scope.companiesPage = 1;
	}
])
.filter('startFrom', function(){
	return function(data, start){
		if(data)
			return data.slice(start);
	}
});
