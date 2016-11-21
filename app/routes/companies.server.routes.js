'use strict';

/**
 * Module dependencies.
 */
console.log('mtav router');
module.exports = function(app) {
	var companies = require('../../app/controllers/companies.server.controller');

	app.route('/company_list').get(companies.all_list)
	app.route('/company/:companyId').get(companies.get_company_by_id)


};
