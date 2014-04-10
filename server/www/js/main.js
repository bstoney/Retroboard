var feedbackNotes = [];
var connection;
var feedbackNoteColour = Math.floor((Math.random() * 6) + 1);
var boardId = location.search.substr(1);
var sourceId = FeedbackNote.generateUid();
$(function () {
    connection = new WebSocket('ws://' + document.location.host + '/', 'feedback-protocol');
    connection.onopen = function (event) {
        connection.send(JSON.stringify({ action: FeedbackNote.action.ALL, board: boardId }));
    };
    connection.onmessage = function (event) {
        console.log('Received Message: ' + event.data);
        var data = JSON.parse(event.data);
        var note = FeedbackNote.fromData(data.note);
        switch (data.action) {
            case FeedbackNote.action.ADD:
                var newFeedbackNote = $('<div id="' + note.id + '"></div>');
                $("#feedbackSection").prepend(newFeedbackNote);
                newFeedbackNote.feedbackNote();
                if (!note.location) {
                    var newLocation = makeNewPosition(newFeedbackNote);
                    note.location = newLocation;
                    note.colour = feedbackNoteColour;
                    note.send(connection, FeedbackNote.action.UPDATE, sourceId, boardId);
                    newFeedbackNote.feedbackNote("enableDelete");
                }
                newFeedbackNote.feedbackNote("update", note);
                break;
            case FeedbackNote.action.UPDATE:
                var feedbackNote = $("#" + note.id);
                if (!feedbackNote.length) {
                    feedbackNote = $('<div id="' + note.id + '"></div>');
                    $("#feedbackSection").prepend(feedbackNote);
                    feedbackNote.feedbackNote();
                }
                feedbackNote.feedbackNote("update", note);

                break;
            case FeedbackNote.action.DELETE:
                $("#" + note.id).feedbackNote("remove");
                break;
        }
    };
});

$(function () {
    // the widget definition, where "custom" is the namespace,
    // "colorize" the widget name
    $.widget("custom.feedbackNote", {
        // default options
        options: {
            text: "Test text",

            // callbacks
            delete: null,
            vote: null,

            // methods
            remove: null,
            update: null,
            enableDelete: null,
            getNote: null
        },

        // the constructor
        _create: function () {
            var self = this;
            this.element.css("z-index", feedbackNotes.length);
            this.note = new FeedbackNote();
            feedbackNotes.push(this.element.addClass("feedbackNote ui-state-highlight ui-corner-all").draggable({ containment: "window" }).get(0));

            var notifyMove = function (event, ui) {
                self.note.location = self.element.position();
                self.note.send(connection, FeedbackNote.action.UPDATE, sourceId, boardId);
            }

            this.element.on("dragstart", function (event, ui) {
                var currentFeedbackNote = ui.helper.get(0);
                updateLayers(currentFeedbackNote);
            });
            this.element.on("dragstop", notifyMove);

            this.textArea = $('<div class="feedbackNote-Text">').appendTo(this.element);
            this.controls = $('<div class="feedbackNote-Controls">').appendTo(this.element);
            this.votes = $('<div class="feedbackNote-Votes">').appendTo(this.element);
            this.deleter = $('<span class="feedbackNote-Delete">Delete</span>').appendTo(this.controls).button({ icons: { primary: "ui-icon-trash" }, text: false }).hide();
            this.voter = $('<span class="feedbackNote-Vote">Vote</span>').appendTo(this.controls).button();

            // bind click events on the buttons to the random method
            // _on won't call random when widget is disabled
            this._on(this.deleter, { click: "delete" });
            this._on(this.voter, { click: "vote" });
            this.update(new FeedbackNote(this.element.attr("id"), this.options.text));
        },

        // called when created, and later when changing options
        _refresh: function () {
            this.textArea.text(this.options.text);
        },

        // a public method to change the color to a random value
        // can be called directly via .feedbackNote( "delete" )
        delete: function (event) {
            // trigger an event, check if it's canceled
            if (this._trigger("delete", event) !== false) {
                this.note.send(connection, FeedbackNote.action.DELETE, sourceId, boardId);
            }
        },

        vote: function (event) {
            if (this._trigger("vote", event) !== false) {
                this.note.send(connection, FeedbackNote.action.VOTE, sourceId, boardId);
            }
        },

        remove: function () {
            this.element.remove();
        },

        update: function (note) {
            if (this.note.text != note.text) {
                this.textArea.text(note.text);
            }
            if (note.location != null &&
                (this.note.location == null || this.note.location.top != note.location.top || this.note.location.left != note.location.left)) {
                this.element.animate(note.location);
                updateLayers(this.element.get(0));
            }
            if (this.note.votes != note.votes) {
                var pattern = '<span></span>';
                var result = '';
                var votes = note.votes;
                while (votes > 0) {
                    if (votes & 1) {
                        result += pattern
                    }
                    votes >>= 1, pattern += pattern;
                }
                this.votes.html(note.votes);
            }
            if (this.note.colour != note.colour) {
                this.element.css('background-image', "url('css/images/ui-bg_glass_" + note.colour + ".png')");
            }
            this.note = note;
            updateHighVotes();
        },

        enableDelete: function () {
            this.deleter.show();
        },

        getNote: function () {
            return this.note;
        },

        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function () {
            // remove generated elements
            this.controls.remove();
            this.textArea.remove();
            this.votes.remove();
            this.element.removeClass("feedbackNote");
        },

        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function () {
            // _super and _superApply handle keeping the right this-context
            this._superApply(arguments);
            this._refresh();
        }
    });
});

