////////////////////////////////////////////////////////////////////////////////////////
// ../node_modules/.bin/env-cmd  -f "../config/dev.env"  node db_setup.js
////////////////////////////////////////////////////////////////////////////////////////

const arango = require("arangojs");
const Database = arango.Database;

const sysdb = new Database("http://127.0.0.1:8529");
sysdb.useBasicAuth(process.env.DB_USER, process.env.DB_PASSWORD);
const db = sysdb.database(process.env.DB_NAME);

///////////////////////////////////////
// create DB
///////////////////////////////////////
// TODO
// const db = new Database();
// const info = await db.createDatabase("mydb", [{ username: "root" }]);
// Checks whether the database exists.
// async database.exists(): boolean

///////////////////////////////////////
// create collections
///////////////////////////////////////

const createCollection = async (name) => {
  const collection = db.collection(name);
  try {
    const res = await collection.create({
      keyOptions: {
        type: "uuid",
      },
      allowUserKeys: false,
    });
    return res;
  } catch (err) {
    return { err: `Error: ${err.message}` };
  }
};

// create all required collections
const collections = [
  "subscribers",
  "logs_api",
  "email_confirm",
  "subscribers_events",
  "logs_tasks",
];
// const collections = ['logs_api', 'logs_tasks']

// const db = new Database();
// const collection = db.collection('some-collection');
// const result = await collection.exists();
// result indicates whether the collection exists

const createAllCollections = async (list) => {
  try {
    collections.forEach(async (col) => {
      // console.log(col)
      let collection = await createCollection(col);
      console.log(collection.name);
    });
    return "OK";
  } catch (err) {
    console.log(err);
    return { err: `Error: ${err.message}` };
  }
};
createAllCollections(collections);

///////////////////////////////////////
// list collections
///////////////////////////////////////
const listCollections = async () => {
  const l = await db.listCollections();
  return l;
};
listCollections().then((colls) => {
  colls.map((coll) => console.log(coll.name));
});

// create indexes
// const db = new Database();
// const collection = db.collection("some-collection");
// const index = await collection.createIndex({
//   type: "hash",
//   fields: ["a", "a.b"]
// });
// the index has been created with the handle `index.id`
console.log("-- YOLO --");
