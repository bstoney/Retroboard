var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var ws = require('websocket').server;
var HashMap = require('hashmap').HashMap;
var jade = require('jade');
var Utilities = require('./www/js/common.js').Utilities;
var Retroboard = require('./www/js/model/retroboard.js').Retroboard;
var FeedbackNote = require('./www/js/model/feedbacknote.js').FeedbackNote;
var ActionItem = require('./www/js/model/actionitem.js').ActionItem;

var mimeTypes = {
    'html': 'text/html',
    'jade': 'text/html',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'js': 'text/javascript',
    'css': 'text/css'
};
var DEFAULT_MIME_TYPE = 'text/plain';

var SERVER_PORT = 8080;

var server = http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;

    if (uri.indexOf('..') != -1) {
        response.writeHead(403);
        response.end();
    }

    uri = 'www/' + uri;
    if (uri.charAt(uri.length - 1) == '/') {
        uri += 'index';
    }

    var filename = path.join(process.cwd(), uri);
    console.log('\tAttempting to serve: ' + filename);

    var files = [];
    if (!path.extname(filename).split('.')[1]) {
        files.push(filename + '.html', filename + '.jade');
    }
    else {
        files.push(filename);
    }

    function processRequest() {
        var filename = files.pop();
        fs.exists(filename, function (exists) {
            if (exists) {
                var extension = path.extname(filename).split('.')[1];
                var mimeType = mimeTypes[extension] || DEFAULT_MIME_TYPE;

                if (extension == 'jade') {
                    try {
                        var html = jade.renderFile(filename);
                        response.writeHead(200, {'Content-Type': mimeType});
                        response.end(html);
                    } catch (e) {
                        console.error(e);
                        response.writeHead(500);
                        response.end();
                    }
                }
                else {
                    response.writeHead(200, {'Content-Type': mimeType});
                    var fileStream = fs.createReadStream(filename);
                    fileStream.pipe(response);
                }
            } else if (files.length == 0) {
                console.log('File not found: ' + filename);
                response.writeHead(404);
                response.end('Sorry, the file you requested was not found. Don\'t let it ruin your day! :)');
                return;
            }
            else {
                processRequest();
            }
        });
    }

    processRequest();

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

function broadcastAction(action, boardId, data, clients) {
    var payload = {
        id: Utilities.generateUid(),
        action: action,
        user: null,
        board: boardId,
        data: data
    };

    // broadcast message to all connected clients
    var json = JSON.stringify(payload, this.hideOwner);
    console.log('Broadcast Message: ' + json);
    for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(json);
    }
}

function handleClientMessage(action, data) {
    var retroboard = retroBoards.has(this.board) ? retroBoards.get(this.board) : null;
    switch (action) {
        case Retroboard.action.GET:
            return retroboard;
        case Retroboard.action.CREATE:
            if (!retroBoards.has(data.id)) {
                // TODO better!
                retroboard = new Retroboard(data.id);
                retroboard.fromData(data);
                retroBoards.set(data.id, retroboard);
            }
            return retroboard;
        default:
            break;
	}

	if(!retroboard) {
		throw new Error('No retroboard created');
	}

	switch (action) {
        case FeedbackNote.action.ADD:
            var newNote = retroboard.addNote(new FeedbackNote(Utilities.generateUid(), data.text));
            newNote.updateFromData(data);
            newNote.owner = this.user;
            retroboard.bringNoteToTop(newNote);
            return newNote;
        case FeedbackNote.action.DELETE:
            // TODO verify permission
            retroboard.removeNote(data.id);
            broadcastAction.call(this, FeedbackNote.action.DELETE, retroboard.id, data.id, this.allClients);
            return null;
        case FeedbackNote.action.UPDATE:
            var note = retroboard.getNote(data.id);
            if (note) {
                note.updateFromData(data);
                retroboard.bringNoteToTop(note);
                broadcastAction.call(this, FeedbackNote.action.UPDATE, retroboard.id, note, this.allClients);
            }
            return null;
        case FeedbackNote.action.VOTE:
            var note = retroboard.getNote(data.id);
            if (note) {
                note.votes++;
                broadcastAction.call(this, FeedbackNote.action.UPDATE, retroboard.id, note, this.allClients);
            }
            return null;
        case ActionItem.action.ADD:
            var newActionItem = ActionItem.fromData(data);
            newActionItem.id = Utilities.generateUid();
            newActionItem.owner = this.user;
            retroboard.addActionItem(newActionItem);
            broadcastAction.call(this, ActionItem.action.ADD, retroboard.id, newActionItem, this.allClients);
            return null;
        case ActionItem.action.DELETE:
            retroboard.removeActionItem(data.id);
            broadcastAction.call(this, ActionItem.action.DELETE, retroboard.id, data.id, this.allClients);
            return null;
        default:
            break;
    }

    throw new Error('Not implemented');
}

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

            var connectionDetails = {
                client: connection,
                allClients: clients,
                board: payload.board,
                user: payload.user,
                hideOwner: function (key, value) {
                    return key == 'owner' && value != payload.user ? undefined : value;
                }
            };

            var response = { action: payload.id };
            try {
                response.data = handleClientMessage.call(connectionDetails, payload.action, payload.data);
            }
            catch (e) {
                console.log(e);
                response.error = e.toString();
            }

            var json = JSON.stringify(response, connectionDetails.hideOwner);
            console.log('Response Message: ' + json);
            connection.send(json);
        }
        else {
            console.log('Received unexpected data type ' + message.type);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');

        // remove user from the list of connected clients
        clients.splice(index, 1);
    });
});

console.log('Retroboard listening on port ' + SERVER_PORT);
