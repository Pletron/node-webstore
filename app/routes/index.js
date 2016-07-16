/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);
	app.get('/blog/:category?', routes.views.blog);
	app.get('/blog/post/:post', routes.views.post);
	app.get('/gallery', routes.views.gallery);
	app.all('/contact', routes.views.contact);
	
	app.get('/shop', routes.views.shop);





	// API

	app.put('/api/cart/init/:shipping/:taxRate', keystone.middleware.api, routes.api.cart.init);
	app.get('/api/cart/:id', keystone.middleware.api, routes.api.cart.getCart);
	app.put('/api/cart/:id/additem/:product/:size/:quantity', keystone.middleware.api, routes.api.cart.addItem);
	app.put('/api/cart/:id/updateitem/:product/:size/:quantity', keystone.middleware.api, routes.api.cart.updateItem);
	app.delete('/api/cart/:id/:product/:size', keystone.middleware.api, routes.api.cart.removeItem);
	app.delete('/api/cart/:id', keystone.middleware.api, routes.api.cart.delete);


	app.get('/api/product/list/:category?', keystone.middleware.api, routes.api.product.list);
	app.get('/api/product/:slug', keystone.middleware.api, routes.api.product.get);


	// app.put('/api/cart/', keystone.middleware.api, routes.api.cart.newCart);
	// app.get('/api/cart/:id', keystone.middleware.api, routes.api.cart.get);

	// // app.get('/api/cart/:id', keystone.middleware.api, routes.api.cart.get);
	// // app.put('/api/cart/', keystone.middleware.api, routes.api.cart.newCart);
	// app.put('/api/cart/:id/additem/:product/:size/:quantity?', keystone.middleware.api, routes.api.cart.addItem);
	// // app.put('/api/cart/:id/update/:product/:size/:quantity', keystone.middleware.api, routes.api.cart.updateItem);
	// app.delete('/api/cart/:id', keystone.middleware.api, routes.api.cart.delete);
	// // app.delete('/api/cart/:id/:product', keystone.middleware.api, routes.api.cart.removeItem);
	

	// // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// // app.get('/protected', middleware.requireUser, routes.views.protected);

};
