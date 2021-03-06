var RetroboardController_events = {
    ON_NOTE_VOTE: "retroboard-note-vote",
    ON_NOTE_UPDATE: "retroboard-note-update",
    ON_ACTION_ITEM_UPDATE: "retroboard-action-update",
    ON_RETROBOARD_CREATE: "retroboard-create",
    ON_RETROBOARD_UPDATE: "retroboard-update",
    ON_TOGGLE_OVERLAY: "retroboard-show-overlay"
};

retroboardApp.controller('RetroboardController', ['$scope', 'User', 'Board', function ($scope, User, Board) {

    var retroboard = Board.getRetroboard();

    $scope.boardName = retroboard.boardName;
    $scope.noteText = '';
    $scope.actionItemName = '';
    $scope.actionItemText = '';
    $scope.notes = retroboard.notes;
    $scope.actionItems = retroboard.actionItems;
    $scope.topLevel = Board.getTopLevel();
    $scope.showActionItems = false;
    $scope.showRetroboardOptions = false;
    $scope.showOverlay = false;
    $scope.owner = retroboard.owner;
    $scope.categories = retroboard.categories;
    $scope.jiraUrl = retroboard.jiraUrl;
    $scope.totalVotes = retroboard.getTotalVotes();

    $scope.$on(RetroboardController_events.ON_NOTE_UPDATE, function () {
        $scope.totalVotes = retroboard.getTotalVotes();
    });

    $scope.$on(RetroboardController_events.ON_RETROBOARD_CREATE, function () {
        $scope.toggleRetroboardOptions();
    });

    $scope.$on(RetroboardController_events.ON_RETROBOARD_UPDATE, function () {
        $scope.owner = retroboard.owner;
        $scope.jiraUrl = retroboard.jiraUrl;
        $scope.totalVotes = retroboard.getTotalVotes();
    });

    $scope.$on(RetroboardController_events.ON_TOGGLE_OVERLAY, function () {
        $scope.showOverlay = !$scope.showOverlay;
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
        $scope.showOverlay = $scope.showActionItems = !$scope.showActionItems;
    };

    $scope.saveRetroboardOptions = function () {
        Board.createRetroboard($scope.jiraUrl);
        $scope.toggleRetroboardOptions();
    };

    $scope.toggleRetroboardOptions = function () {
        $scope.showOverlay = $scope.showRetroboardOptions = !$scope.showRetroboardOptions;
    };

    $scope.exportNotes = function () {
        Board.exportNotes($scope.categories);
    };

    $scope.exportActionItems = function () {
        Board.exportActionItems();
    };
}]);