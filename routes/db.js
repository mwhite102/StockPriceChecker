// db.js
// Module for accessing mongoDb

var MongoClient = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');

// Supress deprecation warning in moongoose for useFindAndModify
mongoose.set('useFindAndModify', false);

var stockSchema = new mongoose.Schema({
  symbol: String,
  address: String,
  like: Boolean
});

var StockModel = mongoose.model('StockModel', stockSchema);

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true}, () => {
  console.log('Connected to database');
});

// exports

exports.getNumberOfLikes = async function getNumberOfLikes(symbol) {
    return new Promise(function(resolve, reject) {
        StockModel.find({
            symbol: symbol,
            like: true
        }, function (err, data) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve(data ? data.length : 0);
            }
        })
    });
};

exports.addOrUpdateLikedSymbol = async function(ipAddress, symbol) {
    // does a liked symbol already exists?
    var model = await getLikedSymbolForIpAddress(ipAddress);
    if (model) {
        if (model.symbol !== symbol) {
            await updateLikedSymbolForIpAddress(model._id, symbol);
        }
    }
    else {
        await addLinkedSymbolForIpAddress(ipAddress, symbol);
    }
};

// helper functions

async function addLinkedSymbolForIpAddress(ipAddress, symbol) {
    await StockModel.create({address: ipAddress, symbol: symbol, like: true});
};

async function updateLikedSymbolForIpAddress(id, symbol) {
    return new Promise(function(resolve, reject) {
       StockModel.updateOne({_id: id}, { symbol: symbol}, function (err, res) {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            resolve(res);
        }
       });
    });
};

async function getLikedSymbolForIpAddress(ipAddress) {
    return new Promise(function(resolve, reject) {
        StockModel.findOne({
            address: ipAddress,
            like: true
        }, function (err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
