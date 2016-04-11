'use strict';

// Properties controller
angular.module('properties').controller('PropertiesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Properties', 'PropertySmartList', '$modal', '$rootScope',
	function($scope, $stateParams, $location, Authentication, Properties, PropertySmartList, $modal, $rootScope) {
		$scope.authentication = Authentication;

		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.itemsByPage = 10;

		$scope.tableState = {
			pagination: {
				number: $scope.itemsByPage,
				numberOfPages: $scope.numberOfPages,
				start: 0
			},
			search: {}
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

			var pagination = tableState.pagination;
			var propertyManagerId = $stateParams.propertyManagerId || null;
			var start = pagination.start || 0;
			var number = pagination.number || 10;
			PropertySmartList.getPage(start, number, propertyManagerId).then(function (result) {
				$scope.properties = result.data;
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
			});
		};

		$scope.removeProperty = function(property) {
			PropertySmartList.deleteProperty(property).then(function (result) {
				$scope.findProperties($scope.tableState);
			});
		};

		$scope.openPropertyModal = function(property) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/properties/views/property-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.property = property || {};
					scope.add_property= !property;
					return scope;
				}(),
				controller: 'PropertyFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findProperties($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};
	}
]);
