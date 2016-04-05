'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Policy = mongoose.model('Policy');

/**
 * Globals
 */
var user, policy;

/**
 * Unit tests
 */
describe('Policy Model Unit Tests:', function() {
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
			policy = new Policy({
				policyName: 'Policy Name',
				policyNumber: '123',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return policy.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without policy name', function(done) {
			policy.policyName = '';

			return policy.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Policy.remove().exec(function() {
			User.remove().exec(done);
		});
	});
});
