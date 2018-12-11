const mongoose = require('mongoose');
const fs = require('fs');
const { resolve } = require('path');
const { config } = require('../config');
const models = resolve(__dirname, '../database/schema');

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*js$/))
    .forEach(file => require(resolve(models, file)));

exports.database = app => {
    mongoose.set('debug', true);
    mongoose.connect(config.db);
    mongoose.connection.on('disconnected', () => {
        mongoose.connect(config.db);
    });
    mongoose.connection.on('error', err => {
        console.error(err);
    });
    mongoose.connection.on('open', async() => {
        console.log('mongoose had connected', config.db);
    })
}