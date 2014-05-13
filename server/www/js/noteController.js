retroboardApp.controller('NoteController', ['$scope', 'Board', function ($scope, Board) {
    var onUpdateUi = function () {
        if ($scope.updateUi) {
            $scope.updateUi();
        }
    }

    $scope.style = ['feedbackNote-Colour' + $scope.note.colour];

    $scope.getStyle = function () {
        var style = ['feedbackNote-Colour' + $scope.note.colour];
        if ($scope.note.votes && $scope.note.votes >= Board.getHighVoteScore()) {
            style.push('highVote');
        }
        return style;
    };

    $scope.vote = function () {
        $scope.note.votes++;
        $scope.$emit(RetroboardController_events, $scope.note);
        Board.updateNote($scope.note);
    };
    $scope.delete = function () {
        Board.deleteNote($scope.note);
    };
    $scope.setLocation = function (location) {
        $scope.note.location = location;
        onUpdateUi();
        Board.updateNote($scope.note);
    };

    $scope.updateUi = null;
}]);
