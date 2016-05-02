/**
 * Created by Siddharth on 4/28/2016.
 */
var mongoose = require('mongoose');
var ejs = require('ejs');
var Company = require('./company');
var Rules = require('./rules');

var data = {};

exports.fetchData = function (callback) {
    if(mongoose.connection.readyState!=1)
         mongoose.connect('mongodb://localhost/cmpe239');
    var companySchema = Company;
    
    var companies = [],
        count;

    companySchema.count({}, function (err, cnt) {
        if(err) throw err;

        count = cnt;
        companySchema.find({}, {'_id':0,'__v':0}, function (err, comps) {
            if(err) throw err;

            comps.forEach(function (comp) {
                companies.push(comp);
                if(companies.length==count) {
                    callback(false, companies);
                    mongoose.connection.close();
                }
            });
        });
    });



};

exports.postData = function (rules, callback) {
    if(mongoose.connection.readyState!=1)
         mongoose.connect('mongodb://localhost/cmpe239');
    var rulesSchema = Rules;

    rulesSchema.collection.insert(rules, onInsert);

    function onInsert(err, docs) {
        if (err) {
            console.log(err);
        } else {
            console.log(docs);
        }
    }
};

exports.getStats = function (res,compFirst, compSecond, callback) {
    if(mongoose.connection.readyState!=1)
        mongoose.connect('mongodb://localhost/cmpe239');
    var companySchema = Company;
    var rulesSchema;
    var techs1 = [];
    var techs2 = [];
    var techs = [];
    var count;
    companySchema.find({ name: compFirst }, function(err, comp) {
        if (err) throw err;

        console.log(comp);
        techs1 = comp[0].technologies;
        //
        companySchema.find({ name: compSecond }, function(err, comp) {
            if (err) throw err;

            console.log(comp);
            techs2 = comp[0].technologies;

            rulesSchema = Rules;
            rulesSchema.count({}, function (err, cnt) {
                if(err) throw err;

                count = cnt;
                rulesSchema.find({}, {'_id':0}, function (err, tecs) {
                    if(err) throw err;

                    tecs.forEach(function (tech) {
                        techs.push(tech);
                        if(techs.length==count) {
                            result = getResult(techs, techs1, techs2);
                            callback(1);
                            res.render('strategy');
                            mongoose.connection.close();
                        }
                    });
                });
            });
        });
    });
};

function getResult(techs, techs1, techs2) {
    console.log("data:\n" + techs1 + "\n" + techs2);
    var results = 0;
    if(techs1.length>techs2.length)
        techs1 = removeDuplicates(techs1, techs2);
    else
        techs2 = removeDuplicates(techs2, techs1);

    console.log("data: "+ techs1 + "\n" + techs2);
    if(techs2.length==0)
        results = doCompare(techs1, techs);
    else  {
        getCombos(techs1, techs2);
        console.log(data);
        for(key in data) {
            results += doCompare(data[key],techs);
            console.log("results: " + results);
        }
    }

    results = results/23;
    console.log(results*100);

}

function doCompare(techs1, techs) {
    techs1.sort();
    console.log("data:\n" + techs1);
    for(var i=0; i<techs.length; i++) {
        if(matchThem(techs1, techs[i].technologies))
            return techs[i].count;
    }
    return 0;
}

function getCombos(techs1, techs2) {
    var len1 = techs1.length,
        len2 = techs2.length;
    if(len1==0||len2==0)
        return;
    temp = techs1.concat(techs2);
    data[temp] = temp;
    if(len1==1&&len2==1) {

    } else if(len1==1) {
        getCombos(techs1, techs2.slice(len2/2));
        getCombos(techs1, techs2.slice(0,len2/2));
    } else if(len2==1) {
        getCombos(techs1.slice(len1/2), techs2);
        getCombos(techs1.slice(0,len1/2), techs2);
    }
}

function removeDuplicates(techs1, techs2) {
    var result = [];
    techs1.sort(); techs2.sort();
    for(var j=0; j< techs1.length; j++) {
        for(var i=0; i<techs2.length; i++) {
            if(j<techs1.length) {
                if(techs2[i]==techs1[j]) {
                    console.log("duplicate removed: " + techs1[j]);
                    j++;
                }
            }
        }
        if(j<techs1.length)
            result.push(techs1[j]);
    }
    return result;
}

function matchThem(one, two) {
    two.sort();
    var i,j;
    if(one.length!=two.length)
        return false;
    for(i=0,j=0;i<one.length && j<two.length;) {
        if (one[i]==two[j]) {
            ++i; ++j;
        } else {
            return false;
        }
    }


    return ((two.length-one.length)==0);
}

exports.fetchRules = function () {

    if(mongoose.connection.readyState!=1)
        mongoose.connect('mongodb://localhost/cmpe239');
    var rulesSchema = Rules;

    var rules = [],
        count;

    rulesSchema.count({}, function (err, cnt) {
        if(err) throw err;

        count = cnt;
        rulesSchema.find({}, {'_id':0}, function (err, rls) {
            if(err) throw err;

            rls.forEach(function (rls) {
                rules.push(rls);
                if(rules.length==count) {
                    return rules;
                    mongoose.connection.close();
                }
            });
        });
    });
};
