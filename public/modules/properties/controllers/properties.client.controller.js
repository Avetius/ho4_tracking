'use strict';

// Properties controller
angular.module('properties').controller('PropertiesController', ['$scope', '$stateParams', '$location', 'Authentication',
	'Properties', 'PropertySmartList', '$modal', '$rootScope', 'prompt',
	function($scope, $stateParams, $location, Authentication, Properties, PropertySmartList, $modal, $rootScope, prompt) {
		$scope.authentication = Authentication;

		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.itemsByPage = 20;

		$scope.tableState = {
			pagination: {
				number: $scope.itemsByPage,
				numberOfPages: $scope.numberOfPages,
				start: 0
			},
			search: null,
			sort: null
		};

		$scope.selectPage = function (page) {
			if (page > 0 && page <= $scope.numberOfPages) {
				var start = (page - 1) * $scope.itemsByPage;
				var t = {
					pagination: {start: start, number: $scope.itemsByPage, numberOfPages: $scope.numberOfPages},
					search: $scope.tableState.search,
					sort: {}
				};
				$scope.currentPage = page;
				$scope.findProperties(t);
			}
		};

		$scope.findProperties = function(tableState) {
			$scope.tableState.sort = tableState.sort;
			var pagination = tableState.pagination;
			var propertyManagerId = $stateParams.propertyManagerId || null;
			var start = pagination.start || 0;
			var number = pagination.number || 20;
			var search = tableState.search;
			if(typeof search === 'object') search = '';
			var sort = tableState.sort || '';
			if(!sort.predicate) sort = '';
			PropertySmartList.getPage(start, number, propertyManagerId, search, sort).then(function (result) {
				$scope.properties = result.data;
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
				$scope.property_manager = result.property_manager;
				$scope.managers = result.managers;
			});
		};

		$scope.removeProperty = function(property) {
			prompt({
				title: 'Confirmation',
				message: 'Are you sure, that you want to remove this property?'
			}).then(function(){
				PropertySmartList.deleteProperty(property).then(function (result) {
					$scope.findProperties($scope.tableState);
				});
			});
		};

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

		$scope.searchWithText = function(e) {
			if (e.keyCode == 13) {
				$scope.tableState.search = $scope.search;
				$scope.findProperties($scope.tableState);
			}
		}
	}
]);
