const bull = require('bull');

const mailQueue = new bull('mail-queue', { concurrency: 4 });

const opts = { delay: 1000, removeOnComplete: true, attempts: 5 }

const addMailTask = async (obj) => {
    return await mailQueue.add(obj, opts);
}

module.exports = { mailQueue, addMailTask }