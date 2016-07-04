'use strict';

// Units controller
angular.module('units').controller('UnitsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Units',
	'$modal', '$rootScope', 'prompt', '$http',
	function($scope, $stateParams, $location, Authentication, Units, $modal, $rootScope, prompt, $http) {
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

		if($stateParams.propertyId == '' || $stateParams.companyId == ''){
			return $location.path('/companies');
		}

		$scope.pageSize = 10;
		$scope.unitsPage = 1;

		$http.post('http://localhost:3001/api/unit', {username: 'mbarrus', password: 'password', pr_id: $stateParams.propertyId, c_id:$stateParams.companyId}).success(function (result) {
			$scope.units = result;
		}).catch(function(){
			return $location.path('/companies');
		});
		$http.post('http://localhost:3001/api/property/'+$stateParams.propertyId, {username: 'mbarrus', password: 'password'}).success(function (data) {
			$scope.property = {
				name: data.pr_name,
				company_id: data.c_id,
				pr_id: data.pr_id,
			};
		}).catch(function(){
			return $location.path('/companies');
		});
		$http.post('http://localhost:3001/api/company/'+$stateParams.companyId, {username: 'mbarrus', password: 'password'}).success(function (data) {
			$scope.company = {
				name: data.c_name,
				id: data.c_id
			};
		}).catch(function(){
			return $location.path('/companies');
		});


	}
]).filter('startFrom', function(){
	return function(data, start){
		if(data)
			return data.slice(start);
	}
});
