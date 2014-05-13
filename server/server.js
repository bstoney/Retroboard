var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");
var ws = require('websocket').server;
var HashMap = require('hashmap').HashMap;
var Utilities = require('./www/js/common.js').Utilities;
var Retroboard = require('./www/js/model/retroboard.js').Retroboard;
var FeedbackNote = require('./www/js/model/feedbacknote.js').FeedbackNote;
var ActionItem = require('./www/js/model/actionitem.js').ActionItem;

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

var SERVER_PORT = 8080;

var server = http.createServer(function (request, response) {

    var uri = url.parse(request.url).pathname;

    uri = "www/" + uri;

    if (uri.charAt(uri.length - 1) == "/") {
        uri += "index.html";
    }

    if (uri.indexOf("..") != -1) {
        response.writeHead(403);
        response.end();
    }

    var filename = path.join(process.cwd(), uri);

    console.log("\tAttempting to serve: " + filename);

    path.exists(filename, function (exists) {

        if (!exists) {
            console.log("File not found: " + filename);
            response.writeHead(404);
            response.end("Sorry, the file you requested was not found. Don't let it ruin your day! :)");
            return;
        }

        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        response.writeHead(200, {'Content-Type': mimeType});

        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(response);
    });


}).listen(SERVER_PORT);

var wsServer = new ws({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

var retroBoards = new HashMap();
var clientMap = new HashMap();

var broadcastAction = function (action, boardId, data, clients) {
    var payload = {
        id: Utilities.generateUid(),
        action: action,
        user: null,
        board: boardId,
        data: data
    };
    // broadcast message to all connected clients
    var json = JSON.stringify(payload);
    console.log('Broadcast Message: ' + json);
    for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(json);
    }
};

var handleClientMessage = function (retroboard, action, data, clients) {
    switch (action) {
        case Retroboard.action.GET:
            return retroboard;
        case FeedbackNote.action.ADD:
// TODO            boardData.feedbackNotes.set(id, { source: data.source, note: newFeedbackNote });
            var newNote = new FeedbackNote(Utilities.generateUid(), data.text)
            newNote.updateFromData(data);
            retroboard.addNote(newNote);
            broadcastAction(FeedbackNote.action.ADD, retroboard.id, newNote, clients);
            return;
        case FeedbackNote.action.DELETE:
            // TODO verify permission
            retroboard.removeNote(data.id);
            broadcastAction(FeedbackNote.action.DELETE, retroboard.id, data.id, clients);
            return;
        case FeedbackNote.action.UPDATE:
            var note = retroboard.getNote(data.id);
            if (note) {
                note.updateFromData(data);
                broadcastAction(FeedbackNote.action.UPDATE, retroboard.id, note, clients);
            }
            return;
        case ActionItem.action.ADD:
            var id = Utilities.generateUid();
            var newActionItem = ActionItem.fromData(data);
            newActionItem.id = id;
            retroboard.addActionItem(newActionItem);
            broadcastAction(ActionItem.action.ADD, retroboard.id, newActionItem, clients);
            return;
        case ActionItem.action.DELETE:
            retroboard.removeActionItem(data.id);
            broadcastAction(ActionItem.action.DELETE, retroboard.id, data.id, clients);
            return;
        default:
//            if (boardData.feedbackNotes.has(data.note.id)) {
//                var item = boardData.feedbackNotes.get(data.note.id)
//                var isRequestFromSource = item.source == data.source;
//                var feedbackNote = item.note;
//                switch (data.action) {
//                    case FeedbackNote.action.UPDATE:
//                        feedbackNote.location = data.note.location;
//                        if (isRequestFromSource) {
//                            feedbackNote.colour = data.note.colour;
//                        }
//                        broadcastAction(FeedbackNote.action.UPDATE, feedbackNote, null, clients);
//                        break;
//                    case FeedbackNote.action.DELETE:
//                        if (isRequestFromSource) {
//                            boardData.feedbackNotes.remove(feedbackNote.id);
//                            broadcastAction(FeedbackNote.action.DELETE, feedbackNote, null, clients);
//                        }
//                        break;
//                    case FeedbackNote.action.VOTE:
//                        feedbackNote.votes++;
//                        broadcastAction(FeedbackNote.action.UPDATE, feedbackNote, null, clients);
//                        break;
//                }
//            }
            break;
    }

    throw "Not implemented";
};

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var index;
    var clients;
    var connection = request.accept('feedback-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            var payload = JSON.parse(message.utf8Data)
            if (!clients) {
                if (!clientMap.has(payload.board)) {
                    clientMap.set(payload.board, []);
                }
                clients = clientMap.get(payload.board);
                index = clients.push(connection) - 1;
            }
            if (!retroBoards.has(payload.board)) {
                retroBoards.set(payload.board, new Retroboard(payload.board));
            }

            var retroboard = retroBoards.get(payload.board);

            var response = { action: payload.id };
            try {
                response.data = handleClientMessage(retroboard, payload.action, payload.data, clients);
            }
            catch (e) {
                console.log(e);
                response.error = e.toString();
            }

            connection.send(JSON.stringify(response));
        }
        else {
            console.log('Received unexpected data type ' + message.type);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        // remove user from the list of connected clients
//  TODO      clients.splice(index, 1);
    });
});