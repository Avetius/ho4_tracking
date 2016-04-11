'use strict';

// Setting up route
angular.module('units').config(['$stateProvider',
	function($stateProvider) {
		// Insurances state routing
		$stateProvider.
		state('listUnit', {
			url: '/properties/:propertyId/units',
			templateUrl: 'modules/units/views/unit-list.client.view.html'
		});
	}
]);
