var kuromoji = require('kuromoji');
var DIC_URL = "node_modules/kuromoji/dist/dict/";
var _ = require('underscore');
var model = require('./model.json');

kuromoji.builder({ dicPath: DIC_URL }).build( function (err, tokenizer) {
  var words = tokenizer.tokenize(process.argv[2]);
  //console.log('解析結果', words );
  var haiku = [];
  var isSuccess = false;
  _.some( model, function ( val, keys ) {
    haiku = [];
    var words = keys.split( '/' );
    var ok = _.every( tokens, function ( pos ) {
      var gai = _.findWhere( tokens, { pos : pos } );
      var kei = _.findWhere( tokens, { pos_detail_1 : pos_detail_1 } );
      if (_.isUndefined( gai ) ) return false;
      if (_.isUndefined( kei ) ) return false;
      haiku.push(gai.surface_form );
      return true;
    });
    isSuccess = ok;
    return ok === true;
  });
  console.log( isSuccess );
  console.log( haiku );
} );
