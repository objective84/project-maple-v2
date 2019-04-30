projectMaple.controller('GenerateController',
    function ($scope, $http, $uibModalInstance, items) {
        const url = "http://localhost:8080/ProjectMaple/factory";
        $scope.count = 1;

        $scope.onGenerateClick = function () {
            if ($scope.generateForm.itemCount.$error) return;
            $http.post(url + '/generate/' + items.id + "/" + $scope.count, null)
                .then(function () {
                    $uibModalInstance.close();
                });
        };
        $scope.onDeleteClick = function () {
            $http.post(url + /delete/ + items.id, null)
                .then(function () {
                    $uibModalInstance.close();
                })
        }
    });