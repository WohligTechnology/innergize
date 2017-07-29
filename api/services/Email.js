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
        groupNames = _.map(_.split(data.group, ","), function (n) {
            return {
                name: n
            };
        });
        async.waterfall([
            function (callback) { // this is function to get the group names in comma seperated format to id
                async.concat(groupNames, Group.getIdByName, function (err, response) {
                    if (err || _.isEmpty(response)) {
                        callback(err, response);
                    } else {
                        data.group = response;
                        callback();
                    }

                });
            },
            function (callback) { // save the email to the database
                console.log(data);
                Email.saveData({
                    name: data.name,
                    lastName: data.lastName,
                    email: data.email,
                    salutation: data.salutation,
                    alias: data.alias,
                    group: data.group
                }, callback);
            }
        ], callback);
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
        console.log("emailsObj", emailsObj[0].email, "emailData", emailData)
        async.concatSeries(emailsObj, function (emailObj, callback) {
            Config.sendScheduledEmail(emailObj, emailData, callback);
        }, function (err, data) {
            console.log("$$$$$$$$$", data);
            callback(err, data);
        });
    }
}
module.exports = _.assign(module.exports, exports, model);