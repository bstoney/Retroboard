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
        ADD: 'note-add',
        VOTE: 'note-vote',
        DELETE: 'note-delete',
        UPDATE: 'note-update'
    };

    FeedbackNote.fromData = function (data) {
        var feedbackNote = new FeedbackNote(data.id, data.text);
        feedbackNote.location = data.location;
        feedbackNote.votes = data.votes;
        feedbackNote.colour = data.colour;
        return feedbackNote;
    };

    exports.FeedbackNote = FeedbackNote;

})(this.exports || this);