const arango = require("arangojs");
const aql = arango.aql;
const arango_connection = require('./arangodb');
const { IntegrityError } = require('../utils/errors');

/***********************************************************************
 * SUBSCRIBERS
 ***********************************************************************/

/* get subscription stats, numbers errors etc */
const getStats = async () => {

}
/* create subscriber */
const saveSubscriber = async (payload) => {
    const db = arango_connection.getDb()
    const collection = db.collection('subscribers');
    // build it
    console.log('-----');
    console.log(payload);
    console.log('-----');
    _subscriber = { ...payload }
    _subscriber.is_in = true;
    _subscriber.date_created = new Date();
    _subscriber.email_confirmed = false;
    _subscriber.date_removed = null;
    // and save
    const subscriber = await collection.save(_subscriber, { returnNew: true });
    return subscriber.new;
}

/* getsubscriber by key */
const getSubscriberBykey = async (key) => {
    const db = arango_connection.getDb()
    const collection = db.collection('subscribers');
    const q = aql`
            FOR s IN ${collection}
            FILTER s._key == ${key} && s.is_in == true
            RETURN s
        `
    const cursor = await db.query(q)
    const user = await cursor.next()
    return user
}

/* delete subscriber */
const deleteSubscriber = async (subscriberKey) => {
    const db = arango_connection.getDb();
    const collection = db.collection('subscribers');
    const done = await collection.update(subscriberKey, { is_in: false });
    return !!done;
}

const updateSubscriber = async (subscriberKey, kvToUpdate) => {
    console.log(`++> ${subscriberKey}`)
    const db = arango_connection.getDb()
    const collection = db.collection('subscribers');
    const subscriber = await collection.update(subscriberKey, kvToUpdate, { returnNew: true });
    return subscriber;
}
/***********************************************************************
 * EMAILS
 ***********************************************************************/

/* Does filed already exist in ocllection */
const fieldToLowerExists = async (fname, fvalue, collName = 'subscribers') => {

    const db = arango_connection.getDb()
    const collection = db.collection(collName);

    const q = aql`
            FOR u IN ${collection}
            FILTER  LOWER(u.${fname}) == ${fvalue.toLowerCase()}
            RETURN u
        `
    const cursor = await db.query(q)
    const found = await cursor.next()
    if (!found) {
        return false
    } else {
        throw new IntegrityError(`This ${fname} is already registered.`, fname)
    }
}

const emailExistsAndVerified = async (email) => {
    const db = arango_connection.getDb()
    const collection = db.collection('subscribers');
    const q = aql`
            FOR s IN ${collection}
            FILTER  LOWER(s.email) == ${email.toLowerCase()} && s.email_confirmed == true
            RETURN s
        `
    const cursor = await db.query(q)
    const found = await cursor.next()
    if (!found) {
        throw new IntegrityError('Email is not in database or not verified')
    } else {
        return true
    }
}

const createValidateEmailEntry = async (subscriber_key) => {
    const db = arango_connection.getDb();
    const collection = db.collection('email_confirm');
    const entry = {
        subscriber_key,
        done: false,
        date_created: new Date(),
        date_updated: null,
        sent: false,
        date_sent: null,

    }
    const saved = await collection.save(entry);
    return saved;
}

const getValidateEmailEntry = async (entryKey) => {
    const db = arango_connection.getDb();
    const collection = db.collection('email_confirm');
    const doc = await collection.document(entryKey, true);
    if (doc === null) {
        // the document does not exist
        return undefined
    }
    return doc
}

const setValidateEmailEntryDone = async (entryKey) => {
    const db = arango_connection.getDb();
    const collection = db.collection('email_confirm');
    const date_updated = new Date();
    const done = await collection.update(entryKey, { done: true, date_updated }, { returnNew: true });
}


module.exports = {
    getStats, saveSubscriber, getSubscriberBykey, updateSubscriber, deleteSubscriber, fieldToLowerExists,
    emailExistsAndVerified, emailExistsAndVerified, createValidateEmailEntry, getValidateEmailEntry,
    setValidateEmailEntryDone
}