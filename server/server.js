var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");
var ws = require('websocket').server;
var HashMap = require('hashmap').HashMap;
var FeedbackNote = require('./www/js/feedbacknote.js').FeedbackNote;
var ActionItem = require('./www/js/actionitem.js').ActionItem;

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

var wsserver = new ws({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

var retroBoards = new HashMap();
var clientMap = new HashMap();

var broadcastAction = function (action, feedbackNote, clients) {
    // broadcast message to all connected clients
    var json = JSON.stringify({action: action, note: feedbackNote});
    console.log('Broadcast Message: ' + json);
    for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(json);
    }
};

wsserver.on('request', function (request) {
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
            var data = JSON.parse(message.utf8Data)
            if (!clients) {
                if (!clientMap.has(data.board)) {
                    clientMap.set(data.board, []);
                }
                clients = clientMap.get(data.board);
                index = clients.push(connection) - 1;
            }
            if (!retroBoards.has(data.board)) {
                retroBoards.set(data.board, new HashMap());
            }
            var feedbackNotes = retroBoards.get(data.board);
            switch (data.action) {
                case FeedbackNote.action.ALL:
                    feedbackNotes.forEach(function (value, key) {
                        value.note.send(connection, FeedbackNote.action.ADD, data.source == value.source ? data.source : null);
                    });
                    break;
                case FeedbackNote.action.ADD:
                    var id = FeedbackNote.generateUid();
                    var newFeedbackNote = new FeedbackNote(id, data.note.text);
                    feedbackNotes.set(id, { source: data.source, note: newFeedbackNote });
                    newFeedbackNote.send(connection, FeedbackNote.action.ADD, data.source);
                    break;
                default:
                    if (feedbackNotes.has(data.note.id)) {
                        var item = feedbackNotes.get(data.note.id);
                        var isRequestFromSource = item.source == data.source;
                        var feedbackNote = item.note;
                        switch (data.action) {
                            case FeedbackNote.action.UPDATE:
                                feedbackNote.location = data.note.location;
                                if (isRequestFromSource) {
                                    feedbackNote.colour = data.note.colour;
                                }
                                broadcastAction(FeedbackNote.action.UPDATE, feedbackNote, clients);
                                break;
                            case FeedbackNote.action.DELETE:
                                if (isRequestFromSource) {
                                    feedbackNotes.remove(feedbackNote.id);
                                    broadcastAction(FeedbackNote.action.DELETE, feedbackNote, clients);
                                }
                                break;
                            case FeedbackNote.action.VOTE:
                                feedbackNote.votes++;
                                broadcastAction(FeedbackNote.action.UPDATE, feedbackNote, clients);
                                break;
                        }
                    }
                    break;
            }
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        // remove user from the list of connected clients
        clients.splice(index, 1);
    });
});