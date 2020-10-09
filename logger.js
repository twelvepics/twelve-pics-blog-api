const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const Transport = require('winston-transport');
const arango_connection = require('./db/arangodb');

const level = process.env.LOG_LEVEL || 'debug';

class LogToDBTransport extends Transport {
    constructor(opts) {
        super(opts);
        this.collection = opts.collection;
    }
    async log(info, callback) {
        console.log(info);
        setImmediate(() => {
            this.emit('logged', info);
        });
        // Perform the writing to the remote service
        const db = arango_connection.getDb();
        const collection = db.collection(this.collection);
        await collection.save({
            level: info.level,
            timestamp: info.timestamp,
            message: info.message
                .split('\n')
                .map((l) => l.trim())
                .filter((l) => l.length),
        });
        // --
        callback();
    }
}

/////////////////////////////////////////////////////////////
// API_LOGGER
/////////////////////////////////////////////////////////////
const myFormat = printf(({ level, message, timestamp }) => {
    return `${level}: ${message} - ${timestamp} `;
});

const api_logger = createLogger({
    format: combine(timestamp()),
    transports: [],
});

if (process.env.NODE_ENV !== 'production') {
    api_logger.add(new transports.Console({ level, format: myFormat }));
    api_logger.add(new LogToDBTransport({ collection: 'logs_api' }));
} else {
    api_logger.add(new LogToDBTransport({ collection: 'logs_api' }));
}

/////////////////////////////////////////////////////////////
// USERS_EVENTS_LOGGER
/////////////////////////////////////////////////////////////
const subscribers_events_logger = createLogger({
    format: combine(timestamp()),
    transports: [new LogToDBTransport({ collection: 'subscribers_events' })],
});

const event_info = (req, subscriber) => {
    let outStr = '';
    if (subscriber && subscriber._key) {
        outStr += `subscriber: ${subscriber._key}\n`;
    } else {
        outStr += 'subscriber: ---\n';
    }
    // outStr += `ip: ${req.ip}\n`;
    // outStr += `ips: ${req.ips.join('/')}`;
    outStr += `x-forwarded-for: ${req.headers['x-forwarded-for']}\n`;
    outStr += `x-real-ip: ${req.headers['x-real-ip']}\n`;
    return outStr;
};
module.exports = { api_logger, subscribers_events_logger, event_info };
