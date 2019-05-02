projectMaple.controller('AddFactoryController', ['$scope', '$http', '$uibModalInstance', 'items', 'socket',
    function ($scope, $http, $uibModalInstance, items, socket) {
        $scope.factory = items.factory || {
            factoryId: null,
            name: "",
            upper: 300,
            lower: 1,
            numbers: []
        };

        $scope.onSaveBtnClick = function () {
            if ($scope.factory.lower >= $scope.factory.upper) {
                $scope.addEditForm.upper.$error.minMax = true;
                return;
            } else
                $scope.addEditForm.lower.$error.minMax = false;
            if($scope.addEditForm.$invalid) {
                $scope.addEditForm.submitAttemped = true;
                return;
            }
            socket.emit("add-factory", $scope.factory);
            $uibModalInstance.close();
        }
    }]);