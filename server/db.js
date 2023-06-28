'use strict'
const sqlite = require ('sqlite3');

const db = new sqlite.Database('AIRLINE.sqlite', (err) => {
    if (err) throw err;
});

module.exports = db; //export in in node convections