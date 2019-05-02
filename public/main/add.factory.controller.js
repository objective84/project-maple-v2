projectMaple.controller('AddFactoryController', ['$scope', '$http', '$uibModalInstance', 'items', 'socket',
    function ($scope, $http, $uibModalInstance, items, socket) {
        $scope.factory = items.factory || {
            id: null,
            name: "",
            upper: 300,
            lower: 1,
            numbers: []
        };

        $scope.onSaveBtnClick = function() {
            socket.emit("add-factory", $scope.factory);
            $uibModalInstance.close();
        }
    }]);