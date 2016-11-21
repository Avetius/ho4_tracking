/**
 * Created by mbarrus on 5/13/16.
 */

var mongoose = require( 'mongoose' ),
	crypto = require( 'crypto' ),
	Schema = mongoose.Schema;

//Company Schema
var rllCompanySchema = new Schema(
	{
		name: String,
		address: {
			type : String,
		},
		city: {
			type : String,
		},
		state: {
			type : String,
		},
		zip: {
			type : String,
		},
		country: {
			type : String,
		},
		email: {
			type : String,
		},
		phone: {
			type : String,
		},
		status: {
			type : String,
			enum : [ 'active', 'deleted' ],
			default : 'active'
		},
		test_mode: Boolean,
		created_at: { type: Date },
		updated_at: { type: Date, default: Date.now },
		deleted_at: { type: Date },
		mysql_id: {
			type: Number,
			required: true,
			unique: true,
			index: true }
	}
);

rllCompanySchema.pre( 'save', function( next )
{
	// get the current date
	var currentDate = new Date();

	// change the updated_at field to current date
	this.updated_at = currentDate;

	// if created_at doesn't exist, add to that field
	if (!this.created_at)
		this.created_at = currentDate;

	next();
});

rllCompanySchema.set( 'toJSON', {
	getters: true,
	virtuals: true
} );

mongoose.model( 'Company', rllCompanySchema );
