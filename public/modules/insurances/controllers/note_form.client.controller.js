'use strict';

// Insurances controller
angular.module('insurances').controller('NoteFormController', ['$scope', '$location', 'Authentication', 'ManagerInsurance', '$modalInstance',
	function($scope, $location, Authentication, ManagerInsurance, $modalInstance) {
		$scope.authentication = Authentication;

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
