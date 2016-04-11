'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),
	async = require('async'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile'),
	Property = mongoose.model('Property'),
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
	var files = req.files;
	if (files.file) {
		if (!fs.existsSync(path.resolve('public/insurance'))){
			fs.mkdirSync(path.resolve('public/insurance'), '0777');
		}
		var fileName = files.file.name;
		var i = fileName.lastIndexOf('.');
		var fileExt = (i < 0) ? '' : fileName.substr(i);
		var newFileName = crypto.randomBytes(32).toString('base64');
		newFileName=newFileName.replace(/[=&\/\\#,+()$~%.'":*?<>{}]/g, '').replace(/\s/g, '');
		fs.rename(files.file.path, path.resolve('public/insurance/' + newFileName+fileExt), function () {
			res.jsonp({file: '/insurance/'+newFileName+fileExt, path: '/insurance/'+newFileName+fileExt, is_pdf: fileExt.indexOf('pdf') > -1});
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
	var query = {user: req.user._id};
	if(req.user.roles.indexOf('admin') > -1) {
		query = {};
	}
	Policy.find(query).populate('user').sort('-updated').exec(function(err, policies) {
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

exports.getPolicy = function(req, res) {
	Policy.findOne({_id: req.params.policyId}).exec(function(err, policy) {
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

exports.getAllResidentsList = function(req, res) {
	User.find({roles: 'user'}).exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.json(users);
	});
};

exports.getAllPropertyManagerList =  function(req, res) {
	var start = req.query.start;
	var num = req.query.num;
	var query = {roles: 'pmanager'};
	User.count(query, function (err, count) {
		User.find(query).limit(num).skip(start).exec(function (err, users) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			var user_property_callbacks = [];
			_.each(users, function(user) {
				user_property_callbacks.push(function(cb) {
					Property.count({propertyManager: user._id}, function (err, property_count) {
						var tmp_user = user.toObject();
						tmp_user.property_count = property_count;
						cb(err, tmp_user);
					});
				});
			});
			async.parallel(user_property_callbacks, function(err, results) {
				res.json({count: count, property_managers: results});
			});
		});
	});
};

exports.addPropertyManaget = function(req, res) {
	var propertyManager = new User(req.body);
	propertyManager.displayName = propertyManager.firstName + ' ' + propertyManager.lastName;
	propertyManager.username = propertyManager.email;
	propertyManager.roles = ['pmanager'];
	propertyManager.provider = 'local';
	propertyManager.password = 'password';
	propertyManager.updated = Date.now();
	propertyManager.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var profile = new Profile({
				user: propertyManager._id
			});
			profile.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				res.json(propertyManager);
			});
		}
	});
};

exports.getPropertyManager = function(req, res) {
	User.findById(req.params.propertyManagerId).exec(function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.json(user);
	});
};

exports.updatePropertyManager = function(req, res) {
	var updateObj = {firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, displayName: req.body.firstName + ' ' + req.body.lastName};
	User.update({_id: req.params.propertyManagerId}, updateObj, function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.json(user);
	})
};

exports.deletePropertyManager = function(req, res) {
	User.findById(req.params.propertyManagerId).exec(function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		user.remove(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(user);
			}
		});
	});
};
