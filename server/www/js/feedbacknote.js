;
(function (exports) {

    function FeedbackNote(id, text) {
        this.id = id;
        this.text = text;
    };

    FeedbackNote.prototype = {
        constructor: FeedbackNote,
        id: '',
        text: '',
        location: null,
        votes: 0,
        colour: 1,
        send: function (connection, action, sourceId, boardId) {
            var json = JSON.stringify({action: action, board: boardId, source: sourceId, note: this});
            console.log('Sent Message: ' + json);
            connection.send(json);
        }
    };

    FeedbackNote.action = {
        ALL: 'all',
        ADD: 'add',
        VOTE: 'vote',
        DELETE: 'delete',
        UPDATE: 'update'
    };

    FeedbackNote.fromData = function (data) {
        var feedbackNote = new FeedbackNote(data.id, data.text);
        feedbackNote.location = data.location;
        feedbackNote.votes = data.votes;
        feedbackNote.colour = data.colour;
        return feedbackNote;
    };

    FeedbackNote.generateUid = function (separator) {
        var delim = separator || "-";

        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
    };

    exports.FeedbackNote = FeedbackNote;

})(this.exports || this);