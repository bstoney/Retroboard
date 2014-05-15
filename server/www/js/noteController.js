retroboardApp.controller('NoteController', ['$scope', 'Board', function ($scope, Board) {
    var onUpdateUi = function () {
        if ($scope.updateUi) {
            $scope.updateUi();
        }
        $scope.$apply();
    }

    $scope.$on($scope.note.id, function(){
        onUpdateUi();
    });

    $scope.getStyle = function () {
        return {
            zIndex: $scope.note.order
        };
    };

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
        $scope.note.order = 10000;
        $scope.$apply();
    };

    $scope.updateUi = null;
}]);
