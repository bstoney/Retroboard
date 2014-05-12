;
(function (exports) {

    function ActionItem(id, name, text) {
        this.id = id;
        this.name = name;
        this.text = text;
    };

    ActionItem.prototype = {
        constructor: ActionItem,
        id: '',
        name: '',
        text: ''
    };

    ActionItem.action = {
        ADD: 'add-action',
        DELETE: 'delete-action'
    };

    ActionItem.fromData = function (data) {
        if(!data) {
            return null;
        }
        var actionItem = new ActionItem(data.id, data.name, data.text);
        return actionItem;
    };

    exports.ActionItem = ActionItem;

})(this.exports || this);