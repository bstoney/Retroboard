retroboardApp.controller('NoteController', ['$scope', 'Board', function ($scope, Board) {
    var onUpdateUi = function () {
        if ($scope.updateUi) {
            $scope.updateUi();
        }
    }

    $scope.$on($scope.note.id, function(){
        onUpdateUi();
    });

    $scope.style = ['feedbackNote-Colour' + $scope.note.colour];

    $scope.getStyle = function () {
        var style = ['feedbackNote-Colour' + $scope.note.colour];
        if ($scope.note.votes && $scope.note.votes >= Board.getHighVoteScore()) {
            style.push('highVote');
        }
        return style;
    };

    $scope.vote = function () {
        Board.voteOnNote($scope.note);
    };
    $scope.delete = function () {
        Board.deleteNote($scope.note);
    };
    $scope.setLocation = function (location) {
        Board.setNoteLocation($scope.note, location);
        onUpdateUi();
    };

    $scope.updateUi = null;
}]);
