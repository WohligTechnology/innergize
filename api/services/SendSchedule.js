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
        var currentTime = moment().toDate();
        var startTime = moment().add(-1, "hour").toDate();
        console.log("currentTime", currentTime)
        console.log("startTime", startTime)
        async.waterfall([
            function (callback) {
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