'use strict';

projectMaple.controller('GenerateController', ['$scope', '$http', '$uibModalInstance', 'items', 'socket',
    function ($scope, $http, $uibModalInstance, items, socket) {
        const url = "http://localhost:8080/ProjectMaple/factory";
        $scope.count = 1;

        $scope.onGenerateClick = () => {
            if ($scope.generateForm.itemCount.$invalid) return;
            socket.emit('generate', {
                factoryId: items.factoryId,
                count: $scope.count
            });
            $uibModalInstance.close();
        };
        $scope.onDeleteClick = () => {
            socket.emit('delete-factory', {
                factoryId: items.factoryId
            });
            $uibModalInstance.close();
        }
    }]);