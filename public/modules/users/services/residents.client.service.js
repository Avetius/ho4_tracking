'use strict';

angular.module('users').factory('Residents', ['$q', '$filter', '$timeout', '$http',
	function ($q, $filter, $timeout, $http) {
		return {
			//Get orders by page and search values
			getPage: function (start, number) {
				var deferred = $q.defer();
				$http.get('/residents?transfer=false&start=' + start + '&num=' + number).success(function (data) {
					deferred.resolve({
						data: data.residents,
						numberOfPages: Math.ceil(data.count / number),
						count: data.count
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getTransferPage: function (start, number) {
				var deferred = $q.defer();
				$http.get('/residents?transfer=true&start=' + start + '&num=' + number).success(function (data) {
					deferred.resolve({
						data: data.residents,
						numberOfPages: Math.ceil(data.count / number),
						count: data.count
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getResident: function(residentId) {
				var deferred = $q.defer();
				$http.get('/residents/'+residentId).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			saveResident: function (resident) {
				var deferred = $q.defer();
				var data = JSON.stringify(resident);
				$http.put('/residents/'+resident._id, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			deleteResident: function (resident) {
				var deferred = $q.defer();
				$http.delete('/residents/'+resident._id).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			addResident: function (resident) {
				var deferred = $q.defer();
				var data = JSON.stringify(resident);
				$http.post('/residents', data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getUnits: function(key) {
				var deferred = $q.defer();
				$http.get('/units?key='+key).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			transferToRLLCoverage: function(residentIds) {
				var deferred = $q.defer();
				var data = JSON.stringify({residentIds: residentIds});
				$http.post('/transfer_residents_rll', data).success(function (data) {
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
