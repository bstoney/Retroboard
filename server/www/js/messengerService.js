var MessengerServiceEvents = {
    OPEN: 'message-connection-open',
    ERROR: 'message-connection-error'
};

retroboardApp.factory('Messenger', ['User', '$rootScope', '$q', function (User, $rootScope, $q) {
    var callbackHandlers = {
        addHandler: function (id, callback) {
            this[id] = callback;
        },
        getHandler: function (id) {
            return this[id];
        },
        removeHandler: function (id) {
            delete this[id];
        },
        trigger: function (id) {
            var args = Array.prototype.slice.call(arguments, 1);
            var handler = this.getHandler(id);
            if (typeof handler === "function") {
                handler.apply(null, args);
            }
        }
    };

    var connection;

    function createConnection() {
        if (connection && connection.readyState == WebSocket.OPEN) {
            return $q.when();
        }

        var deferred = $q.defer();
        var isOpen = false;
        connection = new WebSocket('ws://' + document.location.host + '/', 'feedback-protocol');
        connection.onopen = function (event) {
            isOpen = true;
            deferred.resolve();
            callbackHandlers.trigger('open');
        };
        connection.onmessage = function (event) {
            console.log('Received Message: ' + event.data);
            var payload = JSON.parse(event.data);
            callbackHandlers.trigger(payload.action, payload.data, payload.error);
        };
        connection.onerror = function (event) {
            var errorMessage = "An unexpected connection error has occurred.";
            if (!isOpen) {
                deferred.reject("Unable to open connection.");
                return;
            }

            if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
                errorMessage = "The connection has be unexpectedly closed."
            }
            else if (this.readyState == WebSocket.CONNECTING) {
                errorMessage = "The connection is not yet ready."
            }

            callbackHandlers.trigger('error', errorMessage);
        };

        return deferred.promise;
    }

    function sendActionMessage(action, boardId, data) {
        var payload = {
            id: Utilities.generateUid(),
            action: action,
            user: User.getUniqueUserId(),
            board: boardId,
            data: data
        };
        var json = JSON.stringify(payload);
        console.log('Sent Message: ' + json);

        var deferred = $q.defer();

        callbackHandlers.addHandler(payload.id, function (data, error) {
            callbackHandlers.removeHandler(payload.id);
            if (error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(data);
            }
        });

        try {
            connection.send(json);
        } catch (e) {
            callbackHandlers.removeHandler(payload.id);
            return $q.reject(e);
        }

        return deferred.promise;
    }

    function MessengerService() {
        createConnection();

        callbackHandlers.addHandler('open', function () {
            $rootScope.$broadcast(MessengerServiceEvents.OPEN);
        });
        callbackHandlers.addHandler('error', function (error) {
            $rootScope.$broadcast(MessengerServiceEvents.ERROR, error);
        });
        this.send = function (action, boardId, data) {
            return createConnection().catch().then(function () {
                return sendActionMessage(action, boardId, data);
            });
        };

        this.register = function (action, callback) {
            callbackHandlers.addHandler(action, function (error) {
                $rootScope.$broadcast(action, error);
            });

            $rootScope.$on(action, function (event) {
                var args = Array.prototype.slice.call(arguments, 1);
                callback.apply(null, args)
            });
        };
    }

    return new MessengerService();
}]);
