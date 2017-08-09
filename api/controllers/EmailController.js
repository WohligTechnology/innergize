module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    import: function (req, res) {
        //  excel convert to object
        var filename = req.body.file;
        async.waterfall([function (callback) {
            Config.importGS(filename, callback);
        }, function (exportedData, callback) {
            green("chintan");
            console.log(exportedData);
            async.concatSeries(
                exportedData,
                function (data, callback) {
                    Email.saveEmails(data, function (err, data) {
                        if (err) {
                            callback(null, err);
                        } else {
                            callback(null, data._id);
                        }
                    });
                },
                callback);
        }], function (err, data) {
            res.callback(err, {
                total: data.length,
                value: data
            });
        });
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
            });
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
            });
        }
    }
};
module.exports = _.assign(module.exports, controller);