const fs = require('fs');
const edfdecoder = require("..");

var buffer = fs.readFileSync("../data/GD002R29h13.edf").buffer;

console.log( buffer );


var decoder = new edfdecoder.EdfDecoder();
decoder.setInput( buffer );
decoder.decode();
var output = decoder.getOutput();
console.log( output );

/*
var foo = new edfdecoder.Foo(20, 30);

// do something with foo
foo.printAnAttribute();
foo.setAnAttribute(34)
foo.printAnAttribute();
*/
