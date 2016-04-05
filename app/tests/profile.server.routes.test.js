'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, profile;

/**
 * Profile routes tests
 */
describe('Profile Read, Update tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'test@test.com',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new profile
		user.save(function() {
			profile = {
				phoneNumber: 'Phone Number',
				address: 'Address'
			};

			done();
		});
	});

	it('should be able to update profile if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new profile
				var profileObj = new Profile({
					phoneNumber: 'Phone Number',
					address: 'Address',
					user: user
				});
				profileObj.save(function() {
					// Update profile address
					profile.address = 'WHY YOU GOTTA BE SO MEAN?';

					// Update an existing article
					agent.put('/profiles/byuser/' + userId)
						.send(profile)
						.expect(200)
						.end(function(profileUpdateErr, profileUpdateRes) {
							// Handle profile update error
							if (profileUpdateErr) done(profileUpdateErr);

							// Set assertions
							(profileUpdateRes.body._id).should.equal(profileUpdateRes.body._id);
							(profileUpdateRes.body.address).should.match('WHY YOU GOTTA BE SO MEAN?');

							// Call the assertion callback
							done();
						});
				});
			});
	});

	it('should be able to get a single profiles if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new profile
				var profileObj = new Profile({
					phoneNumber: 'Phone Number',
					address: 'Address',
					user: user
				});
				profileObj.save(function() {
					agent.get('/profiles/byuser/' + userId)
						.expect(200)
						.end(function(profileGetErr, profileGetRes) {
							// Handle profile get error
							if (profileGetErr) done(profileGetErr);
							profileGetRes.body.should.be.an.Object.with.property('address', profile.address);

							// Call the assertion callback
							done();
						});
				});
			});
	});

	afterEach(function(done) {
		User.remove().exec(function() {
			Profile.remove().exec(done);
		});
	});
});
