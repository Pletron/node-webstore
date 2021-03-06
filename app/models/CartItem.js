var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * CartItem Model
 * ==========
 */

var CartItem = new keystone.List('CartItem', {
    autokey: {
        path: 'key',
        from: '_id',
        unique: true
    },
    hidden: true,
    nocreate: true
});

CartItem.add({
    product: {
        type: Types.Relationship,
        ref: 'Product',
        many: false,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    quantity: {
        type: Types.Number,
        required: true,
        default: 1
    }
});


CartItem.register();