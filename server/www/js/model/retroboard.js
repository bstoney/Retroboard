;
if (typeof require != 'undefined') {
    var Utilities = require('../common.js').Utilities;
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
        addNote: function (note) {
            this.notes.push(note);
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
            this.boardName = data.boardName;
            this.id = data.id;
            this.notes.length = 0;
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