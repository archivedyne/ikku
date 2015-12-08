var _ = require('underscore');
var kuromoji = require('kuromoji');
var DIC_URL = "node_modules/kuromoji/dist/dict/";

var SENTENCE_COUNT = 3;
var START_CHARACTER = '__start__';
// var END_CHARACTER = '__end__';

kuromoji.builder({ dicPath: DIC_URL }).build( function (err, tokenizer) {
  var tokens = tokenizer.tokenize(process.argv[2]);
  var dic = makeDic( tokens );
  var sentence = makeSentence(dic);
  console.log(sentence.join('\n'));
} );

var makeDic = function (items) {
  var tmp = [ START_CHARACTER ];
  var dic = {};
  _.each( items, function (item) {
    var word = item.surface_form;
    word = word.replace(/\s*/, '');
    if ( word === "" ) return;
    tmp.push(word);
    if (tmp.length < 3) return;
    if (tmp.length > 3) tmp.splice(0, 1);
    setWord(dic, tmp);
    if (word == "。") {
      tmp = [ START_CHARACTER ];
      return;
    }
  } );
  return dic;
};

var setWord = function(p, s3) {
  var w1 = s3[0];
  var w2 = s3[1];
  var w3 = s3[2];
  if (_.isUndefined(p[w1])) p[w1] = {};
  if (_.isUndefined(p[w1][w2] )) p[w1][w2] = {};
  if (_.isUndefined(p[w1][w2][w3])) p[w1][w2][w3] = 0;
  p[w1][w2][w3]++;
};

var makeSentence = function(dic) {
  var sentence = [];
  _.each( _.range(0, SENTENCE_COUNT), function () {
    var ret = [];
    var top = dic[ START_CHARACTER ];
    if (!top) return;
    var w1 = choiceWord(top);
    var w2 = choiceWord(top[w1]);
    ret.push(w1);
    ret.push(w2);
    while(true) {
      var w3 = choiceWord(dic[w1][w2]);
      ret.push(w3);
      if (w3 == "。") break;
      w1 = w2;
      w2 = w3;
    }
    sentence.push(ret.join(""));
  } );
  return sentence;
};

var choiceWord = function(obj) {
  var keys = _.keys(obj);
  var i = _.random(0, keys.length - 1);
  return keys[i];
};

/*
 *
 * https://github.com/substack/node-markov
 * これを真似る
 */
