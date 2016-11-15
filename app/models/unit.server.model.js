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
	},
	description:String,
	mysql_c_id: { type: Number },
	mysql_pr_id: { type: Number, required: true },
	mysql_id: {
		type: Number,
		required: true,
		unique: true,
		index: true }
});

mongoose.model('Unit', UnitSchema);
