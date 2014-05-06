retroboardApp.factory('Board', ['User', 'Messenger', function (User, Messenger) {
    var boardName = decodeURIComponent(location.search.substr(1));
    var boardId = boardName ? boardName : '46db9e6d-560e-a97a-2538-d179f8391700';

    var notes = [];
    var actionItems = [];

    function BoardService() {
        this.getBoardName = function () {
            return boardName;
        };

        this.getNotes = function () {
            return notes;
        };

        this.getActionItems = function () {
            return actionItems;
        };

        this.createNote = function (noteText) {
            var note = new FeedbackNote(Utilities.generateUid(), noteText);
            note.colour = User.getFeedbackNoteColour();
            note.sendAction = function (action) {
                Messenger.send(action, boardId, note);
            }

            notes.push(note);
            return note;
        };

        this.createActionItem = function (actionItemName, actionItemText) {
            var actionItem = new ActionItem(Utilities.generateUid(), actionItemName, actionItemText);
            actionItem.sendAction = function (action) {
                Messenger.send(action, boardId, actionItem);
            }

            actionItems.push(actionItem);
            actionItem.sendAction(ActionItem.action.ADD);
            return actionItem;
        };

        this.deleteNote = function (note) {
            var index = notes.indexOf(note);
            if (index != -1) {
                notes.splice(index, 1);
                note.sendAction(FeedbackNote.action.DELETE);
            }
        };

        this.deleteActionItem = function (actionItem) {
            var index = actionItems.indexOf(actionItem);
            if (index != -1) {
                actionItems.splice(index, 1);
                actionItem.sendAction(ActionItem.action.DELETE);
            }
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
