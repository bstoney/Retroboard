;
if (typeof require != 'undefined') {
    var Utilities = require('../common.js').Utilities;
    var FeedbackNote = require('./feedbacknote.js').FeedbackNote;
}

(function (exports) {

    function Retroboard(boardName) {
        this.boardName = boardName;
        this.id = boardName ? boardName : '46db9e6d-560e-a97a-2538-d179f8391700';
        this.notes = [];
        this.actionItems = [];
    }

    Retroboard.prototype = {
        constructor: Retroboard,
        id: '',
        boardName: '',
        notes: [],
        actionItems: [],
        topLevel: 1,
        addNote: function (note) {
            if (typeof note != 'FeedbackNote') {
                note = FeedbackNote.createFromData(note);
            }
            this.notes.push(note);
        },
        removeNote: function (id) {
            var index = Utilities.indexOf(this.notes, function (a) {
                return a.id == id;
            });
            if (index >= 0) {
                this.notes.splice(index, 1);
            }
        },
        getNote: function (id) {
            return this.notes.filter(function (a) {
                return a.id == id;
            })[0];
        },
        bringNoteToTop: function (note) {
            note.order = this.topLevel;
            this.topLevel++;
        },
        addActionItem: function (actionItem) {
            this.actionItems.push(actionItem);
        },
        removeActionItem: function (id) {
            var index = Utilities.indexOf(this.actionItems, function (a) {
                return a.id == id;
            });
            if (index >= 0) {
                this.actionItems.splice(index, 1);
            }
        },
        fromData: function (data) {
            if (!data) {
                return;
            }

            var self = this;
            this.boardName = data.boardName || this.boardName;
            this.id = data.id;
            this.notes.length = 0;
            this.topLevel = data.topLevel;
            data.notes.forEach(function (n) {
                self.addNote(n);
            });
            this.actionItems.length = 0;
            data.actionItems.forEach(function (a) {
                self.addActionItem(a);
            });
        }
    };

    Retroboard.action = {
        GET: 'get-retroboard'
    };

    exports.Retroboard = Retroboard;

})(this.exports || this);