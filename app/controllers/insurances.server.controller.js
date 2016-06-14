'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile'),
	Policy = mongoose.model('Policy'),
	Property = mongoose.model('Property'),
	Unit = mongoose.model('Unit'),
	Note = mongoose.model('Note'),
	async = require('async'),
	schedule = require('node-schedule'),
	emailHandler = require('./email.server.controller.js'),
	_ = require('lodash');

var dynamicSort = function(property) {
	var sortOrder = 1;
	if(property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a,b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
};
/**
 * Show the current insurance
 */
exports.read = function(req, res) {
	res.json(req.insurance);
};

exports.residentInsurances = function(req, res) {
	var start = parseInt(req.query.start);
	var num = parseInt(req.query.num);
	var search = req.query.search || '';
	var sort = JSON.parse(req.query.sort) || {};
	var query = {user: req.params.residentId};
	if(search && search !== '') query = {$and: [{user: req.params.residentId}, {insuranceName: {'$regex': search, '$options': 'i'}}]};

	Policy.count(query, function (err, count) {
		Profile.findOne({user: req.params.residentId}).populate('user').exec(function(err, profile) {
			var sortString = '-created';
			if(sort.predicate) {
				sortString = sort.predicate;
				if(sort.reverse) sortString = '-' + sortString;
			}
			Policy.find(query).sort(sortString).populate('user').limit(num).skip(start).exec(function (err, insurances) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					var notesCallbacks = [];
					_.each(insurances, function(insurance) {
						notesCallbacks.push(function(cb) {
							Note.find({policy: insurance._id}).populate('editor').exec(function(err, notes) {
								var temp_insurance = insurance.toObject();
								temp_insurance.notes = notes;
								cb(err, temp_insurance);
							});
						});
					});
					async.parallel(notesCallbacks, function(err, results) {
						if(req.query.propertyManagerId) {
							User.findById(req.query.propertyManagerId).exec(function (err, property_manager) {
								res.json({count: count, insurances: results, property: req.property, unit: req.unit, resident: profile, property_manager: property_manager});
							});
						} else {
							res.json({count: count, insurances: results, property: req.property, unit: req.unit, resident: profile});
						}
					});
				}
			});
		});
	});
};

exports.residentInsuranceList = function(req, res) {
	Policy.count({user: req.params.residentId}, function (err, count) {
		Profile.findOne({user: req.params.residentId}).populate('user').exec(function(err, profile) {
			Unit.findOne({resident: req.params.residentId}).populate('property').exec(function(err, unit) {
				Policy.find({user: req.params.residentId}).sort('-created').populate('user').exec(function (err, insurances) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						var notesCallbacks = [];
						_.each(insurances, function(insurance) {
							notesCallbacks.push(function(cb) {
								Note.find({policy: insurance._id}).populate('editor').exec(function(err, notes) {
									var temp_insurance = insurance.toObject();
									temp_insurance.notes = notes;
									cb(err, temp_insurance);
								});
							});
						});
						async.parallel(notesCallbacks, function(err, results) {
							Property.findById(profile.user.propertyID).exec(function(err, property){
								res.json({count: count, insurances: results, resident: profile, unit: unit, property:property});
							});

						});

					}
				});
			});
		});
	});
};

exports.residentInsurance = function(req, res) {
	if(req.query.propertyManagerId) {
		User.findById(req.query.propertyManagerId).exec(function (err, property_manager) {
			res.json({insurance: req.insurance, property: req.property, unit: req.unit, property_manager: property_manager});
		});
	} else {
		res.json({insurance: req.insurance, property: req.property, unit: req.unit});
	}
};

exports.createResidentInsurances = function(req, res) {
	var policy = new Policy(req.body);
	if(typeof req.body.unitNumber === 'object') {
		policy.unitNumber = req.body.unitNumber.unitNumber;
	}
	policy.user = req.params.residentId;
	if(req.user.roles.indexOf('admin') < 0) {
		if(policy.insuranceFilePath && policy.insuranceFilePath !== '') policy.status = 'pending';
		else policy.status = 'incomplete';
	}
	policy.updated = Date.now();
	policy.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(policy);
		}
	});
};

