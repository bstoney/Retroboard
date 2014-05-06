retroboardApp.factory('User', ['$cookies', function ($cookies) {
    function UserService() {
        var uniqueId = $cookies.sourceid;
        if (!uniqueId) {
            uniqueId = FeedbackNote.generateUid();
            $cookies.sourceid = uniqueId;
        }

        this.getUniqueUserId = function () {
            return uniqueId;
        }

        var feedbackNoteColour = $cookies.feedbackNoteColour;
        if (!feedbackNoteColour) {
            feedbackNoteColour = Math.floor((Math.random() * 6) + 1);
            $cookies.feedbackNoteColour = feedbackNoteColour;
        }

        this.getFeedbackNoteColour = function () {
            return feedbackNoteColour;
        }
    }

    return new UserService();
}]);
