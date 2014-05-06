retroboardApp.factory('Messenger', ['User', function (User) {
    function MessengerService() {
        this.send = function (action, boardId, data) {
            var payload = {
                action: action,
                user: User.getUniqueUserId(),
                board: boardId,
                data: data
            };
            console.log("send-action " + JSON.stringify(payload));
// TODO            feedbackNote.send(connection, FeedbackNote.action.UPDATE, sourceId, boardId);
        };

        this.register = function (action, callback) {
        };
    }

    return new MessengerService();
}]);
