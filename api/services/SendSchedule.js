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
    status: {
        type: String,
        default: "Pending",
        enum: ['Pending', 'Sent']
    }
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
module.exports = mongoose.model('SendSchedule', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "group", "group"));
var model = {
    getPendingWithIn: function (callback) {
        console.log("in getPendingWithIn")
        var currentTime = moment().toDate();
        var startTime = moment().add(-1, "hour").toDate();
        var emailsAll = {};
        console.log("currentTime", currentTime);
        console.log("startTime", startTime);
        async.waterfall([
            function (callback) {
                console.log("in waterfall");
                SendSchedule.find({
                        scheduleTime: {
                            $gt: startTime,
                            $lt: currentTime
                        }
                    }) // less than and greater than time
                    .exec(function (err, schedules) {
                        callback(err, schedules);
                    })
            },
            function (schedules, callback) {
                console.log("*****schedules", schedules)
                if (_.isEmpty(schedules)) {
                    console.log("empty");
                    callback("No data found", null);
                } else {
                    async.concatSeries(schedules, function (schedule, callback) {
                        console.log("*****in concatSeries")
                        console.log("*****in schedules", schedules)
                        async.waterfall([
                            function (callback) { // getting all the emails
                                console.log("schedule.group", schedule.group);
                                Email.getAllEmailsFromGroup(schedule.group, callback);
                            },
                            function (emails, callback) { // send emails to emails recived
                                console.log("emails", emails)
                                Email.sendEmailWithAttachment(emails, schedule, callback);
                            },
                            function (data, callback) { // change the status if pending to sent
                                console.log("in changing status", data)
                                schedule.status = "Sent";
                                schedule.save(callback);
                            }
                        ], callback);

                    }, callback);
                }
            }
        ], function (err, data) {
            callback(err, data);
        });

    }
};
module.exports = _.assign(module.exports, exports, model);