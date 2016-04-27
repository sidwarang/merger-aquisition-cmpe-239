/**
 * Created by Siddharth on 4/27/2016.
 */
var mysql = require('./mysql');
var tweetStats = require('./twitterSearch');
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

exports.getStats = function (req, res) {

    var compFirst = localStorage.getItem('compFirst');
    var compSecond = localStorage.getItem('compSecond');
    var polarity = [];
    tweetStats.getTweets(compFirst, compSecond, function (err, result, twits) {
        if (err) {

            throw err;
        }

        polarity = result;
        var tweets = twits;
        console.log("hello pol..." + polarity);

        res.render('sentiment', {
            polarity: polarity,
            tweets: tweets,
            compFirst: compFirst,
            compSecond: compSecond
        });
    });

};