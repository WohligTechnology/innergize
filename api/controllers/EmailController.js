module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    import: function (req, res) {
        //  excel convert to object
        async.concatLimit(
            exportedData, 10,
            Email.saveEmails,
            res.callback);
    }
};
module.exports = _.assign(module.exports, controller);