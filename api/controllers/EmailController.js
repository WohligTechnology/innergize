module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    import: function (req, res) {
        //  excel convert to object
        var filename = req.body.file;
        async.waterfall([function (callback) {
            Config.importGS(filename, callback);
        }, function (exportedData, callback) {
            console.log("import: ", exportedData);
            async.concatSeries(
                exportedData,
                Email.saveEmails,
                callback);
        }], res.callback);
    },

    getAllEmailsFromGroup: function (req, res) {
        if (req.body) {
            Email.getAllEmailsFromGroup(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid request"
                }
            })
        }
    },

    sendEmailWithAttachment: function (req, res) {
        if (req.body) {
            Email.sendEmailWithAttachment(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid request"
                }
            })
        }
    }
};
module.exports = _.assign(module.exports, controller);