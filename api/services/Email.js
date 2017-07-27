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
        groupNames = _.split(data.group);
        async.waterfall([
            function (callback) { // this is function to get the group names in comma seperated format to id
                async.concat(groupNames, Email.getIdByName, function (err, response) {
                    data.group = _.map(response, "_id");
                    callback();
                });
            },
            function (callback) { // save the email to the database
                Email.save({
                    name: data.firstName,
                    group: data.group
                }, callback);
            }
        ], callback);
    }
}
module.exports = _.assign(module.exports, exports, model);