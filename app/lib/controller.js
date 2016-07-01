var keystone = require('keystone');
var _ = require('underscore');

var Cart = keystone.list('Cart');
var CartItem = keystone.list('CartItem');
var Product = keystone.list('Product');



exports = module.exports = {

    cart: {

        addItem: function(req, res, next) {

            if (req.user)
                var userID = req.user._id;

            var quantity = (req.body.quantity ? req.body.quantity : 1);
            Cart.model.findById(req.cookies.cart).populate('cartItems').exec(function(err, cart) {
                Cart.model.populate(cart, {
                    path: 'cartItems.product',
                    model: 'Product'
                }, function(err, cart) {

                    if (!cart)
                        cart = new Cart.model({
                            cartItems: []
                        });

                    Product.model.findOne({
                            slug: req.body.product_slug
                        },
                        function(err, product) {

                            var existingItem = _.filter(cart.cartItems, function(item) {
                                return _.some(item.product, {
                                    slug: product.slug
                                });
                            })[0];

                            if (typeof(existingItem) !== 'undefined') {
                                quantity = parseInt(existingItem.quantity) + parseInt(quantity);
                                CartItem.model
                                    .update({
                                        _id: existingItem._id
                                    }, {
                                        $set: {
                                            quantity: quantity
                                        }
                                    }, function(err) {
                                        if (!err) {
                                            req.flash('success', 'Added to cart');
                                        } else {
                                            req.flash('error', 'Error adding to cart');
                                        }
                                        cart.update(function() {
                                        	return res.redirect(req.headers.referer);
                                        });
                                    });
                            } else {
                                var newItem = new CartItem.model({
                                    product: product._id,
                                    quantity: quantity
                                });
                                newItem.save(function(err) {
                                    cart.cartItems.push(newItem._id);
                                    cart.save(function(err, cart) {
                                        if (!err) {
                                            res.cookie('cart', cart._id);
                                            req.flash('success', 'Added to cart');
                                        } else {
                                            req.flash('error', 'Error adding to cart');
                                        }
                                        cart.update(function() {
                                        	return res.redirect(req.headers.referer);
                                        });
                                    });
                                });
                            }

                        });
                });
            });


        },

        delete: function(req, res, next) {

            Cart.model
                .findById(req.cookies.cart)
                .exec(function(err, results) {

                    CartItem.model
                        .find()
                        .where('_id')
                        .in(results.cartItems)
                        .remove(function(err) {
                            console.log('Removed cart items.')
                            Cart.model
                                .findById(req.cookies.cart)
                                .remove(function(err) {
                                    console.log('remove', err);
                                    if (!err) {
                                        res.clearCookie("cart");
                                        req.flash('success', 'Deleted cart');
                                        return res.redirect('/shop');
                                    } else {
                                        req.flash('error', 'Error deleting cart');
                                    }
                                    next(err);
                                });
                        });


                })

        },

        removeItem: function(req, res, next) {

            Cart.model
                .findById(req.cookies.cart)
                .exec(function(err, cart) {

                    cart.cartItems = _.filter(cart.cartItems, function(item) {
                        if (item.toString() !== req.body.key.toString())
                            return item;
                    });

                    CartItem.model
                        .findById(req.body.key).remove(function() {
                            if (cart.cartItems.length) {
                                cart.save(function(err, cart) {
                                    if (!err) {
                                        req.flash('success', 'Removed item from cart');
                                    } else {
                                        req.flash('error', 'Error removing item from cart');
                                    }
                                    cart.update(function() {
                                        return res.redirect(req.headers.referer);
                                    });
                                });
                            } else {
                                cart.remove(function(err) {
                                    req.flash('warning', 'Cart is empty');
                                    res.clearCookie("cart");
                                    return res.redirect('/shop');
                                });
                            }
                        });

                });

        },

        update: function(req, res, next) {
            if (req.body.updatedItem) {

                var itemID = req.body.updatedItem;
                var quantity = req.body['quantity' + itemID];

                Cart.model
                    .findById(req.cookies.cart)
                    .exec(function(err, cart) {
                        CartItem.model
                            .findById(itemID)
                            .exec(function(err, item) {
                                item.quantity = quantity;
                                item.save(function(err) {
                                	cart.update(function(err) {
                                		return res.redirect(req.headers.referer);
                                	});
                                });
                            });
                    });


            } else if (req.body.removedItem) {

                var itemID = req.body.removedItem;
                Cart.model
                    .findById(req.cookies.cart)
                    .exec(function(err, cart) {

                        cart.cartItems = _.filter(cart.cartItems, function(item) {
                            if (item.toString() !== itemID.toString())
                                return item;
                        });

                        CartItem.model
                            .findById(itemID).remove(function() {
                                if (cart.cartItems.length) {
                                    cart.save(function(err, cart) {
                                        if (!err) {
                                            req.flash('success', 'Removed item from cart');
                                        } else {
                                            req.flash('error', 'Error removing item from cart');
                                        }
                                        cart.update(function() {
                                            return res.redirect(req.headers.referer);
                                        });
                                    });
                                } else {
                                    cart.remove(function(err) {
                                        req.flash('warning', 'Cart is empty');
                                        res.clearCookie("cart");
                                        return res.redirect('/shop');
                                    });
                                }
                            });

                    });
            }
        }


    }

}