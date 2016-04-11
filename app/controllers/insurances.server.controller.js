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
					res.json({count: count, insurances: insurances, property: req.property, unit: req.unit, resident: profile});
				}
			});
		});
	});
};

exports.residentInsurance = function(req, res) {
	res.json({insurance: req.insurance, property: req.property, unit: req.unit});
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
