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


		$scope.openPropertyModal = function(property) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/properties/views/property-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.property = property || {};
					scope.property_manager = $scope.property_manager;
					scope.add_property= !property||!property._id;
					scope.managers = $scope.managers;
					return scope;
				}(),
				controller: 'PropertyFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				if(selectedItem.manager_modal) {
					$scope.openPropertyManagerModal(selectedItem.property);
				} else {
					$scope._properties.push(selectedItem);
					$scope.findProperties($scope.tableState);
				}
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};
		$scope.openPropertyManagerModal = function(property) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/property_managers/property-manager-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.propertyManager = {};
					scope.add_property_manager= true;
					scope.properties = $scope.properties;
					return scope;
				}(),
				controller: 'PropertyManagerFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.managers.push(selectedItem.data);
				property.propertyManager = selectedItem.data;
				$scope.openPropertyModal(property);
			}, function () {
				$scope.openPropertyModal(property);
				console.log('Modal dismissed at: ' + new Date());
			});
		};


		$scope.displayPropertyManagerModal = function(assignedproperty) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/property_managers/choose-property-manager-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.property = assignedproperty;
					scope.add_property_manager = false;
					scope.managers = $scope.managers;
					return scope;
				}(),
				controller: 'PropertyManagerFormController'
			});
			modalInstance.result.then(function (selectedItem) {
				if(selectedItem.manager_modal) {
					$scope.displayPropertyManagerCreateModal(selectedItem.property);
				} else {
					$scope.findProperties($scope.tableState);
				}
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};



		$scope.displayPropertyManagerCreateModal = function(assignedproperty) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/property_managers/property-manager-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.propertyManager = {assigned_properties:[assignedproperty]};
					scope.add_property_manager= true;
					scope.properties = $scope.properties;
					return scope;
				}(),
				controller: 'PropertyManagerFormController'
			});
			modalInstance.result.then(function (selectedItem) {
				$scope.findProperties($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};


		$http.get('/company/'+$stateParams.companyid).success(function (data) {
			$scope.company = {
				name: data.name,
				id: data.mysql_id
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