exports.updateResidentInsurance = function(req, res) {
	Policy.findOne({_id: req.params.insuranceId}).exec(function(err, policy) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!policy) {
			return res.status(404).send({
				message: 'Policy is invalid'
			});
		}

		policy = _.extend(policy, req.body);
		if(typeof req.body.unitNumber === 'object') {
			policy.unitNumber = req.body.unitNumber.unitNumber;
		}
		if(req.user.roles.indexOf('admin') < 0) {
			if (policy.insuranceFilePath && policy.insuranceFilePath !== '') policy.status = 'pending';
			else policy.status = 'incomplete';
		}
		policy.updated = Date.now();
		policy.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(policy);
			}
		});
	});
};

exports.removeInsurance = function(req, res) {
	var insurance = req.insurance;
	insurance.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(insurance);
		}
	});
};

/*exports.recentInsurances = function(req, res) {
	var start = parseInt(req.query.start);
	var num = parseInt(req.query.num);
	var search = req.query.search || '';
	var sort = JSON.parse(req.query.sort) || {};
	var filterVal = req.query.filter;
	var query = {};
	if(req.user.roles.indexOf('pmanger')> -1) query ={propertyManager: req.user._id};
	Property.find(query).exec(function(err, properties) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var unitsCallbacks = [];
			_.each(properties, function(property) {
				unitsCallbacks.push(function(cb) {
					Unit.find({property: property._id}).populate('property', 'propertyName').exec(function(err, units) {
						cb(err, {units: units});
					});
				});
			});
			async.parallel(unitsCallbacks, function(err, property_units) {
				var units = [];
				_.each(property_units, function(property_unit) {
					if(property_unit.units.length > 0) {
						units = units.concat(property_unit.units);
					}
				});
				var insuranceListCallback = [];
				_.each(units, function(unit) {
					insuranceListCallback.push(function(cb) {
						var policy_query = {user: unit.resident};
						if(req.user.roles.indexOf('admin')> -1) {
							if(filterVal === 'pending') policy_query = {$and: [{status: 'pending'}, {user: unit.resident}]};
							if(filterVal === 'expired') policy_query = {$and: [{status: 'expired'}, {user: unit.resident}]};
						}
						Policy.find(policy_query).populate('user').exec(function(err, policies) {
							unit.policies = policies;
							cb(err, unit);
						});
					});
				});
				async.parallel(insuranceListCallback, function(err, results) {
					var resultArray = [];
					_.each(results, function (item) {
						_.each(item.policies, function (policy) {
							var temp_insurance = policy.toObject();
							temp_insurance.property = item.property;
							temp_insurance.propertyName = item.property.propertyName;
							temp_insurance.unitNumber = item.unitNumber;
							temp_insurance.residentName = policy.user.displayName;
							resultArray.push(temp_insurance);
						});
					});
					var notesCallbacks = [];
					_.each(resultArray, function(insurance) {
						notesCallbacks.push(function(cb) {
							Note.find({policy: insurance._id}).populate('editor').exec(function(err, notes) {
								var temp = insurance;
								temp.notes = notes;
								cb(err, temp);
							});
						});
					});
					async.parallel(notesCallbacks, function(err, results) {
						resultArray = results;
						if (search !== '') {
							var propertSearchResultArray = resultArray.filter(function (item) {
								return item.property.propertyName.search(search) > -1;
							});
							var unitSearchResultArray = resultArray.filter(function (item) {
								return item.unitNumber.search(search) > -1;
							});
							var residentSearchResultArray = resultArray.filter(function (item) {
								return item.user.displayName.search(search) > -1;
							});

							var searchResultArray = propertSearchResultArray.concat(unitSearchResultArray);
							searchResultArray = searchResultArray.concat(residentSearchResultArray);
							for (var i = 0; i < searchResultArray.length; ++i) {
								for (var j = i + 1; j < searchResultArray.length; ++j) {
									if (searchResultArray[i] === searchResultArray[j])
										searchResultArray.splice(j--, 1);
								}
							}
							if (sort.predicate) {
								searchResultArray.sort(dynamicSort(sort.predicate));
								if (sort.reverse) searchResultArray.sort(dynamicSort('-' + sort.predicate));
							}
							var returnResult = searchResultArray.slice(start, (start + num));
							res.json({count: searchResultArray.length, insurances: returnResult});
						} else {
							if (sort.predicate) {
								resultArray.sort(dynamicSort(sort.predicate));
								if (sort.reverse) resultArray.sort(dynamicSort('-' + sort.predicate));
							}
							var returnResult = resultArray.slice(start, (start + num));
							res.json({count: resultArray.length, insurances: returnResult});
						}
					});
				});
			});
		}
	});
};*/

