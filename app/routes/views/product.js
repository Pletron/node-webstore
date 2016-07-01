var keystone = require('keystone');
var Controller = require('../../lib/controller');


exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    // Set locals
    locals.section = 'shop';
    locals.filters = {
        product: req.params.product
    };
    locals.cart = req.cookies.cart;
    locals.data = {
        products: [],
        user: req.user
    };

    // Load the current product
    view.on('init', function(next) {

        var q = keystone.list('Product').model
            .findOne({
                slug: locals.filters.product,
            })
            .populate('categories');

        q.exec(function(err, result) {
            locals.data.product = result;
            next(err);
        });

    });

    // Load other products
    view.on('init', function(next) {

        var q = keystone.list('Product').model
            .find()
            .sort('-sold')
            .limit('4');

        q.exec(function(err, results) {
            locals.data.products = results;
            next(err);
        });

    });

    view.on('post', {
        action: 'add-to-cart'
    }, function(next) {
    	Controller.cart.addItem(req,res,next);
    });

    // Render the view
    view.render('product');
};