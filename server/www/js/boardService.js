retroboardApp.factory('Board', ['$rootScope', 'User', 'Messenger', '$q', function ($rootScope, User, Messenger, $q) {
    var retroboard = new Retroboard(decodeURIComponent(location.search.substr(1)));

    function send(action, data) {
        return Messenger.send(action, retroboard.id, data)
            .catch(function (reason) {
                alert(reason);
                return $q.reject(reason);
            });
    }

    Messenger.register(MessengerServiceEvents.OPEN, function () {
        send(Retroboard.action.GET).then(function (data) {
            retroboard.fromData(data);
            $rootScope.$broadcast(RetroboardController_events.ON_NOTE_UPDATE);
        });
    });
    Messenger.register(MessengerServiceEvents.ERROR, function (error) {
        alert(error);
    });
    Messenger.register(FeedbackNote.action.ADD, function (data) {
        retroboard.addNote(FeedbackNote.createFromData(data));
        $rootScope.$broadcast(RetroboardController_events.ON_NOTE_UPDATE);
    });
    Messenger.register(FeedbackNote.action.DELETE, function (id) {
        retroboard.removeNote(id);
        $rootScope.$broadcast(RetroboardController_events.ON_NOTE_UPDATE);
    });
    Messenger.register(FeedbackNote.action.UPDATE, function (data) {
        var note = retroboard.getNote(data.id);
        if (note) {
            note.updateFromData(data);
            retroboard.topLevel = note.order;
        }
        else {
            retroboard.addNote(FeedbackNote.createFromData(data));
        }

        $rootScope.$broadcast(RetroboardController_events.ON_NOTE_UPDATE);
        $rootScope.$broadcast(note.id);
    });
    Messenger.register(ActionItem.action.ADD, function (actionItem) {
        retroboard.addActionItem(actionItem);
        $rootScope.$broadcast(RetroboardController_events.ON_NOTE_UPDATE);
    });
    Messenger.register(ActionItem.action.DELETE, function (id) {
        retroboard.removeActionItem(id);
        $rootScope.$broadcast(RetroboardController_events.ON_NOTE_UPDATE);
    });

    function BoardService() {
        this.getBoardName = function () {
            return retroboard.boardName;
        };

        this.getNotes = function () {
            return retroboard.notes;
        };

        this.getActionItems = function () {
            return retroboard.actionItems;
        };

        this.getTopLevel = function () {
            return retroboard.topLevel;
        };

        this.createNote = function (noteText) {
            var note = new FeedbackNote("", noteText);
            note.colour = User.getFeedbackNoteColour();
            send(FeedbackNote.action.ADD, note);
        };

        this.deleteNote = function (note) {
            send(FeedbackNote.action.DELETE, note);
        };

        this.voteOnNote = function (note) {
            send(FeedbackNote.action.VOTE, note);
        };

        this.setNoteLocation = function (note, location) {
            note.location = location;
            send(FeedbackNote.action.UPDATE, note);
        };

        this.createActionItem = function (actionItemName, actionItemText) {
            var actionItem = new ActionItem("", actionItemName, actionItemText);
            send(ActionItem.action.ADD, actionItem);
        };

        this.deleteActionItem = function (actionItem) {
            send(ActionItem.action.DELETE, actionItem);
        };

        this.getHighVoteScore = function () {
            var notesByVote = [];
            $.each(retroboard.notes, function () {
                var votes = this.votes;
                if (!notesByVote[votes]) {
                    notesByVote[votes] = [];
                }

                notesByVote[votes].push(this);
            });

            var note = notesByVote.reverse().filter(function (n) {
                return n
            }).slice(0, 3).pop();
            return note ? note[0].votes : null;
        };

        this.exportNotes = function (categories) {
            var content = this.createCsvRow(['Category','Feedback','Votes']);
            var bounds = [categories[0].bounds.left + categories[0].bounds.width, categories[1].bounds.left + categories[1].bounds.width];
            for (var i = 0; i < retroboard.notes.length; i++) {
                var note = retroboard.notes[i];
                content += this.createCsvRow([
                    note.location.left < bounds[0] ? categories[0].title : (note.location.left < bounds[1] ? categories[1].title : categories[2].title),
                    note.text,
                    note.votes
                ]);
            }
            download((retroboard.boardName ? retroboard.boardName : 'Retroboard') + '-Notes.csv', content);
        };

        this.exportActionItems = function () {
            var content = this.createCsvRow(['Who','Description']);
            for (var i = 0; i < retroboard.actionItems.length; i++) {
                var actionItem = retroboard.actionItems[i];
                content += this.createCsvRow([actionItem.name, actionItem.text]);
            }
            download((retroboard.boardName ? retroboard.boardName : 'Retroboard') + '-ActionItems.csv', content);
        };

        this.createCsvRow = function(items){
            return '"' + items.join('","') + '"\n'
        }
    }

    return new BoardService();
}]);
