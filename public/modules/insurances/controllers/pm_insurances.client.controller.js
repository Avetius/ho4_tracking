'use strict';

// Insurances controller
angular.module('insurances').controller('PMInsurancesController', ['$scope', '$http', '$stateParams', '$location',
	'Authentication', 'ManagerInsurance','$modal', '$rootScope', '$timeout', 'Lightbox',
	function($scope, $http, $stateParams, $location, Authentication, ManagerInsurance, $modal, $rootScope, $timeout, Lightbox) {
		$scope.authentication = Authentication;
		if(!$scope.authentication.user || $scope.authentication.user.roles.indexOf('pmanager') < 0) return $location.path('/');
		$scope.propertyId = $stateParams.propertyId;
		$scope.insuranceId = $stateParams.insuranceId;
		$scope.unitId = $stateParams.unitId;
		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.pages = [];
		$scope.itemsByPage = 10;
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

		$scope.selectPage = function (page) {
			if (page > 0 && page <= $scope.numberOfPages) {
				var start = (page - 1) * $scope.itemsByPage;
				var t = {
					pagination: {start: start, number: $scope.itemsByPage, numberOfPages: $scope.numberOfPages},
					search: $scope.tableState.search,
					sort: $scope.tableState.sort
				};
				$scope.currentPage = page;
				$scope.findPMPropertyInsurances(t);
			}
		};

		$scope.findPMPropertyInsurances = function(tableState) {
			$scope.tableState.sort = tableState.sort;
			var pagination = tableState.pagination;

			var start = pagination.start || 0;
			var number = pagination.number || 10;
			var sort = tableState.sort || '';
			if(!sort.predicate) sort = '';
			var search = tableState.search;
			if(typeof search === 'object' || search == undefined) search = '';
			ManagerInsurance.getPMInsurancesPage(start, number, $scope.propertyId, search, sort).then(function (result) {
				$scope.insurances = result.data;
				$scope.numberOfPages = result.numberOfPages;
				$scope.property = result.property;
				$scope.totalItems = result.count;
				$rootScope.current_property = $scope.property;
				redrawPagination(start, number)
			});
		};

		$scope.searchWithText = function(e) {
			if (e.keyCode == 13) {
				$scope.tableState.search = $scope.search;
				$scope.findPMPropertyInsurances($scope.tableState);
			}
		};

		$scope.searchInsurance = function() {
			$scope.tableState.search = $scope.search;
			$scope.findPMPropertyInsurances($scope.tableState);
		};

		$scope.viewDetailInsurance = function(insurance) {
			if(insurance._id)	$location.path('property_insurances/'+$scope.propertyId+'/'+insurance.unitId+'/insurances/' + insurance._id);
		};

		$scope.viewInsuranceCertificate = function(insurance) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/insurance-detail.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.image = insurance.insuranceFilePath;
					scope.unitNumber = insurance.unitNumber;
					return scope;
				}(),
				controller: 'HO4ModalController'
			});

			modalInstance.result.then(function (selectedItem) {

			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
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
				controller: 'HO4ModalController'
			});

			modalInstance.result.then(function (selectedItem) {

			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.findOneInsurance = function() {
			ManagerInsurance.getPmInsurance($scope.propertyId, $scope.unitId, $scope.insuranceId).then(function (result) {
				$scope.insurance = result.insurance;
				$scope.property = result.property;
				$scope.unit = result.unit;
				$scope.insurance_status = $scope.insurance.status.split(' ')[0];
			});
		};

		$scope.displayFullViewImage = function() {
			var images = [{
				url: $scope.insurance.insuranceFilePath
			}];
			Lightbox.openModal(images, 0);
		};

		$scope.alerts = [];

		$scope.enrollToRll = function(insurance) {
			$scope.insurance.status = 'enrolled to RLL';
			$scope.insurance_status = $scope.insurance.status.split(' ')[0];
			ManagerInsurance.updateStatusInsurance($scope.insurance).then(function(response) {
				if(response.data.success) {
					var alert = {
						msg: 'Status updated successfully.'
					};
					$scope.alerts.push(alert);
					$timeout(function(){
						$scope.alerts.splice($scope.alerts.indexOf(alert), 1);
					}, 2500);
				}
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
					scope.residentId = insurance.user._id;
					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findOneInsurance();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		var redrawPagination = function(start_index, number) {
			var start = 1;
			var end;
			var i;
			var prevPage = $scope.currentPage;
			$scope.totalItemCount = $scope.totalItems;
			$scope.currentPage = Math.floor(start_index / number) + 1;

			start = Math.max(start, $scope.currentPage - Math.abs(Math.floor($scope.stDisplayedPages / 2)));
			end = start + $scope.stDisplayedPages;

			if (end > $scope.numberOfPages) {
				end = $scope.numberOfPages + 1;
				start = Math.max(1, end - $scope.stDisplayedPages);
			}

			$scope.pages = [];
			$scope.numPages = $scope.numberOfPages;

			for (i = start; i < end; i++) {
				$scope.pages.push(i);
			}
		};
	}
]);
