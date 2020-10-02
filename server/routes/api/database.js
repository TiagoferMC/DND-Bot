let {
    mongoConnectionString,
    localMongoConnectionString
} = require("../../configs/config.json");

const dbUri =
    process.env.NODE_ENV === "production"
        ? mongoConnectionString
        : localMongoConnectionString;

const dbOpts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
};

export { dbUri, dbOpts };
