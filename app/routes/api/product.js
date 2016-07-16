var async = require('async'),
    keystone = require('keystone');


var Product = keystone.list('Product').model;
var ProductCategory = keystone.list('ProductCategory').model;





exports.get = function(req, res) {

    Product.findOne({
        slug: req.params.slug
    }, function(err, result) {

        if (err) return res.apiError('database error', err);
        res.apiResponse({
            product: result
        });

    });
}

exports.list = function(req, res) {

    ProductCategory.findOne({
        key: new RegExp('^' + req.params.category + '$', "i")
    }, function(err, category) {

        if (err) return res.apiError('database error', err);

        var q = Product.find();

        if (category) {
            q.where('categories').in([category.id]);
        } else if (req.params.category) {
            return res.apiError('database error', err);
        }

        q.exec(function(err, result) {
            if (err) return res.apiError('database error', err);
            res.apiResponse({
                products: result
            });
        });

    });
}