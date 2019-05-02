'use strict';

projectMaple.controller('MainController', ['$scope', '$localStorage', '$http', '$uibModal', '$log', 'lodash', 'socket',
    function ($scope, $localStorage, $http, $uibModal, $log, _, socket) {
        $scope.factories = [];

        socket.on('all-factories', (data) => {
            console.log('factories received: ' + data.length);
            $scope.factories = data;
        });

        socket.on('new-factory', (data) => {
            if (!_.find($scope.factories, {'id': data.id}))
                $scope.factories.push(data);
        });

        socket.on('update-factory', (data) => {
            _.each($scope.factories, function (factory) {
                if (factory.id === data.id) {
                    factory.name = data.name;
                    factory.upper = data.upper;
                    factory.lower = data.lower;
                    if (data.numbers)
                        factory.numbers = data.numbers;
                }
            });
        });

        socket.on('delete-factory', (data) => {
            _.remove($scope.factories, (factory) => {
                return factory.id === data;
            })
        });

        $scope.onGenerateClick = function (id) {
            const modalInstance = $uibModal.open({
                templateUrl: 'generateModal.html',
                controller: 'GenerateController',
                id: 'generateModal',
                resolve: {
                    items: {
                        id: id
                    }
                }
            });

            modalInstance.result.then(() => {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.onEditClick = function (id) {
            _.each($scope.factories, function (factory) {
                if (factory.id === id) {
                    openAddEditModal(factory);
                    return true;
                }
            });
        };

        $scope.onAddFactoryBtnClick = function () {
            openAddEditModal(null);
        };

        const openAddEditModal = (factory) => {
            const modalInstance = $uibModal.open({
                templateUrl: 'addFactoryModal.html',
                controller: 'AddFactoryController',
                id: 'addFactoryModal',
                resolve: {
                    items: {
                        factory: factory
                    }
                }
            });

            modalInstance.result.then(() => {
            }, function () {
                $log.info('Add/Edit modal dismissed at: ' + new Date());
            });
        }
    }]);
