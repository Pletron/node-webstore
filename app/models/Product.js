var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Product Model
 * ==========
 */

var Product = new keystone.List('Product', {
    map: {
        name: 'title'
    },
    autokey: {
        path: 'slug',
        from: 'title',
        unique: true
    },
    track: true,
});

Product.add({
    title: {
        type: String,
        required: true
    },
    image: {
        type: Types.CloudinaryImage
    },
    content: {
        brief: {
            type: Types.Html,
            wysiwyg: true,
            height: 150
        },
        extended: {
            type: Types.Html,
            wysiwyg: true,
            height: 400
        },
    },
    gender: {
        type: Types.Select,
        options: [
            'male',
            'female'
        ],
        initial: true
    },
    sizes: {
        type: Types.TextArray,
        initial: true,
        default: ['']
    },
    price: {
        type: Types.Money,
        format: '0,0.00€',
        initial: true,
        required: true
    },
    categories: {
        type: Types.Relationship,
        ref: 'ProductCategory',
        initial: true,
        many: true
    },
    sold: {
        type: Types.Number,
        noedit: true,
        readonly: true,
        default: 0
    }
});

Product.schema.virtual('content.full').get(function() {
    return this.content.extended || this.content.brief;
});


Product.defaultColumns = 'title, state|20%, price|20%, sold|20%';
Product.register();