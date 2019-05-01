'use strict';

var projectMaple = angular
    .module('projectMaple', [
        'ngCookies',
        'ngRoute',
        // 'ngSanitize',
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
                redirectTo: '/main'
            });
    });
