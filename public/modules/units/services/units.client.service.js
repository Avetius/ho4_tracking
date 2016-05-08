'use strict';

//Units service used for communicating with the properties REST endpoints
angular.module('units').factory('Units', ['$q', '$filter', '$timeout', '$http',
	function ($q, $filter, $timeout, $http) {
		return {
			//Get orders by page and search values
			getPage: function (start, number, propertyId, propertyManagerId, sort) {
				var deferred = $q.defer();
				$http.get('/property_units/'+propertyId+'?start=' + start + '&num=' + number + '&propertyManagerId=' + propertyManagerId + '&sort=' + JSON.stringify(sort)).success(function (data) {
					deferred.resolve({
						data: data.units,
						property: data.property,
						property_manager: data.property_manager,
						numberOfPages: Math.ceil(data.count / number),
						count: data.count
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getResidents: function() {
				var deferred = $q.defer();
				$http.get('/residents_list').success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			saveUnit: function (unit) {
				var deferred = $q.defer();
				var data = JSON.stringify(unit);
				$http.put('/units/'+unit._id, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			deleteUnit: function (unit) {
				var deferred = $q.defer();
				$http.delete('/units/'+unit._id).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			addUnit: function (unit, propertyId) {
				var deferred = $q.defer();
				var data = JSON.stringify(unit);
				$http.post('/property_units/'+propertyId, data).success(function (data) {
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
