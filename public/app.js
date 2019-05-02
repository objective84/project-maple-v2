'use strict';

let projectMaple = angular
    .module('projectMaple', [
        'ngCookies',
        'ngRoute',
        'ngStorage',
        'ngLodash',
        'ui.bootstrap'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/main', {
                templateUrl: 'main/main.html',
                controller: 'MainController'
            })
            .otherwise({
                templateUrl: 'main/main.html',
                controller: 'MainController'
            });
    });
