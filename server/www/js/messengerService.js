retroboardApp.factory('Messenger', ['User', '$q', function (User, $q) {
    var connection = new WebSocket('ws://' + document.location.host + '/', 'feedback-protocol');
    connection.onopen = function (event) {
//        connection.send(JSON.stringify({ action: FeedbackNote.action.ALL, board: boardId, source: sourceId }));
    };
    connection.onmessage = function (event) {
        console.log('Received Message: ' + event.data);
        var payload = JSON.parse(event.data);
        var handler = callbackHandlers.getHandler(payload.id);
        if (typeof handler === "function") {
            handler(payload.data);
        }

//        var note = FeedbackNote.fromData(data.note);
//        switch (data.action) {
//            case FeedbackNote.action.ADD:
//                var newFeedbackNote = $('<div id="' + note.id + '"></div>');
//                $("#feedbackSection").prepend(newFeedbackNote);
//                newFeedbackNote.feedbackNote();
//                if (!note.location) {
//                    var newLocation = makeNewPosition(newFeedbackNote);
//                    note.location = newLocation;
//                    note.colour = feedbackNoteColour;
//                    note.send(connection, FeedbackNote.action.UPDATE, sourceId, boardId);
//                }
//                if(data.source == sourceId)
//                {
//                    newFeedbackNote.feedbackNote("enableDelete");
//                }
//                newFeedbackNote.feedbackNote("update", note);
//                break;
//            case FeedbackNote.action.UPDATE:
//                var feedbackNote = $("#" + note.id);
//                if (!feedbackNote.length) {
//                    feedbackNote = $('<div id="' + note.id + '"></div>');
//                    $("#feedbackSection").prepend(feedbackNote);
//                    feedbackNote.feedbackNote();
//                }
//                feedbackNote.feedbackNote("update", note);
//
//                break;
//            case FeedbackNote.action.DELETE:
//                $("#" + note.id).feedbackNote("remove");
//                break;
//        }
    };
    connection.onerror = function (event) {
    };

    var callbackHandlers = {
        addHandler: function (id, callback) {
            this[id] = callback;
        },
        getHandler: function (id) {
            return this[id];
        },
        removeHandler: function (id) {
            delete this[id];
        }
    };

    function MessengerService() {
        this.send = function (action, boardId, data) {
            if (connection.readyState !== WebSocket.OPEN) {
                return  $q.reject("Connection is not currently available.");
            }

            var payload = {
                id: Utilities.generateUid(),
                action: action,
                user: User.getUniqueUserId(),
                board: boardId,
                data: data
            };
            var json = JSON.stringify(payload);
            console.log('Sent Message: ' + json);

            var deferred = $q.defer();

            callbackHandlers.addHandler(payload.id, function () {
                deferred.resolve();
                callbackHandlers.removeHandler(payload.id);
            });

            try {
                connection.send(json);
            } catch (e) {
                callbackHandlers.removeHandler(payload.id);
                return $q.reject(e);
            }

            return deferred.promise;
        };

        this.register = function (action, callback) {
        };
    }

    return new MessengerService();
}]);
