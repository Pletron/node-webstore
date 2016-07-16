var keystone = require('keystone');
var _ = require('underscore');
var Types = keystone.Field.Types;
var async = require('async');


/**
 * Cart Model
 * ==================
 */

var Cart = new keystone.List('Cart', {
    autokey: {
        from: 'id',
        path: 'key',
        unique: true
    },
    track: true,
});

Cart.add({
    customer: {
        type: Types.Relationship,
        ref: 'User',
        many: false
    },
    status: {
        type: Types.Select,
        options: 'unpaid, paid, shipped, returned, final',
        required: true,
        default: 'unpaid'
    },
    cartItems: {
        type: Types.Relationship,
        ref: 'CartItem',
        many: true
    },
    cost: {
        type: Types.Money,
        format: '0,0.00€',
        default: 0,
        required: true
    },
    taxRate: {
        type: Types.Number,
        default: 23
    },
    tax: {
        type: Types.Money,
        format: '0,0.00€',
        default: 0,
        required: true
    },
    shipping: {
        type: Types.Money,
        format: '0,0.00€',
        default: 0,
        required: true
    }
});


Cart.schema.pre('save', function(next) {
    // CALCULATE NEW CART COST
    var self = this;
    keystone.list('CartItem').model
        .find()
        .where('_id').in(self.cartItems)
        .populate('product')
        .exec(function(err, items) {
            var cost = 0;
            _.each(items, function(item) {
                cost += item.product.price * item.quantity;
            });
            self.cost = cost;
            next(err);
        });

});

Cart.schema.pre('update', function(next) {
    // CALCULATE NEW CART COST
    keystone.list('Cart').model
        .findById(this._id)
        .exec(function(err, cart) {
            keystone.list('CartItem').model
                .find()
                .where('_id').in(cart.cartItems)
                .populate('product')
                .exec(function(err, items) {
                    var cost = 0;
                    _.each(items, function(item) {
                        cost += item.product.price * item.quantity;
                    });
                    cart.tax = cost*(cart.taxRate/100);
                    cart.cost = cost;
                    cart.save(next);
                });
        });
});



Cart.relationship({
    ref: 'CartItem',
    path: 'items'
});

Cart.register();