const edfdecoder = require("../dist/edfdecoder.cjs.js");

var foo = new edfdecoder.Foo(20, 30);

// do something with foo
foo.printAnAttribute();
foo.setAnAttribute(34)
foo.printAnAttribute();
