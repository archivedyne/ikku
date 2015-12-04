// modelを作成用
var kuromoji = require('kuromoji');
var DIC_URL = "node_modules/kuromoji/dist/dict/";
var _ = require('underscore');
var fs  = require('fs');
var async = require('async');

async.waterfall([
  function ( next ) {
    var read = fs.createReadStream('./haiku.csv');
    read.on('data', function (data) {
      var data2 = data.toString();
      data2 = data2.replace(/[\n\r]/g,"");
      var haikus = data2.split(',');
      next(null, haikus);
    });
  },
  function ( haikus, next ) {
    var hash = {};
    kuromoji.builder({ dicPath: DIC_URL }).build( function (err, tokenizer) {
      _.each( haikus, function (haiku) {
        var tokens = tokenizer.tokenize(haiku);
        console.log('データの確認', tokens );
        hash = countHash( hash, tokens );
      });
      next( null, hash );
    });
  },
  function ( hash, next ) {
    var fileName = 'model.json';
    fs.writeFile( fileName, JSON.stringify(hash, null, 2), function (error) {
      if (error) console.log('書き込み失敗', error  );
      next();
    } );
  }
], function (error ) {
  if ( error ) return console.log('エラー', error );
  console.log('Done');
} );


var countHash = function ( hash, haikuToken ) {
  //var keys = _.pluck( haikuToken, 'pos' );
  var keys = _.map( haikuToken, function ( val, key ) {
    return key.pos + key.pos_detail_1;
  });
  var keyName = keys.join('/');
  if ( !_.has(hash, keyName) ) {
    hash[ keyName ] = 1;
  } else {
    hash[ keyName ]++;
  }
  return hash;
};
