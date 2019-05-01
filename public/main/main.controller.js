(function () {
    'use strict';

    projectMaple.controller('MainController', ['$scope', '$localStorage', '$http', '$uibModal', '$log', 'lodash', 'socket',
        function ($scope, $localStorage, $http, $uibModal, $log, _, socket) {
            const url = "http://localhost:8080/ProjectMaple/factory";
            $scope.factory = {
                id: null,
                name: "",
                upper: 300,
                lower: 0,
                numbers: []
            };
            socket.emit('get-factories');
            $scope.factories = [];

            socket.on('all-factories', function(data){
                $scope.factories  = data;
            });

            socket.on('generation-complete', function(data){
                $scope.factories = data;
            });

            $scope.onAddClick = function (ev, $element) {
                $scope.factory.id = $scope.factories.length + 1;
                socket.emit('add-factory', $scope.factory);
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
                _.each($scope.factories, function (factory) {
                    if ($scope.factory.id === id) {
                        $scope.factory = factory;
                        return true;
                    }
                })
            };
        }]);
})();