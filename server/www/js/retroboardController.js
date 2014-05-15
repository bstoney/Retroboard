var RetroboardController_events = {
    ON_NOTE_VOTE: "retroboard-note-vote",
    ON_NOTE_UPDATE: "retroboard-note-update"
}

retroboardApp.controller('RetroboardController', ['$scope', 'User', 'Board', function ($scope, User, Board) {

    $scope.boardName = Board.getBoardName();
    $scope.noteText = '';
    $scope.actionItemName = '';
    $scope.actionItemText = '';
    $scope.notes = Board.getNotes();
    $scope.actionItems = Board.getActionItems();
    $scope.topLevel = Board.getTopLevel();
    $scope.showActionItems = false;

    $scope.categories = [
        {
            title: 'What Went Well?',
            image: 'url(\'images/smiley.png\')'
        },
        {
            title: 'What Didn\'t?',
            image: 'url(\'images/sad.png\')'
        },
        {
            title: 'Puzzles?',
            image: 'url(\'images/confused.png\')'
        }
    ];

    $scope.$on(RetroboardController_events.ON_NOTE_UPDATE, function () {
        $scope.topLevel = Board.getTopLevel();
        $scope.$apply();
    });

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

    $scope.exportActionItems = function () {
        Board.exportActionItems();
    };
}])
;