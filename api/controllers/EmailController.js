module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    import: function (req, res) {
        //  excel convert to object
        var filename = req.body.file;
        console.log(req.body.file);

        async.waterfall([function (callback) {
            Config.importGS(filename, callback);
        }, function (exportedData, callback) {
            async.concatSeries(
                exportedData,
                Email.saveEmails,
                callback);
        }], res.callback);


    }
};
module.exports = _.assign(module.exports, controller);