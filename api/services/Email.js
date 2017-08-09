var schema = new Schema({
    name: {
        type: String,
        required: true,
        excel: true
    },
    lastName: {
        type: String,
        excel: true
    },
    email: {
        type: String,
        excel: "Email",
        unique: true
    },
    salutation: {
        type: String,
        excel: true
    },
    alias: {
        type: String,
        excel: true
    },
    group: [{
        type: Schema.Types.ObjectId,
        ref: 'Group',
        excel: [{
            name: "group"
        }]
    }]
});

schema.plugin(deepPopulate, {
    populate: {
        'group': {
            select: 'name _id'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Email', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "group", "group"));
var model = {
    saveEmails: function (data, callback) {
        if (!_.isEmpty(data)) {
            groupNames = _.map(_.split(data.Group, ","), function (n) {
                return {
                    name: n
                };
            });
            async.waterfall([
                function (callback) { // this is function to get the group names in comma seperated format to id
                    async.concat(groupNames, Group.getIdByName, function (err, response) {
                        if (err || _.isEmpty(response)) {
                            console.log("err: ", err);
                            callback(err);
                        } else {
                            data.group = response;
                            callback(null);
                        }

                    });
                },
                function (callback) { // save the email to the database
                    Email.saveData({
                        name: data["First Name"],
                        lastName: data["Last Name"],
                        email: data["Email Id"],
                        salutation: data.Salutation,
                        alias: data.Alias,
                        group: data.group
                    }, function (err, data) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, data);
                        }
                    });
                }
            ], callback);
        } else {
            callback(null, null);
        }
    },
    getAllEmailsFromGroup: function (groupIds, callback) {
        Email.find({
            group: {
                $in: [groupIds]
            }
        }).lean().exec(function (err, data) {
            callback(err, data);
        });
    },
    sendEmailWithAttachment: function (emailsObj, emailData, callback) {
        async.concatSeries(emailsObj, function (emailObj, callback) {
            Config.sendScheduledEmail(emailObj, emailData, callback);
        }, function (err, data) {
            callback(err, data);
        });
    }
};
module.exports = _.assign(module.exports, exports, model);