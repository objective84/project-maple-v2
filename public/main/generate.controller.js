projectMaple.controller('GenerateController', ['$scope', '$http', '$uibModalInstance', 'items', 'socket',
    function ($scope, $http, $uibModalInstance, items, socket) {
        const url = "http://localhost:8080/ProjectMaple/factory";
        $scope.count = 1;

        $scope.onGenerateClick = function () {
            // if ($scope.generateForm.itemCount.$error) return;
            socket.emit('generate',{
                factoryId: items.id,
                count: $scope.count
            });
            $uibModalInstance.close();
        };
        $scope.onDeleteClick = function () {
            $http.post(url + /delete/ + items.id, null)
                .then(function () {
                    $uibModalInstance.close();
                })
        }
    }]);