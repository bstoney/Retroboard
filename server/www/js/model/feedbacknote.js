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
        updateFromData: function (data) {
            this.location = data.location;
            this.votes = data.votes || 0;
        }
    };

    FeedbackNote.createFromData = function (data) {
        var note = new FeedbackNote(data.id, data.text);
        note.location = data.location;
        note.votes = data.votes || 0;
        note.colour = data.colour;
        return note;
    };

    FeedbackNote.action = {
        ALL: 'all',
        ADD: 'note-add',
        VOTE: 'note-vote',
        DELETE: 'note-delete',
        UPDATE: 'note-update'
    };

    exports.FeedbackNote = FeedbackNote;

})(this.exports || this);