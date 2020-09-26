const { mongoConnectionString, localMongoConnectionString } = require('../../configs/config.json');

function getDbUri() {
    return (process.env.NODE_ENV === 'production') ? mongoConnectionString : localMongoConnectionString;
}

function getOpts() {
    return { useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true }
}

module.exports = { getDbUri, getOpts };
