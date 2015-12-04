var kuromoji = require('kuromoji');
var DIC_URL = "node_modules/kuromoji/dist/dict/";
var _ = require('underscore');
var model = require('./model.json');

kuromoji.builder({ dicPath: DIC_URL }).build( function (err, tokenizer) {
  var tokens = tokenizer.tokenize(process.argv[2]);
  //console.log('解析結果', tokens );
  var haiku = [];
  var isSuccess = false;
  _.some( model, function ( val, key ) {
    haiku = [];
    var keys = key.split( '/' );
    var ok = _.every( keys, function ( pos ) {
      var gai = _.findWhere( tokens, { pos : pos } );
      if (_.isUndefined( gai ) ) return false;
      haiku.push(gai.surface_form );
      return true;
    });
    isSuccess = ok;
    return ok === true;
  });
  console.log( isSuccess );
  console.log( haiku );
} );
