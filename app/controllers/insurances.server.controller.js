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
	Policy.count({user: req.params.residentId}, function (err, count) {
		Profile.findOne({user: req.params.residentId}).populate('user').exec(function(err, profile) {
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
	if(policy.insuranceFilePath && policy.insuranceFilePath !== '') policy.status = 'pending';
	else policy.status = 'incomplete';
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
		if(policy.insuranceFilePath && policy.insuranceFilePath !== '') policy.status = 'pending';
		else policy.status = 'incomplete';
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
						return item.propertyName.search(search) > -1;
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
};

exports.recentInsuranceDetail = function(req, res) {
	var insurance = req.insurance;
	Note.find({policy: insurance._id}).populate('editor').exec(function(err, notes) {
		insurance = insurance.toObject()
		insurance.notes = notes;
		res.json({insurance: insurance});
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
