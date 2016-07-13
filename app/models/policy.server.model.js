'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


/**
 * Policy Schema
 */
var PolicySchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	unitNumber: {
		type: String
	},
	ApiUnitId:{
		type:String
	},
	ApiResId:{
	   type: Number
	},
	policyHolderName: {
		type: String
	},
	policyName: {
		type: String,
		trim: true
	},
	policyNumber: {
		type: String
	},
	policyStartDate: {
		type: Date
	},
	policyEndDate: {
		type: Date
	},
	insuranceFilePath: {
		type: String
	},
	status: {
		type: String,
		trim: true,
		default: 'pending'
	},
	insuranceName: {
		type: String
	},
	insurerName: {
		type: String
	},
	user: {
		type: Object
	}
});

mongoose.model('Policy', PolicySchema);
