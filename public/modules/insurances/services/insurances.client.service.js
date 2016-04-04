'use strict';

//Insurances service used for communicating with the articles REST endpoints
angular.module('insurances').factory('Insurances', ['$resource',
	function($resource) {
		return $resource('policy/:policyId', {
			policyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
