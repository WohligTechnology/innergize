module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    import: function (req, res) {
        //  excel convert to object
        var filename = req.body.file
        console.log(req.body);
        Config.importGS(filename, function (err, exportedData) {
            console.log("in importGs", exportedData)
            async.concat(
                exportedData,
                Email.saveEmails,
                res.callback);
        })
    }
};
module.exports = _.assign(module.exports, controller);