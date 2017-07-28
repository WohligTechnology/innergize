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
        console.log("**in SaveEmails")
        groupNames = _.split(data.group);
        async.waterfall([
            function (callback) { // this is function to get the group names in comma seperated format to id
                console.log("groupNames", groupNames, "Email.getIdByName", Email.getIdByName);
                async.concat(groupNames, Email.getIdByName, function (err, response) {
                    if (err || _.isEmpty(response)) {
                        callback(err, response);
                    } else {
                        console.log("jhsdsjka")
                        data.group = _.map(response, "_id");
                        callback();
                    }

                });
            },
            function (callback) { // save the email to the database
                console.log("in saving")
                Email.save({
                    name: data.name,
                    lastName: data.lastName,
                    email: data.email,
                    salutation: data.salutation,
                    alias: data.alias,
                    group: data.group
                }, callback);
            }
        ], callback);
    }
}
module.exports = _.assign(module.exports, exports, model);