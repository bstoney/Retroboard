;
if (typeof require != 'undefined') {
    var Utilities = require('../common.js').Utilities;
    var FeedbackNote = require('./feedbacknote.js').FeedbackNote;
}

(function (exports) {

    function Retroboard(boardName) {
        this.boardName = boardName;
        this.id = boardName ? boardName : '46db9e6d-560e-a97a-2538-d179f8391700';
        this.owner = null;
        this.notes = [];
        this.actionItems = [];
        this.categories = [
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
    }

    Retroboard.prototype = {
        constructor: Retroboard,
        id: '',
        owner: null,
        boardName: '',
        notes: [],
        actionItems: [],
        topLevel: 1,
        categories: [],
        jiraUrl: null,
        addNote: function (note) {
            if (typeof note != 'FeedbackNote') {
                var owner = note.owner;
                note = FeedbackNote.createFromData(note);
                note.owner = owner;
            }
            this.notes.push(note);
            return note;
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
        getTotalVotes: function () {
            return this.notes.reduce(function(count, note, index, array){
                return count + note.votes;
            }, 0);
        },
        fromData: function (data) {
            if (!data) {
                return;
            }

            var self = this;
            this.boardName = data.boardName || this.boardName;
            this.id = data.id;
            this.owner = data.owner;
            this.topLevel = data.topLevel;

            this.notes.length = 0;
            data.notes.forEach(function (n) {
                self.addNote(n);
            });
            this.actionItems.length = 0;
            data.actionItems.forEach(function (a) {
                self.addActionItem(a);
            });
            this.categories.length = 0;
            data.categories.forEach(function (c) {
                self.categories.push(c);
            });

            this.jiraUrl = data.jiraUrl;
        }
    };

    Retroboard.action = {
        GET: 'get-retroboard',
        CREATE: 'create-retroboard'
    };

    exports.Retroboard = Retroboard;

})(this.exports || this);