exports.recentInsurances = function(req, res) {
	var start = parseInt(req.query.start);
	var num = parseInt(req.query.num);
	var search = req.query.search || '';
	var sort = JSON.parse(req.query.sort) || {};
	var filterVal = req.query.filter;
	var query = {};
	if(filterVal === 'pending') query = {status: 'pending'};
	if(filterVal === 'expired') query = {status: 'expired'};

	Policy.find(query).populate('user').exec(function(err, policies) {
		var policiesArray = [];
		_.each(policies, function(policy) {
			policiesArray.push(function(cb) {
				Property.findOne({_id: policy.user.propertyID}).exec(function(err, property) {
					var temp = policy.toObject();
					temp.propertyName = property?property.propertyName:'';
					temp.residentName = policy.user.displayName;
					cb(null, temp);
				});
			});
		});
		async.parallel(policiesArray, function(err, result) {
			var notesCallbacks = [];
			_.each(result, function (insurance) {
				notesCallbacks.push(function (cb) {
					Note.find({policy: insurance._id}).populate('editor').exec(function (err, notes) {
						var temp = insurance;
						temp.notes = notes;
						cb(err, temp);
					});
				});
			});
			async.parallel(notesCallbacks, function (err, results) {
				var resultArray = results;
				if (search !== '') {
					var propertSearchResultArray = resultArray.filter(function (item) {
						return item.propertyName && item.propertyName.search(search) > -1;
					});
					var unitSearchResultArray = resultArray.filter(function (item) {
						return item.unitNumber && item.unitNumber.search(search) > -1;
					});
					var residentSearchResultArray = resultArray.filter(function (item) {
						return item.user && item.user.displayName.search(search) > -1;
					});

					var searchResultArray = propertSearchResultArray.concat(unitSearchResultArray);
					searchResultArray = searchResultArray.concat(residentSearchResultArray);
					for (var i = 0; i < searchResultArray.length; ++i) {
						for (var j = i + 1; j < searchResultArray.length; ++j) {
							if (searchResultArray[i] === searchResultArray[j])
								searchResultArray.splice(j--, 1);
						}
					}
					if (sort.predicate) {
						searchResultArray.sort(dynamicSort(sort.predicate));
						if (sort.reverse) searchResultArray.sort(dynamicSort('-' + sort.predicate));
					}
					var returnResult = searchResultArray.slice(start, (start + num));
					res.json({count: searchResultArray.length, insurances: returnResult});
				} else {
					if (sort.predicate) {
						resultArray.sort(dynamicSort(sort.predicate));
						if (sort.reverse) resultArray.sort(dynamicSort('-' + sort.predicate));
					}
					var returnResult = resultArray.slice(start, (start + num));
					res.json({count: resultArray.length, insurances: returnResult});
				}
			});
		});
	});
};

