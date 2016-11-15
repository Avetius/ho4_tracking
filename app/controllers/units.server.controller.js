'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Property = mongoose.model('Property'),
	Unit = mongoose.model('Unit'),
	_ = require('lodash');

/**
 * Create a unit
 */
exports.create = function(req, res) {
	var unit = new Unit(req.body);
	unit.resident = req.user;
	unit.updated = Date.now();
	unit.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(unit);
		}
	});
};

exports.createUnitForProperty = function(req, res) {
	var unit = new Unit(req.body);
	//unit.resident = req.user;
	unit.property = req.property;
	var property = req.property;
	property.totalUnits = property.totalUnits + 1;
	unit.updated = Date.now();
	property.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			unit.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.json(unit);
				}
			});
		}
	});
};

/**
 * Show the current unit
 */
exports.read = function(req, res) {
	res.json(req.unit);
};

/**
 * Update a unit
 */
exports.update = function(req, res) {
	var unit = req.unit;
	if(req.body.resident) req.body.resident = req.body.resident._id;
	unit = _.extend(unit, req.body);
	unit.updated = Date.now();
	unit.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(unit);
		}
	});
};

/**
 * Delete a unit
 */
exports.delete = function(req, res) {
	var unit = req.unit;

	unit.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			Property.findById(unit.property).exec(function(err, property) {
				property.totalUnits = property.totalUnits - 1;
				property.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						res.json(unit);
					}
				});
			});
		}
	});
};

/**
 * List of Units
 */
exports.list = function(req, res) {
	var query = {};
	if(req.query.key) query = {unitNumber: {'$regex': req.query.key, '$options': 'i'}};
	Unit.find(query).sort('-created').populate('resident', 'displayName').exec(function(err, units) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(units);
		}
	});
};

exports.propertyUnitList = function(req, res) {
	var start = req.query.start;
	var num = req.query.num;
	var search = req.query.search || '';
	var sort = JSON.parse(req.query.sort) || {};
	var query = {property: req.params.propertyId};
	if(search && search !== '') if(search && search !== '') query = {$and: [{property: req.params.propertyId}, {unitNumber: {'$regex': search, '$options': 'i'}}]};;
	Unit.count(query, function (err, count) {
		var sortString = '-created';
		if(sort.predicate) {
			sortString = sort.predicate;
			if(sort.reverse) sortString = '-' + sortString;
		}
		Unit.find(query).sort(sortString).populate('resident', 'displayName').limit(num).skip(start).exec(function (err, units) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				if(req.query.propertyManagerId) {
					User.findById(req.query.propertyManagerId).exec(function (err, property_manager) {
						res.json({count: count, units: units, property: req.property, property_manager: property_manager});
					});
				} else {
					res.json({count: count, units: units, property: req.property, property_manager: null});
				}
			}
		});
	});
};

exports.propertyAllUnitList = function(req, res) {
	Unit.find({property: req.params.propertyId}).exec(function (err, units) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(units);
		}
	});
};
exports.mysqlpropertyUnitList = function(req, res) {
	console.log('mtav');
	console.log(req.params.mysql_pr_id);
	Unit.find({mysql_pr_id: req.params.mysql_pr_id}).exec(function (err, units) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log(units);
			res.json(units);
		}
	});
};

/**
 * Property middleware
 */
exports.unitByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Unit is invalid'
		});
	}

	Unit.findById(id).populate('resident', 'displayName').exec(function(err, unit) {
		if (err) return next(err);
		if (!unit) {
			return res.status(404).send({
				message: 'Unit not found'
			});
		}
		req.unit = unit;
		next();
	});
};
