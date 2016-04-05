'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile');

/**
 * Globals
 */
var user, profile;

/**
 * Unit tests
 */
describe('Profile Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});

		user.save(function() {
			profile = new Profile({
				phoneNumber: 'Phone number',
				address: 'Address',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return profile.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Profile.remove().exec(function() {
			User.remove().exec(done);
		});
	});
});
