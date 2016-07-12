'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return property.length;
};
/**
 * Unit Schema
 */
var UnitSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	unitNumber: {
		type: String,
		validate: [validateLocalStrategyProperty, 'Please fill in property name']
	},
	buildingNumber: {
		type: String
	},
	moveInDate: {
		type: Date
	},
	moveOutDate: {
		type: Date
	},
	property: {
		type: Schema.ObjectId,
		ref: 'Property'
	},
	resident: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Unit', UnitSchema);

var Unit = mongoose.model('Unit', UnitSchema);
