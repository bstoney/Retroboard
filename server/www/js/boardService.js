retroboardApp.factory('Board', ['User', 'Messenger', '$q', function (User, Messenger, $q) {
    var retroboard = new Retroboard(decodeURIComponent(location.search.substr(1)));

    function send(action, data) {
        return Messenger.send(action, retroboard.boardId, data)
            .catch(function (reason) {
                alert(reason);
                return $q.reject(reason);
            });
    }

    Messenger.register(MessengerServiceEvents.OPEN, function () {
        send(Retroboard.action.GET).then(function (data) {
            retroboard.fromData(data);
        });
    });
    Messenger.register(MessengerServiceEvents.ERROR, function (error) {
        alert(error);
    });
    Messenger.register(FeedbackNote.action.ADD, function (note) {
        retroboard.addNote(note);
    });
    Messenger.register(FeedbackNote.action.DELETE, function (id) {
        retroboard.removeNote(id);
    });
    Messenger.register(FeedbackNote.action.UPDATE, function (data) {
        var note = retroboard.getNote(data.id);
        if (note) {
            note.updateFromData(data);
        }
    });
    Messenger.register(ActionItem.action.ADD, function (actionItem) {
        retroboard.addActionItem(actionItem);
    });
    Messenger.register(ActionItem.action.DELETE, function (id) {
        retroboard.removeActionItem(id);
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

        this.createNote = function (noteText) {
            var note = new FeedbackNote("", noteText);
            note.colour = User.getFeedbackNoteColour();
            send(FeedbackNote.action.ADD, note);
        };

        this.deleteNote = function (note) {
            send(FeedbackNote.action.DELETE, note);
        };

        this.updateNote = function (note) {
            send(FeedbackNote.action.UPDATE, note);
        }

        this.createActionItem = function (actionItemName, actionItemText) {
            var actionItem = new ActionItem("", actionItemName, actionItemText);
            send(ActionItem.action.ADD, actionItem);
        };

        this.deleteActionItem = function (actionItem) {
            send(ActionItem.action.DELETE, actionItem);
        };

        this.getHighVoteScore = function () {
            var notesByVote = [];
            $.each(notes, function () {
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
            var content = "Category,Feedback,Votes\n";
            var bounds = [categories[0].bounds.left + categories[0].bounds.width, categories[1].bounds.left + categories[1].bounds.width];
            for (var i = 0; i < notes.length; i++) {
                var note = notes[i];
                content += [
                    note.location.left < bounds[0] ? categories[0].title : (note.location.left < bounds[1] ? categories[1].title : categories[2].title),
                    note.text,
                    note.votes
                ].join(',') + "\n";
            }
            download((boardName ? boardName : 'Retroboard') + '.csv', content);
        };
    }

    return new BoardService();
}]);
