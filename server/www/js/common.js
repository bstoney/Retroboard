;
(function (exports) {
    exports.Utilities = {
        generateUid: function (separator) {
            var delim = separator || "-";

            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
        },

        indexOf: function (array, matcher) {
            for (var i = 0; i < array.length; i++) {
                if (matcher(array[i])) {
                    return i;
                }
            }
            return -1;
        }
    };


})(this.exports || this);