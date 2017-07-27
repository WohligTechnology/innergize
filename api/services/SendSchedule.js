var schema = new Schema({
    subject: {
        type: String,
        required: true

        // excel: {
        //     name: Name
        // }
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
var model = {};
module.exports = _.assign(module.exports, exports, model);