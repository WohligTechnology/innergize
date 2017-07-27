var schema = new Schema({
    name: {
        type: String,
        required: true

        // excel: {
        //     name: Name
        // }
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    salutation: {
        type: String
    },
    alias: {
        type: String
    },
    group: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
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
var model = {};
module.exports = _.assign(module.exports, exports, model);