exports.propertyInsurances = function(req, res) {
	var start = parseInt(req.query.start);
	var num = parseInt(req.query.num);
	var search = req.query.search || '';
	var sort = JSON.parse(req.query.sort) || {};
	var filterVal = req.query.filter;
	Property.findById(req.params.propertyId).exec(function(err, property) {
		User.find({propertyID: req.params.propertyId}).exec(function(err, users) {
			Unit.find({property: req.params.propertyId}).populate('property').populate('resident').exec(function (err, units) {
				var insuranceListCallback = [];
				var unit_residents = [];
				_.each(units, function (unit) {
					if(unit.resident && unit_residents.indexOf(unit.resident._id)< 0) unit_residents.push(unit.resident._id);
					insuranceListCallback.push(function (cb) {
						var policy_query = {user: unit.resident};
						Policy.find(policy_query).populate('user').exec(function (err, policies) {
							unit.policies = policies;
							cb(err, unit);
						});
					});
				});
				async.parallel(insuranceListCallback, function (err, results) {
					var unlinkUserInsuranceListCallback = [];
					_.each(users, function(user) {
						if(unit_residents.indexOf(user._id) < 0) {
							unlinkUserInsuranceListCallback.push(function(cb) {
								var policy_query = {user: user._id};
								Policy.find(policy_query).populate('user').exec(function (err, policies) {
									cb(err, {policies: policies, resident: user});
								});
							});
						}
					});
					async.parallel(unlinkUserInsuranceListCallback, function (err, unlink_results) {
						var resultArray = [];
						_.each(results, function (item) {
							if (item.policies.length > 0) {
								_.each(item.policies, function (policy) {
									var temp_insurance = policy.toObject();
									temp_insurance.unitNumber = item.unitNumber;
									temp_insurance.unitId = item._id;
									temp_insurance.residentName = policy.user.displayName;
									resultArray.push(temp_insurance);
								});
							} else {
								var temp_insurance = {};
								temp_insurance.unitNumber = item.unitNumber;
								temp_insurance.unitId = item._id;
								temp_insurance.residentName = item.resident ? item.resident.displayName : '';
								resultArray.push(temp_insurance);
							}
						});
						_.each(unlink_results, function (item) {
							if (item.policies.length > 0) {
								_.each(item.policies, function (policy) {
									var temp_insurance = policy.toObject();
									temp_insurance.unitNumber = null;
									temp_insurance.unitId = null;
									temp_insurance.residentName = policy.user.displayName;
									resultArray.push(temp_insurance);
								});
							} else {
								var temp_insurance = {};
								temp_insurance.unitNumber = null;
								temp_insurance.unitId = null;
								temp_insurance.residentName = item.resident ? item.resident.displayName : '';
								resultArray.push(temp_insurance);
							}
						});
						var notesCallbacks = [];
						_.each(resultArray, function (insurance) {
							notesCallbacks.push(function (cb) {
								Note.find({policy: insurance._id}).populate('editor').exec(function (err, notes) {
									var temp = insurance;
									temp.notes = notes;
									cb(err, temp);
								});
							});
						});
						async.parallel(notesCallbacks, function (err, results) {
							resultArray = results;
							if (search !== '') {

								var unitSearchResultArray = resultArray.filter(function (item) {
									return item.unitNumber && item.unitNumber.search(search) > -1;
								});
								var residentSearchResultArray = resultArray.filter(function (item) {
									return item.residentName.search(search) > -1;
								});

								var searchResultArray = unitSearchResultArray.concat(residentSearchResultArray);
								for (var i = 0; i < searchResultArray.length; ++i) {
									for (var j = i + 1; j < searchResultArray.length; ++j) {
										if (searchResultArray[i] === searchResultArray[j])
											searchResultArray.splice(j--, 1);
									}
								}
								if (sort.predicate) {
									searchResultArray.sort(dynamicSort(sort.predicate));
									if (sort.reverse) searchResultArray.sort(dynamicSort('-' + sort.predicate));
								}
								var returnResult = searchResultArray.slice(start, (start + num));
								res.json({count: searchResultArray.length, property: property, insurances: returnResult});
							} else {
								if (sort.predicate) {
									resultArray.sort(dynamicSort(sort.predicate));
									if (sort.reverse) resultArray.sort(dynamicSort('-' + sort.predicate));
								}
								var returnResult = resultArray.slice(start, (start + num));
								res.json({
									count: resultArray.length,
									property: property,
									insurances: returnResult
								});
							}
						});
					});
				});
			});
		});
	});
};

