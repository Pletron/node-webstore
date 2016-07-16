var app = angular.module('shop', ['ngCookies', 'ngCart']);

app.controller('shopCtrl', ['$scope', '$http', '$cookies', '$cookieStore', 'ngCart',
    function($scope, $http, $cookies, $cookieStore, ngCart) {


        var taxRate = 7.5;
        var shipping = 2.99;

        var initCart = function()  {
            ngCart.empty()
            ngCart.setTaxRate(taxRate);
            ngCart.setShipping(shipping);
        };


        $http.get('/api/product/list').then(function(res) {
            $scope.products = res.data.products;
        });


        if (!ngCart.getID()) {
            initCart();
        } else {
            $http.get('/api/cart/' + ngCart.getID()).then(function(res) {
                if (!res.data.success) {
                    initCart();
                }
            });
        }



        var printRes = function(res) {
            console.log(res);
        };

        $scope.$on('ngCart:itemAdded', function(event, item) {
            if (!ngCart.getID()) {
                $http.put('/api/cart/init/' + shipping + '/' + taxRate)
                    .success(function(res) {
                        ngCart.setID(res.cart._id);
                        $http.put('/api/cart/' + ngCart.getID() + '/additem/' + item.getId().split('#')[0] + '/' + item.getSize() + '/' + item.getQuantity()).then(printRes);
                    });
            } else {
                $http.put('/api/cart/' + ngCart.getID() + '/additem/' + item.getId().split('#')[0] + '/' + item.getSize() + '/' + item.getQuantity()).then(printRes);
            }
        });
        $scope.$on('ngCart:itemUpdated', function(event, item) {
            $http.put('/api/cart/' + ngCart.getID() + '/updateitem/' + item.getId().split('#')[0] + '/' + item.getSize() + '/' + item.getQuantity()).then(printRes);
        });
        $scope.$on('ngCart:itemRemoved', function(event, item) {
            $http.delete('/api/cart/' + ngCart.getID() + '/' + item.split('#')[0] + '/' + item.split('#')[1]).then(printRes);
        });
        $scope.$on('ngCart:cartEmptied', function(event, item) {
            $http.delete('/api/cart/' + item.id).then(printRes);
        });


    }
]);