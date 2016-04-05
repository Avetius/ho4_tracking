'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Policy = mongoose.model('Policy'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, policy;

/**
 * Policy routes tests
 */
describe('Policy CRUD tests', function() {
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

		// Save a user to the test db and create new policy
		user.save(function() {
			policy = {
				policyName: 'Policy Name',
				policyNumber: '123'
			};

			done();
		});
	});

	it('should be able to save policy if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new policy
				agent.post('/policy')
					.send(policy)
					.expect(200)
					.end(function(policySaveErr, policySaveRes) {
						// Handle policy save error
						if (policySaveErr) done(policySaveErr);

						// Get a list of policy
						agent.get('/policy')
							.end(function(policiesGetErr, policiesGetRes) {
								// Handle policy save error
								if (policiesGetErr) done(policiesGetErr);

								// Get policy list
								var policies = policiesGetRes.body;

								// Set assertions
								(policies[0].user._id).should.equal(userId);
								(policies[0].policyName).should.match('Policy Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save policy if not logged in', function(done) {
		agent.post('/policy')
			.send(policy)
			.expect(401)
			.end(function(policySaveErr, policySaveRes) {
				// Call the assertion callback
				done(policySaveErr);
			});
	});

	it('should not be able to save policy if no policy name is provided', function(done) {
		// Invalidate title field
		policy.policyName = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new policy
				agent.post('/policy')
					.send(policy)
					.expect(400)
					.end(function(policySaveErr, policySaveRes) {
						// Set message assertion
						(policySaveRes.body.message).should.match('Please fill in policy name');

						// Handle policy save error
						done(policySaveErr);
					});
			});
	});

	it('should be able to update policy if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new policy
				agent.post('/policy')
					.send(policy)
					.expect(200)
					.end(function(policySaveErr, policySaveRes) {
						// Handle policy save error
						if (policySaveErr) done(policySaveErr);

						// Update policy name
						policy.policyName = 'WHY YOU GOTTA BE SO MEAN?';

						// Update an existing policy
						agent.put('/policy/' + policySaveRes.body._id)
							.send(policy)
							.expect(200)
							.end(function(policyUpdateErr, policyUpdateRes) {
								// Handle policy update error
								if (policyUpdateErr) done(policyUpdateErr);

								// Set assertions
								(policyUpdateRes.body._id).should.equal(policySaveRes.body._id);
								(policyUpdateRes.body.policyName).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of policies if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);
				// Create new policy model instance
				agent.post('/policy')
					.send(policy)
					.expect(200)
					.end(function(policySaveErr, policySaveRes) {
						// Handle policy save error
						if (policySaveErr) done(policySaveErr);
						// Request policy
						agent.get('/policy')
							.end(function (req, res) {
								// Set assertion
								res.body.should.be.an.Array.with.lengthOf(1);

								// Call the assertion callback
								done();
							});
					});

			});
	});


	it('should be able to get a single policy if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);
				agent.post('/policy')
					.send(policy)
					.expect(200)
					.end(function(policySaveErr, policySaveRes) {
						// Handle policy save error
						if (policySaveErr) done(policySaveErr);
						agent.get('/policy/' + policySaveRes.body._id)
							.end(function (req, res) {
								// Set assertion
								res.body.should.be.an.Object.with.property('policyName', policy.policyName);

								// Call the assertion callback
								done();
							});
				});
			});
	});

	afterEach(function(done) {
		User.remove().exec(function() {
			Policy.remove().exec(done);
		});
	});
});