exports.recentInsuranceDetail = function(req, res) {
	var insurance = req.insurance;
	Unit.findOne({unitNumber: insurance.unitNumber, resident: insurance.user}).populate('property').exec(function(err, unit) {
		Note.find({policy: insurance._id}).populate('editor').exec(function (err, notes) {
			insurance = insurance.toObject();
			insurance.notes = notes;
			res.json({insurance: insurance, unit: unit});
		});
	});
};

exports.propertyInsuranceDetail = function(req, res) {
	var insurance = req.insurance;
	Property.findById(req.params.propertyId).exec(function(err, property) {
		Unit.findOne({_id: req.params.unitId}).exec(function(err, unit) {
			Note.find({policy: insurance._id}).populate('editor').exec(function (err, notes) {
				insurance = insurance.toObject()
				insurance.notes = notes;
				res.json({insurance: insurance, property: property, unit: unit});
			});
		});
	});
};

exports.updateStatusInsurance = function(req, res) {
	var insurance = req.insurance;
	insurance.status = req.body.status;
	insurance.updated = Date.now();
	insurance.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if(insurance.status == 'rejected') {
				Note.find({policy: insurance._id}).sort('-created').exec(function(err, notes) {
					var note = '';
					if(notes.length>0) note = notes[0].content;
					var params = [{
						key: '-firstName-',
						val: insurance.user.firstName
					}, {
						key: '-note-',
						val: note
					}];
					emailHandler.send('bcbd9047-8a3b-4b9c-82f4-a71966c929b2', params, insurance.user.email, 'You Policy Certificate was rejected', 'HO4 Rejected Email', function (err, result) {
						console.log(err);
					});
				});
			} else if(insurance.status == 'approved') {
				var params = [{
					key: '-firstName-',
					val: insurance.user.firstName
				}];
				emailHandler.send('e07ca774-385f-4962-b401-940fb1a09a6d', params, insurance.user.email, 'Account Set Up and Certificate Received Approval', 'Account Set Up and Certificate Received Approval', function (err, result) {
					console.log(err);
				});
			}
			res.json({success: true});
		}
	});
};

/**
 * Property middleware
 */
exports.insuranceByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Insurance is invalid'
		});
	}

	Policy.findById(id).populate('user').exec(function(err, insurance) {
		if (err) return next(err);
		if (!insurance) {
			return res.status(404).send({
				message: 'Insurance not found'
			});
		}
		req.insurance = insurance;
		next();
	});
};

