'use strict';

//Policies service used for communicating with the articles REST endpoints
angular.module('users').factory('Policies', ['$resource',
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
