'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Property = mongoose.model('Property'),
	emailHandler = require('./email.server.controller.js'),
	_ = require('lodash');

/**
 * Create a property
 */
exports.create = function(req, res) {
	var propertyManager = req.body.propertyManager;
	if(req.body.propertyManager) {
		req.body.propertyManager = req.body.propertyManager._id;
	}
	var property = new Property(req.body);
	property.updated = Date.now();
	property.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if(propertyManager) {
				var params = [{
					key: '-firstName-',
					val: propertyManager.firstName
				}, {
					key: '-property_name-',
					val: property.propertyName
				}, {
					key: '-property_manager_email-',
					val: propertyManager.email
				}, {
					key: '-password-',
					val: ''
				}, {
					key: '-link-',
					val: 'http://' + req.headers.host + '/#!/signin'
				}];
				emailHandler.send('db25d056-0667-49a8-aec7-af46680e6132', params, propertyManager.email, 'You\'ve been assigned to a property', 'You\'ve been assigned to a property', function (err, result) {
					console.log(err);
				});
			}
			res.json(property);
		}
	});
};

/**
 * Show the current property
 */
exports.read = function(req, res) {
	res.json(req.property);
};

/**
 * Update a property
 */
exports.update = function(req, res) {
	var property = req.property;
	if(req.body.propertyManager) req.body.propertyManager = req.body.propertyManager._id;
	property = _.extend(property, req.body);
	property.updated = Date.now();

	property.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(property);
		}
	});
};

/**
 * Delete a property
 */
exports.delete = function(req, res) {
	var property = req.property;

	property.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(property);
		}
	});
};

/**
 * List of Properties
 */
exports.list = function(req, res) {
	var start = req.query.start;
	var num = req.query.num;
	var search = req.query.search || '';
	var sort = JSON.parse(req.query.sort) || {};
	var query = {};
	if(search && search !== '') query = {propertyName: {'$regex': search, '$options': 'i'}};
	if(!req.query.propertyCode && req.user.roles && req.user.roles.indexOf('pmanager')>-1) {
		query = {propertyManager: req.user.id};
		if(search && search !== '') query = {$and: [{propertyManager: req.user.id}, {propertyName: {'$regex': search, '$options': 'i'}}]};
	}

	if(req.query.propertyManagerId) {
		query = {propertyManager: req.query.propertyManagerId};
	}
	if(req.query.propertyCode) {
		query = {propertyCode: req.query.propertyCode};
	}

	Property.count(query, function (err, count) {
		var sortString = '-created';
		if(sort.predicate) {
			sortString = sort.predicate;
			if(sort.reverse) sortString = '-' + sortString;
		}
		Property.find(query).sort(sortString).populate('propertyManager', 'displayName').limit(num).skip(start).exec(function (err, properties) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				if(req.query.propertyManagerId) {
					User.findById(req.query.propertyManagerId).exec(function (err, property_manager) {
						res.json({count: count, properties: properties, property_manager: property_manager});
					});
				} else {
					User.find({roles: 'pmanager'}).exec(function (err, managers) {
						res.json({count: count, properties: properties, property_manager: null, managers: managers});
					});
				}
			}
		});
	});
};

exports.all_list = function(req, res) {
	Property.find({}).exec(function (err, properties) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(properties);
		}
	});
};

exports.propertyListForPropertyManager = function(req, res) {
	var query = {propertyManager: req.user.id};
	Property.find(query).sort('propertyName').exec(function (err, properties) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(properties);
		}
	});
};

/**
 * Property middleware
 */
exports.propertyByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Property is invalid'
		});
	}

	Property.findById(id).populate('propertyManager', 'displayName').exec(function(err, property) {
		if (err) return next(err);
		if (!property) {
			return res.status(404).send({
				message: 'Property not found'
			});
		}
		req.property = property;
		next();
	});
};

/**
 * Property middleware
 */
exports.getByCode = function(req, res, next) {

	console.log(req.query.code);
	Property.find({propertyCode:req.query.code}).populate('propertyManager', 'displayName').exec(function(err, property) {
		/*if (err) return next(err);
		if (!property) {
			return res.status(404).send({
				message: 'Property not found'
			});
		}*/
		req.property = property;
		next();
	});
};
