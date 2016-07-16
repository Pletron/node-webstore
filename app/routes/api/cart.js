var async = require('async'),
    keystone = require('keystone'),
    Cart = keystone.list('Cart').model,
    CartItem = keystone.list('CartItem').model,
    User = keystone.list('User').model,
    Product = keystone.list('Product').model,
    _ = require('underscore');


var sendCart = function(res, message, cart) {
    cart.update(function(err) {
        Cart.findById(cart._id)
            .populate('cartItems')
            .exec(function(err, cart) {

                Cart.populate(cart, {
                    path: 'cartItems.product',
                    model: 'Product'
                }, function(err, cart) {
                    Cart.populate(cart, {
                        path: 'cartItems.product.categories',
                        model: 'ProductCategory'
                    }, function(err, cart) {
                        if (err) return res.apiError('database error', err);
                        res.apiResponse({
                            success: true,
                            message: message,
                            cart: cart
                        });

                    });
                });

            });
    });
};


exports.getCart = function(req, res) {
    Cart.findById(req.params.id)
        .exec(function(err, cart) {
            if (err)
                return res.apiError('database error', err);
            else if (!cart) {
                res.apiResponse({
                    success: false,
                    message: 'Did not find cart'
                });
            } else {
                sendCart(res, 'Found cart', cart);
            }
        });
}






exports.init = function(req, res) {

    var onSuccess = function(user)  {
        req.user = user;
    }

    var onFail = function(err)  {
        return res.apiError('failed creating guest session', err);
    }

    if (req.user) {
        var user = req.user;
    } else {
        var user = new User();
        user.save();
        keystone.session.signin(String(user._id), req, res, onSuccess, onFail);
    }
    var cart = new Cart({
        shipping: req.params.shipping,
        taxRate: req.params.taxRate,
        customer: user._id
    });
    cart.save(function(err) {
        if (err) return res.apiError('database error', err);
        user.carts.push(cart._id);
        user.save();
        sendCart(res, 'Initiated cart', cart);
    });
};

exports.addItem = function(req, res) {
    Cart.findById(req.params.id)
        .populate('cartItems')
        .exec(function(err, cart) {
            if (err || !cart) return res.apiError('database error', (err ? err : 'no cart found'));

            Product.findOne()
                .where({
                    slug: req.params.product
                })
                .exec(function(err, product) {
                    if (err ||  !product) return res.apiError('database error', (err ? err : 'product not found'));

                    var newItem = new CartItem({
                        product: product._id,
                        size: req.params.size,
                        quantity: req.params.quantity
                    });
                    newItem.save(function(err) {
                        if (err) return res.apiError('database error', err);

                        cart.cartItems.push(newItem._id);
                        cart.save(function(err) {
                            if (err) return res.apiError('database error', err);
                            sendCart(res, 'Added item to cart', cart);
                        });
                    });
                });

        });
};




// FIX REMOVE ONE ITEM WHEN MULTIPLE IN CART
exports.removeItem = function(req, res) {
    Cart.findById(req.params.id)
        .populate('cartItems')
        .exec(function(err, cart) {
            if (err || !cart) return res.apiError('database error', (err ? err : 'no cart found'));
            Cart.populate(cart, {
                path: 'cartItems.product',
                model: 'Product'
            }, function(err, cart) {


                var removeItem = _.filter(cart.cartItems, function(item) {
                    if (String(item.product.slug) === String(req.params.product) &&
                        String(item.size) === String(req.params.size))
                        return item;
                });

                CartItem.findById(removeItem[0]._id)
                    .remove(function(err) {
                        if (err) return res.apiError('database error', err);

                        cart.cartItems = _.filter(cart.cartItems, function(item) {
                            if (String(item._id) !== String(removeItem[0]._id))
                                return item;
                        });
                        cart.save(function(err) {
                            if (err) return res.apiError('database error', err);
                            sendCart(res, 'Removed item from cart', cart);
                        });
                    });

            });
        });
};

exports.updateItem = function(req, res) {
    Cart.findById(req.params.id)
        .populate('cartItems')
        .exec(function(err, cart) {
            if (err || !cart) return res.apiError('database error', (err ? err : 'no cart found'));

            Product.findOne()
                .where({
                    slug: req.params.product
                })
                .exec(function(err, product) {
                    if (err) return res.apiError('database error', err);

                    var inCart = _.filter(cart.cartItems, function(item) {
                        if (String(item.product) === String(product._id) &&
                            String(item.size) === String(req.params.size))
                            return item;
                    })[0];
                    
                    if (inCart) {
                        CartItem.findOne(inCart._id,
                            function(err, item) {
                                if (err || !item) return res.apiError('database error', (err ? err : 'item not found in cart'));

                                item.quantity = parseInt(req.params.quantity);
                                item.save(function(err) {
                                    if (err) return res.apiError('database error', err);
                                    sendCart(res, 'Updated item in cart', cart);
                                });
                            }
                        );
                    } else {
                        addItem(req, res);
                    }

                });
        });
};

exports.delete = function(req, res) {

    Cart.findById(req.params.id)
        .exec(function(err, cart) {
            if (err) return res.apiError('database error', err);

            if (!cart)
                res.apiResponse({
                    success: false,
                    message: 'No cart found'
                });

            CartItem.find()
                .where('_id')
                .in(cart.cartItems)
                .remove(function(err) {
                    if (err) return res.apiError('database error', err);

                    var userID = String(cart.customer);
                    cart.remove(function(err) {
                        if (err) return res.apiError('database error', err);

                        User.findById(userID)
                            .exec(function(err, user) {
                                if (err || !user) return res.apiError('database error', (err ? err : 'no user found'));
                                user.carts = _.filter(user.carts, function(userCart) {
                                    if (String(userCart) !== String(cart._id))
                                        return userCart;
                                });


                                if (user.carts.length < 1 && user.isGuest) {
                                    user.remove(function(err) {
                                        if (err) return res.apiError('database error', err);
                                        res.apiResponse({
                                            success: true,
                                            message: 'Successfully deleted cart and guest',
                                            cartID: req.params.id
                                        });
                                    });
                                } else {
                                    user.save(function(err) {
                                        if (err) return res.apiError('database error', err);
                                        res.apiResponse({
                                            success: true,
                                            message: 'Successfully deleted cart',
                                            cartID: req.params.id
                                        });
                                    });
                                }

                            });

                    });

                });

        });
}