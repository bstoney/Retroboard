var RetroboardController_events = {
    ON_NOTE_VOTE: "note-vote"
}

retroboardApp.controller('RetroboardController', ['$scope', 'User', 'Board', function ($scope, User, Board) {

    $scope.boardName = Board.getBoardName();
    $scope.noteText = '';
    $scope.actionItemName = '';
    $scope.actionItemText = '';
    $scope.notes = Board.getNotes();
    $scope.actionItems = Board.getActionItems();
    $scope.showActionItems = false;

    $scope.categories = [
        { title: 'What Went Well?'},
        { title: 'What Didn\'t?'},
        { title: 'Puzzles?'}
    ];

    $scope.addNote = function () {
        if ($scope.noteText) {
            Board.createNote($scope.noteText);
            $scope.noteText = '';
        }
    };

    $scope.addActionItem = function () {
        if ($scope.actionItemText) {
            Board.createActionItem($scope.actionItemName, $scope.actionItemText);
            $scope.actionItemName = $scope.actionItemText = '';
        }
    };

    $scope.toggleActionItems = function () {
        $scope.showActionItems = !$scope.showActionItems;
    };

    $scope.exportNotes = function () {
        Board.exportNotes($scope.categories);
    };
}]);