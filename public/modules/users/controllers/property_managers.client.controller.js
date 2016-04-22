'use strict';

// Property manager controller
angular.module('users').controller('PropertyManagerController', ['$scope', '$stateParams', '$location', 'Authentication',
	'PropertyManagers', '$modal', '$rootScope', 'prompt',
	function($scope, $stateParams, $location, Authentication, PropertyManagers, $modal, $rootScope, prompt) {
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
				$scope.findPropertyManagers(t);
			}
		};

		$scope.findPropertyManagers = function(tableState) {

			var pagination = tableState.pagination;

			var start = pagination.start || 0;
			var number = pagination.number || 10;
			PropertyManagers.getPage(start, number).then(function (result) {
				$scope.property_managers = result.data;
				$scope.properties = result.properties;
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
			});
		};

		$scope.removePropertyManager = function(property_manager) {
			prompt({
				title: 'Confirmation',
				message: 'Are you sure, that you want to remove this property manager?'
			}).then(function() {
				PropertyManagers.deletePropertyManager(property_manager).then(function (result) {
					$scope.findPropertyManagers($scope.tableState);
				});
			});
		};

		$scope.openPropertyManagerModal = function(property_manager) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/property_managers/property-manager-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.propertyManager = property_manager || {};
					scope.add_property_manager= !property_manager;
					scope.properties = $scope.properties;
					return scope;
				}(),
				controller: 'PropertyManagerFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findPropertyManagers($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};
	}
]);
