'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile'),
	Policy = mongoose.model('Policy');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

exports.getProfileByUserId = function(req, res) {
	Profile.findOne({user: req.params.userId}).populate('user').exec(function(err, profile) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(profile);
		}
	});
};

exports.updateProfile = function(req, res) {
	var user = req.user;
		Profile.findOne({user: req.params.userId}).populate('user').exec(function(err, profile) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			profile = _.extend(profile, req.body);
			user.firstName  = profile.user.firstName;
			user.lastName  = profile.user.lastName;
			user.email  = profile.user.email;
			user.updated = Date.now();
			user.displayName = user.firstName + ' ' + user.lastName;
			profile.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					user.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							res.json(profile);
						}
					});
				}
			});

		}
	});
};

exports.uploadInsurance = function(req, res) {
	var fields = req.body;
	var files = req.files;
	if (files.file) {
		var fileName = files.file.name;
		if (!fs.existsSync(path.resolve('public/insurance'))){
			fs.mkdirSync(path.resolve('public/insurance'), '0777');
		}
		fs.rename(files.file.path, path.resolve('public/insurance/' + fileName), function () {
			res.jsonp({file: fileName});
		});
	} else {
		res.status(400).send({error: 'File upload error'});
	}
};

exports.getPoliciesByUserId = function(req, res) {
	Policy.find({user: req.params.userId}).populate('user').exec(function(err, policies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(policies);
		}
	});
};

exports.getPolicies = function(req, res) {
	Policy.find({user: req.user._id}).populate('user').sort('-updated').exec(function(err, policies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(policies);
		}
	});
};

exports.createPolicy = function(req, res) {
	var policy = new Policy(req.body);
	policy.user = req.user;

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

exports.getPolicy = function(req, res) {
	Policy.findOne({_id: req.params.policyId}).exec(function(err, policy) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!policy) {
			return res.status(404).send({
				message: 'Policy not found'
			});
		}

		res.json(policy);
	});
};

exports.updatePolicy = function(req, res) {
	Policy.findOne({_id: req.params.policyId}).populate('user').exec(function(err, policy) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!policy) {
			return res.status(404).send({
				message: 'Policy not found'
			});
		}

		policy = _.extend(policy, req.body);
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
