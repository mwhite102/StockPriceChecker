/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var iex = require('./iextrading');
var db = require('./db');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      if (typeof req.query.stock === 'string') {
        // one stock passed in
        if (req.query.like) {
          await db.addOrUpdateLikedSymbol(req.ip, req.query.stock.toUpperCase());
        }
        await handleSingleSymbol(req.query.stock.toUpperCase(), function (err, data) {
          if (err) {
            res.send(err);
          } else {
            res.json(data);
          }
        });
      }
      else {
        if (req.query.like) {
          await db.addOrUpdateLikedSymbol(req.ip, req.query.stock[0].toUpperCase());
        }
        await handleMultipleSymbols(req.query.stock, function (err, data) {
          if (err) {
            res.send(err);
          } else {
            res.json(data);
          }
        });        
      }      
    });
    
};

async function handleSingleSymbol(symbol, callback) {
  try {
    var price = await iex.getStockPrice(symbol);    
    var likes = await db.getNumberOfLikes(symbol);
  }
  catch(error)
  {
    callback(error);
  }
  callback(null, {"stockData":{stock: symbol, price: price.toString(), likes: likes}});
};

async function handleMultipleSymbols(symbols, callback) {
  var quotes = [];
  for (var i = 0; i < symbols.length; i++){
    await handleSingleSymbol(symbols[i].toUpperCase(), function(err, data) {
      if (err) {
        return callback(err);
      }
      else {
        quotes.push(data.stockData);
      }
    });
  }
  
  // There should be two items in the stockData array
  if (quotes.length === 2) {
    // Calculate the rel_likes values
    quotes[0].rel_likes = quotes[0].likes - quotes[1].likes;
    quotes[1].rel_likes = quotes[1].likes - quotes[0].likes;

    // Delete the likes properties
    delete quotes[0].likes;
    delete quotes[1].likes;
    
    callback(null, {stockData: quotes}); 
  }
  else {
    callback(new error('Unexpected number of items in stockData array')); 
  }
  
};




