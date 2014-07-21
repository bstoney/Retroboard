retroboardApp.controller('NoteController', ['$scope', 'Board', function ($scope, Board) {
    var onUpdateUi = function () {
        if ($scope.updateUi) {
            $scope.updateUi();
        }
        $scope.style.zIndex = $scope.note.order;
        $scope.$apply();
    }

    $scope.style = {
        zIndex: $scope.note.order
    };

    $scope.$on($scope.note.id, function () {
        onUpdateUi();
    });

    $scope.getClass = function () {
        var classes = ['feedbackNote-Colour' + $scope.note.colour];
        if ($scope.note.votes && $scope.note.votes >= Board.getHighVoteScore()) {
            classes.push('highVote');
        }
        return classes;
    };

    $scope.vote = function () {
        Board.voteOnNote($scope.note);
    };

    $scope.delete = function () {
        Board.deleteNote($scope.note);
    };

    $scope.setLocation = function (location) {
        Board.setNoteLocation($scope.note, location);
    };

    $scope.bringToFront = function () {
        $scope.style.zIndex = Board.getTopLevel();
        $scope.$apply();
    };

    $scope.updateUi = null;
}]);
