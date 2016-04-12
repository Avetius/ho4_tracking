'use strict';

//Properties service used for communicating with the properties REST endpoints
angular.module('properties').factory('PropertySmartList', ['$q', '$filter', '$timeout', '$http',
	function ($q, $filter, $timeout, $http) {
		return {
			//Get orders by page and search values
			getPage: function (start, number, propertyManagerId) {
				var deferred = $q.defer();
				var url = '/properties?start=' + start + '&num=' + number;
				if(propertyManagerId) {
					url = '/properties?start=' + start + '&num=' + number + '&propertyManagerId=' + propertyManagerId;
				}
				$http.get(url).success(function (data) {
					deferred.resolve({
						data: data.properties,
						property_manager: data.property_manager,
						numberOfPages: Math.ceil(data.count / number),
						count: data.count
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			saveProperty: function (property) {
				var deferred = $q.defer();
				var data = JSON.stringify(property);
				$http.put('/properties/'+property._id, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			deleteProperty: function (property) {
				var deferred = $q.defer();
				$http.delete('/properties/'+property._id).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			}
		};
	}
]);
