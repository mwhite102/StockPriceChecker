/*
iextrading.js

Module to call iextrading API to get a stock quote

NOTE: The google URL doesn't work, using iex url from this forum thread
https://www.freecodecamp.org/forum/t/nasdaq-stock-price-checker/219399/7
 */

var axios = require('axios');

function getStockPrice (symbol) {    
    return new Promise(function(resolve, reject) {
      axios.get(`https://api.iextrading.com/1.0/stock/${symbol}/price`)
         .then(response => {
           resolve(response.data);
         })
         .catch(err => {
          console.error(err);
          reject(err);
         });
    })
};

exports.getStockPrice = getStockPrice;

