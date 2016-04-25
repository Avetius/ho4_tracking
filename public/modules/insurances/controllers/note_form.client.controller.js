'use strict';

// Insurances controller
angular.module('insurances').controller('NoteFormController', ['$scope', '$location', 'Authentication', 'ManagerInsurance', '$modalInstance',
	function($scope, $location, Authentication, ManagerInsurance, $modalInstance) {
		$scope.authentication = Authentication;
		if($scope.insurance) {
			if($scope.insurance.status === 'rejected') $scope.note = {subject: 'Status of the certificate was set as REJECTED'};
			else if($scope.insurance.status === 'approved') $scope.note = {subject: 'Status of the certificate was set as APPROVED'};
			else if($scope.insurance.status === 'pending') $scope.note = {subject: 'Status of the certificate was set as PENDING'};
			else if($scope.insurance.status === 'expired') $scope.note = {subject: 'Status of the certificate was set as EXPIRED'};
			else if($scope.insurance.status === 'incomplete') $scope.note = {subject: 'Status of the certificate was set as INCOMPLETE'};
		}
		$scope.saveNote = function () {
			var invalidItems = 0;
			$scope.errorSubject = false;
			if(!$scope.note.subject || $scope.note.subject == "") {
				$scope.errorSubject = true;
				invalidItems++;
			}

			if(invalidItems == 0) {
				var note = $scope.note;
				note.policy = $scope.insurance._id;
				ManagerInsurance.addNoteForInsuranceStatus(note).then(function() {
					$modalInstance.close({note: $scope.note});
				}, function(errorResponse) {
					$scope.error = errorResponse.message;
				});
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}
]);
