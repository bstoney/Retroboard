retroboardApp.controller('ActionItemController', ['$scope', 'Board', function ($scope, Board) {
    $scope.delete = function () {
        Board.deleteActionItem($scope.actionItem);
    };
}]);
