'use strict';

// Setting up route
angular.module('properties').config(['$stateProvider',
	function($stateProvider) {
		// Insurances state routing
		$stateProvider.
		state('listProperty', {
			url: '/properties',
			templateUrl: 'modules/properties/views/property-list.client.view.html'
		}).
		state('listPropertyByUserId', {
			url: '/properties_by_manager/:propertyManagerId',
			templateUrl: 'modules/properties/views/property-list.client.view.html'
		});
	}
]);
