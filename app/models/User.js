var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
    name: {
        type: Types.Name,
        index: true,
        dependsOn: {
            isGuest: false
        }
    },
    email: {
        type: Types.Email,
        initial: true,
        index: true,
        dependsOn: {
            isGuest: false
        }
    },
    password: {
        type: Types.Password,
        initial: true,
        dependsOn: {
            isGuest: false
        },
        default: function() {
        	return Math.random().toString(36).slice(-8);
        }
    },
    carts: {
    	type: Types.Relationship,
    	ref: 'Cart',
    	many: true
    },
}, 'Permissions', {
    isAdmin: {
        type: Boolean,
        label: 'Can access Keystone',
        index: true
    },
    isGuest: {
    	type: Boolean,
    	label: '',
    	required: true,
    	default: true
    }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
    return this.isAdmin;
});


/**
 * Relationships
 */
User.relationship({
    ref: 'Post',
    path: 'posts',
    refPath: 'author'
});
User.relationship({
    ref: 'Cart',
    path: 'carts',
    refPath: 'customer'
});


/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();