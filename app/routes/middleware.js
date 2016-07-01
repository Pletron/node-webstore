/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var keystone = require('keystone');
var _ = require('lodash');


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function(req, res, next) {
    res.locals.navLinks = [{
        label: 'Home',
        key: 'home',
        href: '/'
    }, {
        label: 'Blog',
        key: 'blog',
        href: '/blog'
    }, {
        label: 'Gallery',
        key: 'gallery',
        href: '/gallery'
    }, {
        label: 'Contact',
        key: 'contact',
        href: '/contact'
    }, {
        label: 'Shop',
        key: 'shop',
        href: '/shop'
    }, ];
    res.locals.user = req.user;

    if (req.cookies.cart) {
        keystone.list('Cart').model
            .findById(req.cookies.cart)
            .populate('cartItems')
            .exec(function(err, cart) {
                keystone.list('Cart').model
                    .populate(cart,{
                        path: 'cartItems.product',
                        model: 'Product'
                    },function(err, cart){
                        var items = 0;
                        _.each(cart.cartItems,function(item) {
                            items += (item.quantity);
                        });
                        if (items)
                            res.locals.cartItems = items;
                        next(err);
                    });
            });
    } else {
        next();
    }

};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function(req, res, next) {
    var flashMessages = {
        info: req.flash('info'),
        success: req.flash('success'),
        warning: req.flash('warning'),
        error: req.flash('error'),
    };
    res.locals.messages = _.some(flashMessages, function(msgs) {
        return msgs.length;
    }) ? flashMessages : false;
    next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function(req, res, next) {
    if (!req.user) {
        req.flash('error', 'Please sign in to access this page.');
        res.redirect('/keystone/signin');
    } else {
        next();
    }
};