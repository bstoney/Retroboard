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
        order: 0,
        updateFromData: function (data) {
            this.location = data.location;
            this.order = getOrderFromTime();
            this.votes = data.votes || 0;
            this.colour = data.colour || 1;
        },
        setLocation: function (location) {
            this.location = location;
            this.order = getOrderFromTime();
        }
    };

    function getOrderFromTime() {
        var dt = new Date();
        return dt.getSeconds() + (60 * (dt.getMinutes() + (60 * dt.getHours())));
    }

    FeedbackNote.createFromData = function (data) {
        var note = new FeedbackNote(data.id, data.text);
        note.location = data.location;
        note.order = getOrderFromTime();
        note.votes = data.votes || 0;
        note.colour = data.colour || 1;
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