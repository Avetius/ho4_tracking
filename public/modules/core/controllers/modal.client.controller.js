'use strict';

// Insurances controller
angular.module('core').controller('HO4ModalController', ['$scope', '$location', '$modalInstance',
	function($scope, $location, $modalInstance) {

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}
]);
