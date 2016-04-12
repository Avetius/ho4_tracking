'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile'),
	Policy = mongoose.model('Policy'),
	_ = require('lodash');

/**
 * Show the current insurance
 */
exports.read = function(req, res) {
	res.json(req.insurance);
};

exports.residentInsurances = function(req, res) {
	Policy.count({user: req.params.residentId}, function (err, count) {
		Profile.findOne({user: req.params.residentId}).populate('user').exec(function(err, profile) {
			Policy.find({user: req.params.residentId}).sort('-created').populate('user', 'displayName').exec(function (err, insurances) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					if(req.query.propertyManagerId) {
						User.findById(req.query.propertyManagerId).exec(function (err, property_manager) {
							res.json({count: count, insurances: insurances, property: req.property, unit: req.unit, resident: profile, property_manager: property_manager});
						});
					} else {
						res.json({count: count, insurances: insurances, property: req.property, unit: req.unit, resident: profile});
					}
				}
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
	policy.user = req.params.residentId;
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

exports.recentInsurances = function(req, res) {
	var start = req.query.start;
	var num = req.query.num;
	var query = {};
	Policy.count(query, function (err, count) {
		Policy.find(query).sort('-created').populate('user', 'displayName').limit(num).skip(start).exec(function (err, insurances) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json({count: count, insurances: insurances});
			}
		});
	});
};

exports.recentInsuranceDetail = function(req, res) {
	res.json({insurance: req.insurance});
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

	Policy.findById(id).populate('user', 'displayName').exec(function(err, insurance) {
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