$(function () {
    $("#addButton").button().disableSelection().click(add);
    $("#exportButton").button().disableSelection().click(exportNotes);
    $('#newFeedbackText').bind('keypress', function (e) {
        if (e.which == 13) {
            add();
        }
    });
    if (boardId) {
        $("#title").text(decodeURIComponent(boardId));
    }
    else {
        $("#title").hide();
    }
});

var updateLayers = function (currentFeedbackNote) {
    feedbackNotes.splice(feedbackNotes.indexOf(currentFeedbackNote), 1);
    $.each(feedbackNotes, function (index, feedbackNote) {
        $(feedbackNote).css("z-index", index);
    });
    feedbackNotes.push(currentFeedbackNote);
    $(currentFeedbackNote).css("z-index", feedbackNotes.length);
};

var updateHighVotes = function () {
    var notesByVote = [];
    $.each(feedbackNotes, function (index, value) {
        var note = $(value).feedbackNote("getNote");
        if (!notesByVote[note.votes]) {
            notesByVote[note.votes] = [];
        }
        notesByVote[note.votes].push(note);
    });

    var count = 0;
    $.each(notesByVote.reverse(), function (index, value) {
        if (value) {
            $.each(value, function (index, value) {
                if (value.votes) {
                    $("#" + value.id).find(".feedbackNote-Votes").show();
                    if (count < 3) {
                        $("#" + value.id).addClass("highVote");
                    }
                    else {
                        $("#" + value.id).removeClass("highVote");
                    }
                }
                else {
                    $("#" + value.id).find(".feedbackNote-Votes").hide();
                }
            })
            count++;
        }
    });
};

function makeNewPosition(newFeedbackNote) {
    // Get viewport dimensions (remove the dimension of the div)
    var h = $("#feedbackSection").height() - newFeedbackNote.height();
    var w = $("#feedbackSection").width() - newFeedbackNote.width();

    var nh = Math.floor(Math.random() * h);
    var nw = Math.floor(Math.random() * w);

    return {top: nh, left: nw};
}

function add() {
    var newFeedbackNote = new FeedbackNote(null, $('#newFeedbackText').val());
    newFeedbackNote.send(connection, FeedbackNote.action.ADD, sourceId, boardId);

    $('#newFeedbackText').val('')
}

function exportNotes() {
    var content = "Category,Feedback,Votes\n";
    var categories = $(".feedbackGrouping");
    var bounds = [$(categories[0]).offset().left + $(categories[0]).outerWidth(), $(categories[1]).offset().left + $(categories[1]).outerWidth()];
    $.each(feedbackNotes, function (index, value) {
        var note = $(value).feedbackNote("getNote");
        content += [
            note.location.left < bounds[0] ? 'What Went Well?' : (note.location.left < bounds[1] ? "What Didn't?" : "Puzzles?"),
            note.text,
            note.votes
        ].join(',') + "\n";
    });
    download(boardId + '.csv', content);
//    var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
//    location.href = uriContent;
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}
