'use strict';

// Properties controller
angular.module('properties').controller('PropertiesController', ['$scope', '$stateParams', '$location', 'Authentication',
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

		if($stateParams.companyid == ''){
			return $location.path('/companies');
		}

		$scope.pageSize = 10;
		$scope.propertiesPage = 1;


		$http.post('http://api.rllinsure.com/api/company/'+$stateParams.companyid, {username: 'mbarrus', password: 'password'}).success(function (data) {
			$scope.company = {
				name: data.c_name,
				id: data.c_id
			};
		}).catch(function(){
			return $location.path('/companies');
		});

		$http.get('/company_properties/'+$stateParams.companyid).success(function (data) {
			$scope.properties = data;
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

