(function () {
    'use strict';

    projectMaple.controller('MainController', function ($scope, $http, $uibModal, $log) {
            const url = "http://localhost:8080/ProjectMaple/factory";
            $scope.factory = {
                id: null,
                name: "",
                upperLimit: 300,
                lowerLimit: 0,
                numbers: []
            };
            $scope.addPanelToggled = false;
            $scope.factories = [];


            $scope.onAddClick = function (ev, $element) {

            };

            $scope.onGenerateClick = function (id) {
                const modalInstance = $uibModal.open({
                    templateUrl: 'generateModal.html',
                    controller: 'GenerateController',
                    resolve: {
                        items: {
                            id: id
                        }
                    }
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.onEditClick = function (id) {
                // _.each($scope.factories, function (factory) {
                //     if ($scope.factory.id === id) {
                //         $scope.factory = factory;
                //         return true;
                //     }
                // })
            };
        });
})();