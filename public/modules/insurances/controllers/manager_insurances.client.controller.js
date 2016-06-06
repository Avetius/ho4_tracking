'use strict';

// Insurances controller
angular.module('insurances').controller('ManagerInsurancesController', ['$scope', '$stateParams', '$location', 'Authentication',
	'ManagerInsurance', '$modal', '$rootScope', '$timeout', 'Lightbox', 'prompt',
	function($scope, $stateParams, $location, Authentication, ManagerInsurance, $modal, $rootScope, $timeout, Lightbox, prompt) {
		$scope.authentication = Authentication;
		if(!$scope.authentication.user || $scope.authentication.user.roles.indexOf('admin') < 0) $location.path('/');

		$scope.propertyId = $stateParams.propertyId;
		$scope.unitId = $stateParams.unitId;
		$scope.residentId = $stateParams.residentId;
		$scope.insuranceId = $stateParams.insuranceId;

		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.itemsByPage = 10;
		$scope.recent_insurance = {
			filter: 'pending'
		};
		$scope.tableState = {
			pagination: {
				number: $scope.itemsByPage,
				numberOfPages: $scope.numberOfPages,
				start: 0
			},
			search: null,
			sort: null,
			filter:$scope.recent_insurance.filter
		};

		$scope.selectPage = function (page) {
			if (page > 0 && page <= $scope.numberOfPages) {
				var start = (page - 1) * $scope.itemsByPage;
				var t = {
					pagination: {start: start, number: $scope.itemsByPage, numberOfPages: $scope.numberOfPages},
					search: $scope.tableState.search,
					sort: $scope.tableState.sort
				};
				$scope.currentPage = page;
				$scope.findRecentInsurances(t);
			}
		};

		// Find existing Insurance
		$scope.findOne = function() {
			var propertyManagerId = $stateParams.propertyManagerId || null;
			ManagerInsurance.getInsurance($scope.propertyId, $scope.unitId, $scope.residentId, $scope.insuranceId, propertyManagerId).then(function(result) {
				$scope.property = result.property;
				$scope.unit = result.unit;
				$scope.insurance = result.insurance;
				$scope.property_manager = result.property_manager;
			});
		};

		$scope.findPolicies = function() {
			var propertyManagerId = $stateParams.propertyManagerId || null;
			ManagerInsurance.getInsurances($scope.propertyId, $scope.unitId, $scope.residentId, propertyManagerId).then(function(result) {
				$scope.property = result.property;
				$scope.unit = result.unit;
				$scope.insurances = result.insurances;
				$scope.resident = result.resident;
				$scope.property_manager = result.property_manager;
			});
		};

		$scope.findRecentInsurances = function(tableState) {
			tableState.filter = $scope.recent_insurance.filter;
			$scope.tableState.sort = tableState.sort;
			var pagination = tableState.pagination;
			var start = pagination.start || 0;
			var number = 100;
			var search = tableState.search;
			if(typeof search === 'object') search = '';
			var sort = tableState.sort || '';
			if(!sort.predicate) sort = '';
			var filterVal = tableState.filter || 'pending';

			ManagerInsurance.getRecentInsurances(start, number, search, sort, filterVal).then(function(result) {
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
				$scope.insurances = result.data;
			});
		};

		$scope.findResidentInsurances = function(tableState) {
			$scope.tableState.sort = tableState.sort;
			var pagination = tableState.pagination;
			var start = pagination.start || 0;
			var number = pagination.number || 10;

			ManagerInsurance.getResidentInsurances(start, number, $scope.residentId).then(function(result) {
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
				$scope.insurances = result.data;
				$scope.resident = result.resident;
				$scope.property = result.property;
				$scope.unit = result.unit;
			});
		};

		$scope.displayFullViewImage = function() {
			var images = [{
				url: $scope.insurance.insuranceFilePath
			}];
			Lightbox.openModal(images, 0);
		};

		$scope.viewInsuranceCertificate = function(path) {
			var images = [{
				url: path
			}];
			Lightbox.openModal(images, 0);
		};

		$scope.findOneRecentInsurance = function() {
			ManagerInsurance.getRecentInsuranceDetail($scope.insuranceId).then(function(result) {
				$scope.insurance = result.insurance;
			});
		};

		$scope.openInsuranceModal = function(insurance) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/insurance-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = insurance || {unitNumber: $scope.unit?$scope.unit.unitNumber:''};
					scope.add_insurance = !insurance;
					scope.propertyId = $scope.propertyId;
					scope.unitId = $scope.unitId;
					scope.residentId = $scope.residentId;
					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findPolicies();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openRecentInsuranceModal = function(insurance) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/insurance-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = insurance || {};
					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findOneRecentInsurance();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openResidentInfo = function() {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/resident-info.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.resident = $scope.resident;

					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findUnits($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openResidentInsuranceModal = function() {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/insurance-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = {unitNumber: $scope.unit?$scope.unit.unitNumber:''};
					scope.add_insurance = true;
					scope.residentId = $scope.residentId;
					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findResidentInsurances($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.alerts = [];
		$scope.updateInsuranceStatus = function(insurance, findResident) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/note-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = insurance;
					return scope;
				}(),
				controller: 'NoteFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				ManagerInsurance.updateStatusInsurance(insurance).then(function(response) {
					if(response.data.success) {
						var alert = {
							msg: 'Status updated successfully.'
						};
						$scope.alerts.push(alert);
						$timeout(function(){
							$scope.alerts.splice($scope.alerts.indexOf(alert), 1);
						}, 2500);
						if($scope.insuranceId) {
							$scope.findOneRecentInsurance();
						} else {
							if(findResident === 'residents') $scope.findResidentInsurances($scope.tableState);
							else if(findResident === 'policies') $scope.findPolicies();
							else $scope.findRecentInsurances($scope.tableState);
						}
					}
				});
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.viewDetailRecentInsurance = function(insurance, evt) {
			$location.path('recent_insurances/' + insurance._id);
		};

		$scope.viewDetailResidentInsurance = function(insurance, evt) {
			$location.path('residents/'+$scope.residentId+'/insurances/' + insurance._id);
		};

		$scope.removeInsurance = function(insuranceId, index) {
			prompt({
				title: 'Confirmation',
				message: 'Are you sure, that you want to remove this insurance?'
			}).then(function() {
				ManagerInsurance.removeInsurance(insuranceId).then(function (response) {
					$scope.insurances.splice(index, 1);
					var alert = {
						msg: 'Insurance has been removed successfully.'
					};
					$scope.alerts.push(alert);
					$timeout(function () {
						$scope.alerts.splice($scope.alerts.indexOf(alert), 1);
					}, 2500);
				});
			});
		};

		$scope.searchWithText = function(e) {
			if (e.keyCode == 13) {
				$scope.tableState.search = $scope.search;
				$scope.findRecentInsurances($scope.tableState);
			}
		};

		$scope.viewInsuranceNotes = function(notes) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/note-list.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.notes = notes;
					return scope;
				}(),
				controller: 'NoteFormController'
			});

			modalInstance.result.then(function (selectedItem) {

			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.filterByInsuranceStatus = function(insuranceFilter) {
			$scope.tableState.filter = insuranceFilter;
			console.log($scope.tableState);
			$scope.findRecentInsurances($scope.tableState);
		};

		$scope.openResidentEditor = function(resident) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/residents/resident-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.resident = resident || {};
					scope.add_resident = false;
					return scope;
				}(),
				controller: 'ResidentFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findRecentInsurances($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};
	}
]);
