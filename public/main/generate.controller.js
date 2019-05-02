projectMaple.controller('GenerateController', ['$scope', '$http', '$uibModalInstance', 'items', 'socket',
    function ($scope, $http, $uibModalInstance, items, socket) {
        const url = "http://localhost:8080/ProjectMaple/factory";
        $scope.count = 1;

        $scope.onGenerateClick = function () {
            if ($scope.generateForm.itemCount.$invalid) return;
            socket.emit('generate', {
                id: items.id,
                count: $scope.count
            });
            $uibModalInstance.close();
        };
        $scope.onDeleteClick = function () {
            socket.emit('delete-factory', {
                id: items.id
            });
            $uibModalInstance.close();
        }
    }]);