var _ = require('underscore');
var kuromoji = require('kuromoji');
var CSV = require('comma-separated-values');
var DIC_URL = "node_modules/kuromoji/dist/dict/";
var fs  = require('fs');
var async = require('async');

async.waterfall([
  function ( next ) {
    var read = fs.createReadStream( __dirname + '/model_100.csv');
    read.on('data', function (data) {
      var haikus = new CSV(data.toString(), {
        header: ['kamigo', 'nakashichi', 'shimogo']
      }).parse();
      next(null, haikus);
    });
  },
  function ( haikus, next ) {
    kuromoji.builder({ dicPath: DIC_URL }).build( function (err, tokenizer) {
      next( null, haikus, tokenizer);
    });
  },
  function ( haikus, tokenizer, next ) {
    var goHash = {};
    var nanaHash = {};
    var kamigo = _.pluck( haikus, 'kamigo');
    var shimogo = _.pluck( haikus, 'shimogo');
    var goNoKus = _.union( kamigo, shimogo );
    var nanaNoKus = _.pluck( haikus, 'nakashichi' );
    _.each( goNoKus, function (goNoKu) {
      var tokens = tokenizer.tokenize(goNoKu);
      goHash = countHash( goHash, tokens );
    });
    _.each( nanaNoKus, function (nanaNoku) {
      var tokens = tokenizer.tokenize(nanaNoku);
      nanaHash = countHash( nanaHash, tokens );
    });
    next( null, goHash, nanaHash );
  },
  function ( goHash, nanaHash, next ) {
    var fileName = 'model5.json';
    fs.writeFile( fileName, JSON.stringify(goHash, null, 2), function (error) {
      if (error) console.log('書き込み失敗', error  );
      next( null, nanaHash);
    } );
  },
  function ( nanaHash, next ) {
    var fileName = 'model7.json';
    fs.writeFile( fileName, JSON.stringify(nanaHash, null, 2), function (error) {
      if (error) console.log('書き込み失敗', error  );
      next();
    } );
  }
], function (error ) {
  if ( error ) return console.log('エラー', error );
  console.log('Done');
} );


var countHash = function ( hash, haikuTokens ) {
  var keys = _.map( haikuTokens, function ( haikuToken ) {
    return String(haikuToken.pos_detail_1) + String(haikuToken.pos);
  });
  var keyName = keys.join('/');
  if ( !_.has(hash, keyName) ) {
    hash[ keyName ] = 1;
  } else {
    hash[ keyName ]++;
  }
  return hash;
};
