'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Policies', '$location', '$modal', '$rootScope',
	function($scope, Authentication, Policies, $location, $modal, $rootScope) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.myInterval = 3000;
		$scope.slides = [{
			image: 'modules/core/img/image1.png'
		},{
			image: 'modules/core/img/image2.png'
		}];

		/*$scope.findPolicies = function() {
			if($scope.authentication.user) $scope.policies = Policies.query();
		};*/

		$scope.openInsuranceModal = function(insurance) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/policy-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = {};
					scope.add_insurance = true;
					return scope;
				}(),
				controller: 'InsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.policies.push(selectedItem);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		}
	}
]);
