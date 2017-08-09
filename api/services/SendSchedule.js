var schema = new Schema({
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    scheduleTime: {
        type: Date
    },
    attachment: {
        type: String
    },
    group: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }],
    fromEmail: {
        type: Schema.Types.ObjectId,
        ref: 'FromMail'
    },

    status: {
        type: String,
        default: "Pending",
        enum: ['Pending', 'Sent']
    }
});

schema.plugin(deepPopulate, {
    populate: {
        'group': {
            select: 'name'
        },
        'fromEmail': {
            select: ''
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SendSchedule', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "group fromEmail", "group fromEmail"));
var model = {
    getPendingWithIn: function (callback) {
        var currentTime = moment().toDate();
        // var startTime = moment().add(-1, "day").toDate();
        async.waterfall([
            function (callback) {
                SendSchedule.find({
                        scheduleTime: {
                            // $gt: startTime,
                            $lt: currentTime
                        },
                        status: "Pending"
                    }) // less than and greater than time
                    .deepPopulate("fromName fromEmail")
                    .exec(function (err, schedules) {
                        callback(err, schedules);
                    });
            },
            function (schedules, callback) {
                if (_.isEmpty(schedules)) {
                    callback("No data found", null);
                } else {
                    async.concatSeries(schedules, function (schedule, callback) {
                        async.waterfall([
                            function (callback) { // getting all the emailss
                                Email.getAllEmailsFromGroup(schedule.group, callback);
                            },
                            function (emails, callback) { // send emails to emails recive
                                Email.sendEmailWithAttachment(emails, schedule, callback);
                            },
                            function (data, callback) { // change the status if pending to sent
                                schedule.status = "Sent";
                                schedule.save(callback);
                            }
                        ], function (err, data) {
                            if (err) {
                                callback(null, err);
                            } else {
                                callback(null, data);
                            }
                        });

                    }, callback);
                }
            }
        ], function (err, data) {
            callback(err, data);
        });

    }
};
module.exports = _.assign(module.exports, exports, model);