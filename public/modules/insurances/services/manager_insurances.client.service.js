'use strict';

//Insurances service used for communicating with the insurances REST endpoints
angular.module('insurances').factory('ManagerInsurance', ['$q', '$filter', '$timeout', '$http',
	function ($q, $filter, $timeout, $http) {
		return {
			getInsurances: function(propertyId, unitId, residentId) {
				var deferred = $q.defer();
				$http.get('/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId+'/insurances').success(function (data) {
					deferred.resolve({
						unit: data.unit,
						property: data.property,
						insurances: data.insurances,
						resident: data.resident
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getInsurance: function(propertyId, unitId, residentId, insuranceId) {
				var deferred = $q.defer();
				$http.get('/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId + '/insurances/'+insuranceId).success(function (data) {
					deferred.resolve({
						unit: data.unit,
						property: data.property,
						insurance: data.insurance
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			saveInsurance: function (propertyId, unitId, residentId, insurance) {
				var deferred = $q.defer();
				delete insurance.user;
				var data = JSON.stringify(insurance);
				$http.put('/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId + '/insurances/'+insurance._id, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			addInsurance: function (propertyId, unitId, residentId, insurance) {
				var deferred = $q.defer();
				var data = JSON.stringify(insurance);
				$http.post('/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId + '/insurances', data).success(function (data) {
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