var _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
var dateDiffInDays = function(a, b) {
	// Discard the time and time-zone information.
	var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

var checkExpireInsurances = function() {
	var today = new Date();
	var yesterday = today.setDate(today.getDate() - 1);
	Policy.find({policyEndDate: {$gt: yesterday}}).populate('user').exec(function(err, policies) {
		_.each(policies, function(policy) {
			var dateDiff = dateDiffInDays(today, new Date(policy.policyEndDate));
			if(dateDiff == 0) {
				Profile.findOne({user: policy.user._id}).exec(function(profile) {
					Property.findOne({_id: policy.user.propertyID}).populate('propertyManager').exec(function(err, property) {
						Unit.findOne({property: property._id, resident: policy.user._id}).exec(function(err, unit) {
							var params = [{
								key: '-Insured Name-',
								val: policy.user.displayName
							},{
								key: '-Address-',
								val: profile.address
							},{
								key: '-policy_number-',
								val: policy.policyNumber
							},{
								key: '-expire_date-',
								val: new Date(policy.policyEndDate).toDateString()
							}, {
								key: '-unitNumber-',
								val: unit.unitNumber
							}, {
								key: '-propertyName-',
								val: property.propertyName
							}, {
								key: '-link-',
								val: 'http://' + req.headers.host + '/#!/properties_by_manager/'+property.propertyManager._id+'/properties/'+property._id+'/units/'+unit._id+'/'+policy.user._id+'/insurances/'+policy._id
							}, {
								key: '-firstName-',
								val: property.propertyManager.firstName
							}];
							emailHandler.send('0c8352ee-49fc-40f8-afc3-3a66b3c6c596', params, property.propertyManager.email, 'Time to enroll unit in RLL', 'Insurance certificate was canceled', function (err, result) {
								console.log(err);
							});
							params = [{
								key: '-firstName-',
								val: policy.user.firstName
							}, {
								key: '-Insured Name-',
								val: policy.user.displayName
							},{
								key: '-Address-',
								val: profile.address
							},{
								key: '-policy_number-',
								val: policy.policyNumber
							},{
								key: '-expire_date-',
								val: new Date(policy.policyEndDate).toDateString()
							}, {
								key: '-unitNumber-',
								val: unit.unitNumber
							}, {
								key: '-propertyName-',
								val: property.propertyName
							}];
							emailHandler.send('55243257-bfe2-4e7d-b542-a5fa191c21bb', params, policy.user.email, 'Resident\'s Coverage was canceled', 'Insurance certificate was canceled', function (err, result) {
								console.log(err);
							});
						});
					});
				});
			} else if(dateDiff == 5) {
				var params = [{
					key: '-firstName-',
					val: policy.user.firstName
				}, {
					key: '***unit number and apartment community name***',
					val: policy.unitNumber + ' and ' + policy.insuranceName
				}, {
					key: '***date of experation from certificate of insurance***',
					val: new Date(policy.policyEndDate).toDateString()
				}];
				emailHandler.send('9a40f29f-70a6-4cf3-802b-fd96d95bd5af', params, policy.user.email, 'Your Policy Certificate expires in 5 days', 'Your Policy Certificate expires in 5 days', function (err, result) {
					console.log(err);
				});
			} else if(dateDiff == 15) {
				var params = [{
					key: '-firstName-',
					val: policy.user.firstName
				}, {
					key: '***unit number and apartment community name***',
					val: policy.unitNumber + ' and ' + policy.insuranceName
				}, {
					key: '***date of experation from certificate of insurance***',
					val: new Date(policy.policyEndDate).toDateString()
				}];
				emailHandler.send('1300288d-830e-4b04-8076-813033e8d672', params, policy.user.email, 'Your Policy Certificate expires in 15 days', 'Your Policy Certificate expires in 15 days', function (err, result) {
					console.log(err);
				});
			} else if(dateDiff == 30) {
				var params = [{
					key: '-firstName-',
					val: policy.user.firstName
				}, {
					key: '***unit number and apartment community name***',
					val: policy.unitNumber + ' and ' + policy.insuranceName
				}, {
					key: '***date of experation from certificate of insurance***',
					val: new Date(policy.policyEndDate).toDateString()
				}];
				emailHandler.send('f2b01e4a-493e-4841-9fb7-e5db6ef53510', params, policy.user.email, 'Your Policy Certificate expires in 30 days', 'Your Policy Certificate expires in 30 days', function (err, result) {
					console.log(err);
				});
			} else if(dateDiff == 60) {
				var params = [{
					key: '-firstName-',
					val: policy.user.firstName
				}, {
					key: '***unit number and apartment community name***',
					val: policy.unitNumber + ' and ' + policy.insuranceName
				}, {
					key: '***date of experation from certificate of insurance***',
					val: new Date(policy.policyEndDate).toDateString()
				}];
				emailHandler.send('56fd17e6-7d5c-4824-b1f8-384e9c0dc9ba', params, policy.user.email, 'Your Policy Certificate expires in 60 days', 'Your Policy Certificate expires in 60 days', function (err, result) {
					console.log(err);
				});
			} else if(dateDiff == 90) {
				var params = [{
					key: '-firstName-',
					val: policy.user.firstName
				}, {
					key: '***unit number and apartment community name***',
					val: policy.unitNumber + ' and ' + policy.insuranceName
				}, {
					key: '***date of experation from certificate of insurance***',
					val: new Date(policy.policyEndDate).toDateString()
				}];
				emailHandler.send('aa3755e6-aaea-437c-b7cf-229dc66d14d3', params, policy.user.email, 'Your Policy Certificate expires in 90 days', 'Your Policy Certificate expires in 90 days', function (err, result) {
					console.log(err);
				});
			}
		});
	});
};

schedule.scheduleJob({hour: 0, minute: 1}, function () {
	checkExpireInsurances();
});
