module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getPendingWithIn: function (req, res) {
        SendSchedule.getPendingWithIn(res.callback);
    },
};
module.exports = _.assign(module.exports, controller);
