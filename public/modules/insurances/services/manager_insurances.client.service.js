'use strict';

//Insurances service used for communicating with the insurances REST endpoints
angular.module('insurances').factory('ManagerInsurance', ['$q', '$filter', '$timeout', '$http',
	function ($q, $filter, $timeout, $http) {
		return {
			getInsurances: function(propertyId, unitId, residentId, propertyManagerId) {
				var deferred = $q.defer();
				var url = '/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId+'/insurances';
				if(propertyManagerId) url = '/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId+'/insurances?propertyManagerId=' + propertyManagerId;
				$http.get(url).success(function (data) {
					deferred.resolve({
						unit: data.unit,
						property: data.property,
						insurances: data.insurances,
						resident: data.resident,
						property_manager: data.property_manager
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getInsurance: function(propertyId, unitId, residentId, insuranceId, propertyManagerId) {
				var deferred = $q.defer();
				var url = '/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId + '/insurances/'+insuranceId;
				if(propertyManagerId) url = '/resident_insurances/'+propertyId+'/'+unitId  +'/'+residentId + '/insurances/'+insuranceId+'?propertyManagerId=' + propertyManagerId;
				$http.get(url).success(function (data) {
					deferred.resolve({
						unit: data.unit,
						property: data.property,
						insurance: data.insurance,
						property_manager: data.property_manager
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getRecentInsurances: function(start, number, search, sort, filter) {
				var deferred = $q.defer();
				var url = '/recent_insurances?start=' + start + '&num=' + number + '&search=' + search + '&sort=' + JSON.stringify(sort) + '&filter=' + filter;
				$http.get(url).success(function (data) {
					deferred.resolve({
						data: data.insurances,
						numberOfPages: Math.ceil(data.count / number),
						count: data.count
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getRecentInsuranceDetail: function(insuranceId) {
				var deferred = $q.defer();
				$http.get('/recent_insurances/'+insuranceId).success(function (data) {
					deferred.resolve({
						insurance: data.insurance
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			getResidentInsurances: function(start, number, residentId) {
				var deferred = $q.defer();
				var url = '/resident_insurance_list/'+residentId+'?start=' + start + '&num=' + number;
				$http.get(url).success(function (data) {
					deferred.resolve({
						data: data.insurances,
						numberOfPages: Math.ceil(data.count / number),
						count: data.count,
						resident: data.resident,
						unit: data.unit,
						property: data.property
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
				$http.put('/resident_insurances/'+insurance._id, data).success(function (data) {
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
				$http.post('/resident_insurance_list/'+residentId, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			updateStatusInsurance: function(insurance) {
				var deferred = $q.defer();
				var data = JSON.stringify({status: insurance.status});
				$http.post('/insurance_status/'+insurance._id, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			addNoteForInsuranceStatus: function(note) {
				var deferred = $q.defer();
				var data = JSON.stringify(note);
				$http.post('/notes', data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			removeInsurance: function(insuranceId) {
				var deferred = $q.defer();
				$http.delete('/resident_insurances/'+insuranceId).success(function (data) {
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
