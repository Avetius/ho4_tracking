'use strict';

angular.module('users').factory('PropertyManagers', ['$q', '$filter', '$timeout', '$http',
	function ($q, $filter, $timeout, $http) {
		return {
			//Get orders by page and search values
			getPage: function (start, number) {
				var deferred = $q.defer();
				$http.get('/property_managers?start=' + start + '&num=' + number).success(function (data) {
					deferred.resolve({
						data: data.property_managers,
						numberOfPages: Math.ceil(data.count / number),
						count: data.count
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getPropertyManager: function(propertyManagerId) {
				var deferred = $q.defer();
				$http.get('/property_managers/'+propertyManagerId).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			savePropertyManager: function (property_manager) {
				var deferred = $q.defer();
				var data = JSON.stringify(property_manager);
				$http.put('/property_managers/'+property_manager._id, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			deletePropertyManager: function (property_manager) {
				var deferred = $q.defer();
				$http.delete('/property_managers/'+property_manager._id).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			addPropertyManager: function (property_manager) {
				var deferred = $q.defer();
				var data = JSON.stringify(property_manager);
				$http.post('/property_managers', data).success(function (data) {
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
