var keystone = require('keystone');
var async = require('async');
var controller = require('../../lib/controller');
var _ = require('underscore');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    // Init locals
    locals.section = 'cart';
    locals.filters = {
        user: req.user,
    };
    locals.data = {
        items: [],
    };


    view.on('init', function(next) {

        if (!req.cookies.cart) {
            req.flash('warning', 'Cart is empty');
            return res.redirect(req.headers.referer);
        }

        keystone.list('Cart').model
            .findById(req.cookies.cart)
            .populate('cartItems')
            .exec(function(err, cart)  {
                keystone.list('Cart').model
                    .populate(cart, {
                        path: 'cartItems.product',
                        model: 'Product'
                    }, function(err, cart) {
                        locals.data.items = cart.cartItems;
                        locals.data.cost = cart.cost;
                        next(err);
                    });
            });

    });


    view.on('post', {
        action: 'delete-cart'
    }, function(next) {
        controller.cart.delete(req, res, next);
    });

    view.on('post', {
        action: 'remove-item'
    }, function(next) {
        controller.cart.removeItem(req,res,next);
    });

    view.on('post', {
        action: 'update-cart'
    }, function(next) {
        controller.cart.update(req,res,next);
    });


    view.render('cart');

};