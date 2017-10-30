(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.edfdecoder = {})));
}(this, (function (exports) { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var lib$1 = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.roundToFloat16Bits = roundToFloat16Bits;
exports.convertToNumber = convertToNumber;
// algorithm: ftp://ftp.fox-toolkit.org/pub/fasthalffloatconversion.pdf

const buffer = new ArrayBuffer(4);
const floatView = new Float32Array(buffer);
const uint32View = new Uint32Array(buffer);

const baseTable = new Uint32Array(512);
const shiftTable = new Uint32Array(512);

for (let i = 0; i < 256; ++i) {
    const e = i - 127;

    // very small number (0, -0)
    if (e < -27) {
        baseTable[i | 0x000] = 0x0000;
        baseTable[i | 0x100] = 0x8000;
        shiftTable[i | 0x000] = 24;
        shiftTable[i | 0x100] = 24;

        // small number (denorm)
    } else if (e < -14) {
        baseTable[i | 0x000] = 0x0400 >> -e - 14;
        baseTable[i | 0x100] = 0x0400 >> -e - 14 | 0x8000;
        shiftTable[i | 0x000] = -e - 1;
        shiftTable[i | 0x100] = -e - 1;

        // normal number
    } else if (e <= 15) {
        baseTable[i | 0x000] = e + 15 << 10;
        baseTable[i | 0x100] = e + 15 << 10 | 0x8000;
        shiftTable[i | 0x000] = 13;
        shiftTable[i | 0x100] = 13;

        // large number (Infinity, -Infinity)
    } else if (e < 128) {
        baseTable[i | 0x000] = 0x7c00;
        baseTable[i | 0x100] = 0xfc00;
        shiftTable[i | 0x000] = 24;
        shiftTable[i | 0x100] = 24;

        // stay (NaN, Infinity, -Infinity)
    } else {
        baseTable[i | 0x000] = 0x7c00;
        baseTable[i | 0x100] = 0xfc00;
        shiftTable[i | 0x000] = 13;
        shiftTable[i | 0x100] = 13;
    }
}

/**
 * round a number to a half float number bits.
 * @param {number} num
 */
function roundToFloat16Bits(num) {
    floatView[0] = num;

    const f = uint32View[0];
    const e = f >> 23 & 0x1ff;
    return baseTable[e] + ((f & 0x007fffff) >> shiftTable[e]);
}

const mantissaTable = new Uint32Array(2048);
const exponentTable = new Uint32Array(64);
const offsetTable = new Uint32Array(64);

mantissaTable[0] = 0;
for (let i = 1; i < 1024; ++i) {
    let m = i << 13; // zero pad mantissa bits
    let e = 0; // zero exponent

    // normalized
    while ((m & 0x00800000) === 0) {
        e -= 0x00800000; // decrement exponent
        m <<= 1;
    }

    m &= ~0x00800000; // clear leading 1 bit
    e += 0x38800000; // adjust bias

    mantissaTable[i] = m | e;
}
for (let i = 1024; i < 2048; ++i) {
    mantissaTable[i] = 0x38000000 + (i - 1024 << 13);
}

exponentTable[0] = 0;
for (let i = 1; i < 31; ++i) {
    exponentTable[i] = i << 23;
}
exponentTable[31] = 0x47800000;
exponentTable[32] = 0x80000000;
for (let i = 33; i < 63; ++i) {
    exponentTable[i] = 0x80000000 + (i - 32 << 23);
}
exponentTable[63] = 0xc7800000;

offsetTable[0] = 0;
for (let i = 1; i < 64; ++i) {
    if (i === 32) {
        offsetTable[i] = 0;
    } else {
        offsetTable[i] = 1024;
    }
}

/**
 * convert a half float number bits to a number.
 * @param {number} float16bits - half float number bits
 */
function convertToNumber(float16bits) {
    const m = float16bits >> 10;
    uint32View[0] = mantissaTable[offsetTable[m] + (float16bits & 0x3ff)] + exponentTable[m];
    return floatView[0];
}
});

unwrapExports(lib$1);

var hfround_1 = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = hfround;



/**
 * returns the nearest half precision float representation of a number.
 * @param {number} num
 */
function hfround(num) {
    num = Number(num);

    // for optimization
    if (!Number.isFinite(num) || num === 0) {
        return num;
    }

    const x16 = (0, lib$1.roundToFloat16Bits)(num);
    return (0, lib$1.convertToNumber)(x16);
}
module.exports = exports["default"];
});

unwrapExports(hfround_1);

var _iterStep = function (done, value) {
  return { value: value, done: !!done };
};

var _iterators = {};

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

var _toIobject = function (it) {
  return _iobject(_defined(it));
};

var _library = true;

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.5.1' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document = _global.document;
// typeof document.createElement is 'object' in old IE
var is = _isObject(document) && _isObject(document.createElement);
var _domCreate = function (it) {
  return is ? document.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
});

var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && key in exports) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? _ctx(out, _global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

var _redefine = _hide;

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

var min = Math.min;
var _toLength = function (it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function (index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});
var _shared = function (key) {
  return store[key] || (store[key] = {});
};

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var shared = _shared('keys');

var _sharedKey = function (key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO$1 = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO$1) _has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
  return O;
};

var document$1 = _global.document;
var _html = document$1 && document$1.documentElement;

var IE_PROTO = _sharedKey('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE$1 = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');
  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
  return createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : _objectDps(result, Properties);
};

var _wks = createCommonjsModule(function (module) {
var store = _shared('wks');

var Symbol = _global.Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
};

$exports.store = store;
});

var def = _objectDp.f;

var TAG = _wks('toStringTag');

var _setToStringTag = function (it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

'use strict';



var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

var _iterCreate = function (Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
  _setToStringTag(Constructor, NAME + ' Iterator');
};

var _toObject = function (it) {
  return Object(_defined(it));
};

var IE_PROTO$2 = _sharedKey('IE_PROTO');
var ObjectProto = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

'use strict';









var ITERATOR = _wks('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!_library && !_has(IteratorPrototype, ITERATOR)) _hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    _hide(proto, ITERATOR, $default);
  }
  // Plug for library
  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

'use strict';





// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }
  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
_iterators.Arguments = _iterators.Array;

var TO_STRING_TAG = _wks('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = _global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
  _iterators[NAME] = _iterators.Array;
}

var _stringAt = function (TO_STRING) {
  return function (that, pos) {
    var s = String(_defined(that));
    var i = _toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

'use strict';
var $at = _stringAt(true);

// 21.1.3.27 String.prototype[@@iterator]()
_iterDefine(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

var TAG$1 = _wks('toStringTag');
// ES3 wrong here
var ARG = _cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

var _classof = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
    // builtinTag case
    : ARG ? _cof(O)
    // ES3 arguments fallback
    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

var ITERATOR$1 = _wks('iterator');

var core_isIterable = _core.isIterable = function (it) {
  var O = Object(it);
  return O[ITERATOR$1] !== undefined
    || '@@iterator' in O
    // eslint-disable-next-line no-prototype-builtins
    || _iterators.hasOwnProperty(_classof(O));
};

var isIterable$2 = core_isIterable;

var isIterable = createCommonjsModule(function (module) {
module.exports = { "default": isIterable$2, __esModule: true };
});

unwrapExports(isIterable);

var ITERATOR$2 = _wks('iterator');

var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$2]
    || it['@@iterator']
    || _iterators[_classof(it)];
};

var core_getIterator = _core.getIterator = function (it) {
  var iterFn = core_getIteratorMethod(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return _anObject(iterFn.call(it));
};

var getIterator$2 = core_getIterator;

var getIterator = createCommonjsModule(function (module) {
module.exports = { "default": getIterator$2, __esModule: true };
});

unwrapExports(getIterator);

var slicedToArray = createCommonjsModule(function (module, exports) {
"use strict";

exports.__esModule = true;



var _isIterable3 = _interopRequireDefault(isIterable);



var _getIterator3 = _interopRequireDefault(getIterator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
});

unwrapExports(slicedToArray);

var spec = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ToInteger = ToInteger;
exports.defaultCompareFunction = defaultCompareFunction;
function ToInteger(num) {
    if (typeof num !== "number") num = Number(num);
    if (Number.isNaN(num)) num = 0;
    return Math.trunc(num);
}

function isPlusZero(val) {
    return val === 0 && 1 / val === Infinity;
}

function defaultCompareFunction(x, y) {
    var _ref = [Number.isNaN(x), Number.isNaN(y)];
    const isNaN_x = _ref[0],
          isNaN_y = _ref[1];


    if (isNaN_x && isNaN_y) return 0;

    if (isNaN_x) return 1;

    if (isNaN_y) return -1;

    if (x < y) return -1;

    if (x > y) return 1;

    if (x === 0 && y === 0) {
        var _ref2 = [isPlusZero(x), isPlusZero(y)];
        const isPlusZero_x = _ref2[0],
              isPlusZero_y = _ref2[1];


        if (!isPlusZero_x && isPlusZero_y) return -1;

        if (isPlusZero_x && !isPlusZero_y) return 1;
    }

    return 0;
}
});

unwrapExports(spec);

var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

var Symbol$1 = _root.Symbol;

var _Symbol = Symbol$1;

var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

var arrayBufferTag = '[object ArrayBuffer]';

/**
 * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
 */
function baseIsArrayBuffer(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == arrayBufferTag;
}

var _baseIsArrayBuffer = baseIsArrayBuffer;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;
});

var nodeIsArrayBuffer = _nodeUtil && _nodeUtil.isArrayBuffer;

/**
 * Checks if `value` is classified as an `ArrayBuffer` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
 * @example
 *
 * _.isArrayBuffer(new ArrayBuffer(2));
 * // => true
 *
 * _.isArrayBuffer(new Array(2));
 * // => false
 */
var isArrayBuffer = nodeIsArrayBuffer ? _baseUnary(nodeIsArrayBuffer) : _baseIsArrayBuffer;

var isArrayBuffer_1 = isArrayBuffer;

var is$1 = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isArrayBuffer = undefined;



Object.defineProperty(exports, "isArrayBuffer", {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(isArrayBuffer_1).default;
    }
});
exports.isDataView = isDataView;
exports.isStringNumberKey = isStringNumberKey;



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isDataView(view) {
    return view instanceof DataView;
}

function isStringNumberKey(key) {
    return typeof key === "string" && key === (0, spec.ToInteger)(key) + "";
}
});

unwrapExports(is$1);

var _private = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createPrivateStorage = createPrivateStorage;
function createPrivateStorage() {
	const wm = new WeakMap();
	return self => {
		let obj = wm.get(self);
		if (obj) {
			return obj;
		} else {
			obj = Object.create(null);
			wm.set(self, obj);
			return obj;
		}
	};
}
});

unwrapExports(_private);

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject$1;

var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

var coreJsData = _root['__core-js_shared__'];

var _coreJsData = coreJsData;

var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource;

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }
  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

var nativeCreate = _getNative(Object, 'create');

var _nativeCreate = nativeCreate;

function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$4.call(data, key);
}

var _hashHas = hashHas;

var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

var _Hash = Hash;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq;

function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf;

var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet;

function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

var _ListCache = ListCache;

var Map = _getNative(_root, 'Map');

var _Map = Map;

function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable;

function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData;

function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

var _MapCache = MapCache;

var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = _MapCache;

var memoize_1 = memoize;

var bug = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// JavaScriptCore bug: https://bugs.webkit.org/show_bug.cgi?id=171606
const isTypedArrayIndexedPropertyWritable = exports.isTypedArrayIndexedPropertyWritable = Object.getOwnPropertyDescriptor(new Uint8Array(1), 0).writable;

// Chakra (Edge <= 14) bug: https://github.com/Microsoft/ChakraCore/issues/1662
const proxy = new Proxy({}, {});
const isProxyAbleToBeWeakMapKey = exports.isProxyAbleToBeWeakMapKey = new WeakMap().set(proxy, 1).get(proxy) === 1;
});

unwrapExports(bug);

var Float16Array_1 = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});



var _slicedToArray3 = _interopRequireDefault(slicedToArray);









var _memoize2 = _interopRequireDefault(memoize_1);





function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _ = (0, _private.createPrivateStorage)();

const __target__ = Symbol("target");

function isFloat16Array(target) {
    return target instanceof Float16Array;
}

function assertFloat16Array(target) {
    if (!isFloat16Array(target)) {
        throw new TypeError("This is not a Float16Array");
    }
}

function isDefaultFloat16ArrayMethods(target) {
    return typeof target === "function" && defaultFloat16ArrayMethods.has(target);
}

function copyToArray(float16bits) {
    const length = float16bits.length;

    const array = new Array(length);
    for (let i = 0; i < length; ++i) {
        array[i] = (0, lib$1.convertToNumber)(float16bits[i]);
    }

    return array;
}

// proxy handler
const applyHandler = {
    apply(func, thisArg, args) {

        // peel off proxy
        if (isFloat16Array(thisArg) && isDefaultFloat16ArrayMethods(func)) return Reflect.apply(func, bug.isProxyAbleToBeWeakMapKey ? _(thisArg).target : thisArg[__target__], args);

        return Reflect.apply(func, thisArg, args);
    }
};

const handler = {
    get(target, key) {
        let wrapper = null;
        if (!bug.isTypedArrayIndexedPropertyWritable) {
            wrapper = target;
            target = _(wrapper).target;
        }

        if ((0, is$1.isStringNumberKey)(key)) {
            return Reflect.has(target, key) ? (0, lib$1.convertToNumber)(Reflect.get(target, key)) : undefined;
        } else {
            const ret = wrapper !== null && Reflect.has(wrapper, key) ? Reflect.get(wrapper, key) : Reflect.get(target, key);

            if (typeof ret !== "function") return ret;

            // TypedArray methods can't be called by Proxy Object
            let proxy = _(ret).proxy;

            if (proxy === undefined) {
                proxy = _(ret).proxy = new Proxy(ret, applyHandler);
            }

            return proxy;
        }
    },

    set(target, key, value) {
        let wrapper = null;
        if (!bug.isTypedArrayIndexedPropertyWritable) {
            wrapper = target;
            target = _(wrapper).target;
        }

        if ((0, is$1.isStringNumberKey)(key)) {
            return Reflect.set(target, key, (0, lib$1.roundToFloat16Bits)(value));
        } else {
            // frozen object can't change prototype property
            if (wrapper !== null && (!Reflect.has(target, key) || Object.isFrozen(wrapper))) {
                return Reflect.set(wrapper, key, value);
            } else {
                return Reflect.set(target, key, value);
            }
        }
    }
};

if (!bug.isTypedArrayIndexedPropertyWritable) {
    handler.getPrototypeOf = wrapper => Reflect.getPrototypeOf(_(wrapper).target);
    handler.setPrototypeOf = (wrapper, prototype) => Reflect.setPrototypeOf(_(wrapper).target, prototype);

    handler.defineProperty = (wrapper, key, descriptor) => {
        const target = _(wrapper).target;
        return !Reflect.has(target, key) || Object.isFrozen(wrapper) ? Reflect.defineProperty(wrapper, key, descriptor) : Reflect.defineProperty(target, key, descriptor);
    };
    handler.deleteProperty = (wrapper, key) => {
        const target = _(wrapper).target;
        return Reflect.has(wrapper, key) ? Reflect.deleteProperty(wrapper, key) : Reflect.deleteProperty(target, key);
    };

    handler.has = (wrapper, key) => Reflect.has(wrapper, key) || Reflect.has(_(wrapper).target, key);

    handler.isExtensible = wrapper => Reflect.isExtensible(wrapper);
    handler.preventExtensions = wrapper => Reflect.preventExtensions(wrapper);

    handler.getOwnPropertyDescriptor = (wrapper, key) => Reflect.getOwnPropertyDescriptor(wrapper, key);
    handler.ownKeys = wrapper => Reflect.ownKeys(wrapper);
}

class Float16Array extends Uint16Array {

    constructor(input, byteOffset, length) {

        // input Float16Array
        if (isFloat16Array(input)) {
            super(bug.isProxyAbleToBeWeakMapKey ? _(input).target : input[__target__]);

            // 22.2.1.3, 22.2.1.4 TypedArray, Array, ArrayLike, Iterable
        } else if (input !== null && typeof input === "object" && !(0, is$1.isArrayBuffer)(input)) {
            // if input is not ArrayLike and Iterable, get Array
            const arrayLike = !Reflect.has(input, "length") && input[Symbol.iterator] !== undefined ? [...input] : input;

            const length = arrayLike.length;
            super(length);

            for (let i = 0; i < length; ++i) {
                // super (Uint16Array)
                this[i] = (0, lib$1.roundToFloat16Bits)(arrayLike[i]);
            }

            // 22.2.1.2, 22.2.1.5 primitive, ArrayBuffer
        } else {
            switch (arguments.length) {
                case 0:
                    super();
                    break;

                case 1:
                    super(input);
                    break;

                case 2:
                    super(input, byteOffset);
                    break;

                case 3:
                    super(input, byteOffset, length);
                    break;

                default:
                    super(...arguments);
            }
        }

        let proxy;

        if (bug.isTypedArrayIndexedPropertyWritable) {
            proxy = new Proxy(this, handler);
        } else {
            const wrapper = Object.create(null);
            _(wrapper).target = this;
            proxy = new Proxy(wrapper, handler);
        }

        // proxy private storage
        if (bug.isProxyAbleToBeWeakMapKey) {
            _(proxy).target = this;
        } else {
            this[__target__] = this;
        }

        // this private storage
        _(this).proxy = proxy;

        return proxy;
    }

    // static methods
    static from(src) {
        if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 0) return new Float16Array(Uint16Array.from(src, lib$1.roundToFloat16Bits).buffer);

        const mapFunc = arguments.length <= 1 ? undefined : arguments[1];
        const thisArg = arguments.length <= 2 ? undefined : arguments[2];

        return new Float16Array(Uint16Array.from(src, function (val) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return (0, lib$1.roundToFloat16Bits)(mapFunc.call(this, val, ...args));
        }, thisArg).buffer);
    }

    static of() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return new Float16Array(args);
    }

    // iterate methods
    *[Symbol.iterator]() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = super[Symbol.iterator]()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                const val = _step.value;

                yield (0, lib$1.convertToNumber)(val);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    keys() {
        return super.keys();
    }

    *values() {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = super.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                const val = _step2.value;

                yield (0, lib$1.convertToNumber)(val);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }

    *entries() {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = super.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                const _ref = _step3.value;

                var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

                const i = _ref2[0];
                const val = _ref2[1];

                yield [i, (0, lib$1.convertToNumber)(val)];
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }
    }

    // functional methods
    map(callback) {
        assertFloat16Array(this);

        const thisArg = arguments.length <= 1 ? undefined : arguments[1];

        const array = [];
        for (let i = 0, l = this.length; i < l; ++i) {
            const val = (0, lib$1.convertToNumber)(this[i]);
            array.push(callback.call(thisArg, val, i, _(this).proxy));
        }

        return new Float16Array(array);
    }

    filter(callback) {
        assertFloat16Array(this);

        const thisArg = arguments.length <= 1 ? undefined : arguments[1];

        const array = [];
        for (let i = 0, l = this.length; i < l; ++i) {
            const val = (0, lib$1.convertToNumber)(this[i]);

            if (callback.call(thisArg, val, i, _(this).proxy)) array.push(val);
        }

        return new Float16Array(array);
    }

    reduce(callback) {
        assertFloat16Array(this);

        let val, start;

        if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 0) {
            val = (0, lib$1.convertToNumber)(this[0]);
            start = 1;
        } else {
            val = arguments.length <= 1 ? undefined : arguments[1];
            start = 0;
        }

        for (let i = start, l = this.length; i < l; ++i) {
            val = callback(val, (0, lib$1.convertToNumber)(this[i]), i, _(this).proxy);
        }

        return val;
    }

    reduceRight(callback) {
        assertFloat16Array(this);

        let val, start;

        const length = this.length;
        if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 0) {
            val = (0, lib$1.convertToNumber)(this[length - 1]);
            start = length - 1;
        } else {
            val = arguments.length <= 1 ? undefined : arguments[1];
            start = length;
        }

        for (let i = start; i--;) {
            val = callback(val, (0, lib$1.convertToNumber)(this[i]), i, _(this).proxy);
        }

        return val;
    }

    forEach(callback) {
        assertFloat16Array(this);

        const thisArg = arguments.length <= 1 ? undefined : arguments[1];

        for (let i = 0, l = this.length; i < l; ++i) {
            callback.call(thisArg, (0, lib$1.convertToNumber)(this[i]), i, _(this).proxy);
        }
    }

    find(callback) {
        assertFloat16Array(this);

        const thisArg = arguments.length <= 1 ? undefined : arguments[1];

        for (let i = 0, l = this.length; i < l; ++i) {
            const value = (0, lib$1.convertToNumber)(this[i]);
            if (callback.call(thisArg, value, i, _(this).proxy)) return value;
        }
    }

    findIndex(callback) {
        assertFloat16Array(this);

        const thisArg = arguments.length <= 1 ? undefined : arguments[1];

        for (let i = 0, l = this.length; i < l; ++i) {
            const value = (0, lib$1.convertToNumber)(this[i]);
            if (callback.call(thisArg, value, i, _(this).proxy)) return i;
        }

        return -1;
    }

    every(callback) {
        assertFloat16Array(this);

        const thisArg = arguments.length <= 1 ? undefined : arguments[1];

        for (let i = 0, l = this.length; i < l; ++i) {
            if (!callback.call(thisArg, (0, lib$1.convertToNumber)(this[i]), i, _(this).proxy)) return false;
        }

        return true;
    }

    some(callback) {
        assertFloat16Array(this);

        const thisArg = arguments.length <= 1 ? undefined : arguments[1];

        for (let i = 0, l = this.length; i < l; ++i) {
            if (callback.call(thisArg, (0, lib$1.convertToNumber)(this[i]), i, _(this).proxy)) return true;
        }

        return false;
    }

    // change element methods
    set(input) {
        assertFloat16Array(this);

        const offset = arguments.length <= 1 ? undefined : arguments[1];

        let float16bits;

        // input Float16Array
        if (isFloat16Array(input)) {
            float16bits = bug.isProxyAbleToBeWeakMapKey ? _(input).target : input[__target__];

            // input others
        } else {
            const arrayLike = !Reflect.has(input, "length") && input[Symbol.iterator] !== undefined ? [...input] : input;
            const length = arrayLike.length;

            float16bits = new Uint16Array(length);
            for (let i = 0, l = arrayLike.length; i < l; ++i) {
                float16bits[i] = (0, lib$1.roundToFloat16Bits)(arrayLike[i]);
            }
        }

        super.set(float16bits, offset);
    }

    reverse() {
        assertFloat16Array(this);

        super.reverse();

        return _(this).proxy;
    }

    fill(value) {
        assertFloat16Array(this);

        for (var _len3 = arguments.length, opts = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            opts[_key3 - 1] = arguments[_key3];
        }

        super.fill((0, lib$1.roundToFloat16Bits)(value), ...opts);

        return _(this).proxy;
    }

    copyWithin(target, start) {
        assertFloat16Array(this);

        for (var _len4 = arguments.length, opts = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
            opts[_key4 - 2] = arguments[_key4];
        }

        super.copyWithin(target, start, ...opts);

        return _(this).proxy;
    }

    sort() {
        assertFloat16Array(this);

        let compareFunction = arguments.length <= 0 ? undefined : arguments[0];

        if (compareFunction === undefined) {
            compareFunction = spec.defaultCompareFunction;
        }

        const _convertToNumber = (0, _memoize2.default)(lib$1.convertToNumber);

        super.sort((x, y) => compareFunction(_convertToNumber(x), _convertToNumber(y)));

        return _(this).proxy;
    }

    // copy element methods
    slice() {
        assertFloat16Array(this);

        let float16bits;

        // V8, SpiderMonkey, JavaScriptCore, Chakra throw TypeError
        try {
            float16bits = super.slice(...arguments);
        } catch (e) {
            if (e instanceof TypeError) {
                const uint16 = new Uint16Array(this.buffer, this.byteOffset, this.length);
                float16bits = uint16.slice(...arguments);
            } else {
                throw e;
            }
        }

        return new Float16Array(float16bits.buffer);
    }

    subarray() {
        assertFloat16Array(this);

        let float16bits;

        // V8, SpiderMonkey, JavaScriptCore, Chakra throw TypeError
        try {
            float16bits = super.subarray(...arguments);
        } catch (e) {
            if (e instanceof TypeError) {
                const uint16 = new Uint16Array(this.buffer, this.byteOffset, this.length);
                float16bits = uint16.subarray(...arguments);
            } else {
                throw e;
            }
        }

        return new Float16Array(float16bits.buffer, float16bits.byteOffset, float16bits.length);
    }

    // contains methods
    indexOf(element) {
        assertFloat16Array(this);

        const length = this.length;

        let from = (0, spec.ToInteger)(arguments.length <= 1 ? undefined : arguments[1]);

        if (from < 0) {
            from += length;
            if (from < 0) from = 0;
        }

        for (let i = from, l = length; i < l; ++i) {
            if ((0, lib$1.convertToNumber)(this[i]) === element) return i;
        }

        return -1;
    }

    lastIndexOf(element) {
        assertFloat16Array(this);

        const length = this.length;

        let from = (0, spec.ToInteger)(arguments.length <= 1 ? undefined : arguments[1]);

        from = from === 0 ? length : from + 1;

        if (from >= 0) {
            from = from < length ? from : length;
        } else {
            from += length;
        }

        for (let i = from; i--;) {
            if ((0, lib$1.convertToNumber)(this[i]) === element) return i;
        }

        return -1;
    }

    includes(element) {
        assertFloat16Array(this);

        const length = this.length;

        let from = (0, spec.ToInteger)(arguments.length <= 1 ? undefined : arguments[1]);

        if (from < 0) {
            from += length;
            if (from < 0) from = 0;
        }

        const isNaN = Number.isNaN(element);
        for (let i = from, l = length; i < l; ++i) {
            const value = (0, lib$1.convertToNumber)(this[i]);

            if (isNaN && Number.isNaN(value)) return true;

            if (value === element) return true;
        }

        return false;
    }

    // string methods
    join() {
        assertFloat16Array(this);

        const array = copyToArray(this);

        return array.join(...arguments);
    }

    toLocaleString() {
        assertFloat16Array(this);

        const array = copyToArray(this);

        return array.toLocaleString(...arguments);
    }

    get [Symbol.toStringTag]() {
        if (isFloat16Array(this)) return "Float16Array";
    }
}

exports.default = Float16Array;
const Float16Array$prototype = Float16Array.prototype;

const defaultFloat16ArrayMethods = new WeakSet();
var _iteratorNormalCompletion4 = true;
var _didIteratorError4 = false;
var _iteratorError4 = undefined;

try {
    for (var _iterator4 = Reflect.ownKeys(Float16Array$prototype)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        const key = _step4.value;

        const val = Float16Array$prototype[key];
        if (typeof val === "function") defaultFloat16ArrayMethods.add(val);
    }
} catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
        }
    } finally {
        if (_didIteratorError4) {
            throw _iteratorError4;
        }
    }
}

module.exports = exports["default"];
});

unwrapExports(Float16Array_1);

var dataView = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFloat16 = getFloat16;
exports.setFloat16 = setFloat16;





/**
 * returns an unsigned 16-bit float at the specified byte offset from the start of the DataView.
 * @param {DataView} dataView
 * @param {nunmber} byteOffset
 * @param {*} opts
 */
function getFloat16(dataView, byteOffset) {
    if (!(0, is$1.isDataView)(dataView)) throw new TypeError("First argument to getFloat16 function must be a DataView");

    for (var _len = arguments.length, opts = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        opts[_key - 2] = arguments[_key];
    }

    return (0, lib$1.convertToNumber)(dataView.getUint16(byteOffset, ...opts));
}

/**
 * stores an unsigned 16-bit float value at the specified byte offset from the start of the DataView.
 * @param {DataView} dataView
 * @param {number} byteOffset
 * @param {number} value
 * @param {*} opts
 */
function setFloat16(dataView, byteOffset, value) {
    if (!(0, is$1.isDataView)(dataView)) throw new TypeError("First argument to setFloat16 function must be a DataView");

    for (var _len2 = arguments.length, opts = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
        opts[_key2 - 3] = arguments[_key2];
    }

    dataView.setUint16(byteOffset, (0, lib$1.roundToFloat16Bits)(value), ...opts);
}
});

unwrapExports(dataView);

var lib = createCommonjsModule(function (module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});



Object.defineProperty(exports, "hfround", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(hfround_1).default;
  }
});



Object.defineProperty(exports, "Float16Array", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(Float16Array_1).default;
  }
});



Object.defineProperty(exports, "getFloat16", {
  enumerable: true,
  get: function get() {
    return dataView.getFloat16;
  }
});
Object.defineProperty(exports, "setFloat16", {
  enumerable: true,
  get: function get() {
    return dataView.setFloat16;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
});

var getFloat16 = unwrapExports(lib);

function createCommonjsModule$1(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var traverse_1 = createCommonjsModule$1(function (module) {
var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f; },
            after : function (f) { modifiers.after = f; },
            pre : function (f) { modifiers.pre = f; },
            post : function (f) { modifiers.post = f; },
            stop : function () { alive = false; },
            block : function () { keepGoing = false; }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node);
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {};
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};
});

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
* The CodecUtils class gather some static methods that can be useful while
* encodeing/decoding data.
* CodecUtils does not have a constructor, don't try to instanciate it.
*/

var CodecUtils = function () {
  function CodecUtils() {
    classCallCheck(this, CodecUtils);
  }

  createClass(CodecUtils, null, [{
    key: "isPlatformLittleEndian",


    /**
    * Get whether or not the platform is using little endian.
    * @return {Boolen } true if the platform is little endian, false if big endian
    */
    value: function isPlatformLittleEndian() {
      var a = new Uint32Array([0x12345678]);
      var b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
      return b[0] != 0x12;
    }

    /**
    * convert an ArrayBuffer into a unicode string (2 bytes for each char)
    * Note: this method was kindly borrowed from Google Closure Compiler:
    * https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
    * @param {ArrayBuffer} buf - input ArrayBuffer
    * @return {String} a string compatible with Unicode characters
    */

  }, {
    key: "arrayBufferToUnicode",
    value: function arrayBufferToUnicode(buff) {
      var buffUint8 = new Uint8Array(buff);
      var out = [],
          pos = 0,
          c = 0;

      while (pos < buffUint8.length) {
        var c1 = buffUint8[pos++];
        if (c1 < 128) {
          out[c++] = String.fromCharCode(c1);
        } else if (c1 > 191 && c1 < 224) {
          var c2 = buffUint8[pos++];
          out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
        } else if (c1 > 239 && c1 < 365) {
          // Surrogate Pair
          var c2 = buffUint8[pos++];
          var c3 = buffUint8[pos++];
          var c4 = buffUint8[pos++];
          var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 0x10000;
          out[c++] = String.fromCharCode(0xD800 + (u >> 10));
          out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
        } else {
          var c2 = buffUint8[pos++];
          var c3 = buffUint8[pos++];
          out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
      }
      return out.join('');
    }
  }, {
    key: "unicodeToArrayBuffer",


    /**
    * convert a unicode string into an ArrayBuffer
    * Note that the str is a regular string but it will be encoded with
    * 2 bytes per char instead of 1 ( ASCII uses 1 byte/char ).
    * Note: this method was kindly borrowed from Google Closure Compiler:
    * https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
    * @param {String} str - string to encode
    * @return {ArrayBuffer} the output ArrayBuffer
    */
    value: function unicodeToArrayBuffer(str) {
      var out = [],
          p = 0;
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
          out[p++] = c;
        } else if (c < 2048) {
          out[p++] = c >> 6 | 192;
          out[p++] = c & 63 | 128;
        } else if ((c & 0xFC00) == 0xD800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xFC00) == 0xDC00) {
          // Surrogate Pair
          c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
          out[p++] = c >> 18 | 240;
          out[p++] = c >> 12 & 63 | 128;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        } else {
          out[p++] = c >> 12 | 224;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        }
      }

      // make a buffer out of the array
      return new Uint8Array(out).buffer;
    }
  }, {
    key: "arrayBufferToString8",


    /**
    * Convert an ArrayBuffer into a ASCII string (1 byte for each char)
    * @param {ArrayBuffer} buf - buffer to convert into ASCII string
    * @return {String} the output string
    */
    value: function arrayBufferToString8(buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    /**
    * Convert a ASCII string into an ArrayBuffer.
    * Note that the str is a regular string, it will be encoded with 1 byte per char
    * @param {String} str - string to encode
    * @return {ArrayBuffer}
    */

  }, {
    key: "string8ToArrayBuffer",
    value: function string8ToArrayBuffer(str) {
      var buf = new ArrayBuffer(str.length);
      var bufView = new Uint8Array(buf);
      for (var i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    /**
    * Write a ASCII string into a buffer
    * @param {String} str - a string that contains only ASCII characters
    * @param {ArrayBuffer} buffer - the buffer where to write the string
    * @param {Number} byteOffset - the offset to apply, in number of bytes
    */

  }, {
    key: "setString8InBuffer",
    value: function setString8InBuffer(str, buffer) {
      var byteOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      if (byteOffset < 0) {
        console.warn("The byte offset cannot be negative.");
        return;
      }

      if (!buffer || !(buffer instanceof ArrayBuffer)) {
        console.warn("The buffer must be a valid ArrayBuffer.");
        return;
      }

      if (str.length + byteOffset > buffer.byteLength) {
        console.warn("The string is too long to be writen in this buffer.");
        return;
      }

      var bufView = new Uint8Array(buffer);

      for (var i = 0; i < str.length; i++) {
        bufView[i + byteOffset] = str.charCodeAt(i);
      }
    }

    /**
    * Extract an ASCII string from an ArrayBuffer
    * @param {ArrayBuffer} buffer - the buffer
    * @param {Number} strLength - number of chars in the string we want
    * @param {Number} byteOffset - the offset in number of bytes
    * @return {String} the string, or null in case of error
    */

  }, {
    key: "getString8FromBuffer",
    value: function getString8FromBuffer(buffer, strLength) {
      var byteOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      if (byteOffset < 0) {
        console.warn("The byte offset cannot be negative.");
        return null;
      }

      if (!buffer || !(buffer instanceof ArrayBuffer)) {
        console.warn("The buffer must be a valid ArrayBuffer.");
        return null;
      }

      if (strLength + byteOffset > buffer.byteLength) {
        console.warn("The string is too long to be writen in this buffer.");
        return null;
      }

      return String.fromCharCode.apply(null, new Uint8Array(buffer, byteOffset, strLength));
    }

    /**
    * Serializes a JS object into an ArrayBuffer.
    * This is using a unicode JSON intermediate step.
    * @param {Object} obj - an object that does not have cyclic structure
    * @return {ArrayBuffer} the serialized output
    */

  }, {
    key: "objectToArrayBuffer",
    value: function objectToArrayBuffer(obj) {
      var buff = null;
      var objCleanClone = CodecUtils.makeSerializeFriendly(obj);

      try {
        var strObj = JSON.stringify(objCleanClone);
        buff = CodecUtils.unicodeToArrayBuffer(strObj);
      } catch (e) {
        console.warn(e);
      }

      return buff;
    }

    /**
    * Convert an ArrayBuffer into a JS Object. This uses an intermediate unicode JSON string.
    * Of course, this buffer has to come from a serialized object.
    * @param {ArrayBuffer} buff - the ArrayBuffer that hides some object
    * @return {Object} the deserialized object
    */

  }, {
    key: "ArrayBufferToObject",
    value: function ArrayBufferToObject(buff) {
      var obj = null;

      try {
        var strObj = CodecUtils.arrayBufferToUnicode(buff);
        obj = JSON.parse(strObj);
      } catch (e) {
        console.warn(e);
      }

      return obj;
    }

    /**
    * Get if wether of not the arg is a typed array
    * @param {Object} obj - possibly a typed array, or maybe not
    * @return {Boolean} true if obj is a typed array
    */

  }, {
    key: "isTypedArray",
    value: function isTypedArray(obj) {
      return obj instanceof Int8Array || obj instanceof Uint8Array || obj instanceof Uint8ClampedArray || obj instanceof Int16Array || obj instanceof Uint16Array || obj instanceof Int32Array || obj instanceof Uint32Array || obj instanceof Float32Array || obj instanceof Float64Array;
    }

    /**
    * Merge some ArrayBuffes in a single one
    * @param {Array} arrayOfBuffers - some ArrayBuffers
    * @return {ArrayBuffer} the larger merged buffer
    */

  }, {
    key: "mergeBuffers",
    value: function mergeBuffers(arrayOfBuffers) {
      var totalByteSize = 0;

      for (var i = 0; i < arrayOfBuffers.length; i++) {
        totalByteSize += arrayOfBuffers[i].byteLength;
      }

      var concatArray = new Uint8Array(totalByteSize);

      var offset = 0;
      for (var i = 0; i < arrayOfBuffers.length; i++) {
        concatArray.set(new Uint8Array(arrayOfBuffers[i]), offset);
        offset += arrayOfBuffers[i].byteLength;
      }

      return concatArray.buffer;
    }

    /**
    * In a browser, the global object is `window` while in Node, it's `GLOBAL`.
    * This method return the one that is relevant to the execution context.
    * @return {Object} the global object
    */

  }, {
    key: "getGlobalObject",
    value: function getGlobalObject() {
      var constructorHost = null;

      try {
        constructorHost = window; // in a web browser
      } catch (e) {
        try {
          constructorHost = GLOBAL; // in node
        } catch (e) {
          console.warn("You are not in a Javascript environment?? Weird.");
          return null;
        }
      }
      return constructorHost;
    }

    /**
    * Extract a typed array from an arbitrary buffer, with an arbitrary offset
    * @param {ArrayBuffer} buffer - the buffer from which we extract data
    * @param {Number} byteOffset - offset from the begining of buffer
    * @param {Function} arrayType - function object, actually the constructor of the output array
    * @param {Number} numberOfElements - nb of elem we want to fetch from the buffer
    * @return {TypedArray} output of type given by arg arrayType - this is a copy, not a view
    */

  }, {
    key: "extractTypedArray",
    value: function extractTypedArray(buffer, byteOffset, arrayType, numberOfElements) {
      if (!buffer) {
        console.warn("Input Buffer is null.");
        return null;
      }

      if (!(buffer instanceof ArrayBuffer)) {
        console.warn("Buffer must be of type ArrayBuffer");
        return null;
      }

      if (numberOfElements <= 0) {
        console.warn("The number of elements to fetch must be greater than 0");
        return null;
      }

      if (byteOffset < 0) {
        console.warn("The byte offset must be possitive or 0");
        return null;
      }

      if (byteOffset >= buffer.byteLength) {
        console.warn("The offset cannot be larger than the size of the buffer.");
        return null;
      }

      if (arrayType instanceof Function && !("BYTES_PER_ELEMENT" in arrayType)) {
        console.warn("ArrayType must be a typed array constructor function.");
        return null;
      }

      if (arrayType.BYTES_PER_ELEMENT * numberOfElements + byteOffset > buffer.byteLength) {
        console.warn("The requested number of elements is too large for this buffer");
        return;
      }

      var slicedBuff = buffer.slice(byteOffset, byteOffset + numberOfElements * arrayType.BYTES_PER_ELEMENT);
      return new arrayType(slicedBuff);
    }

    /**
    * Get some info about the given TypedArray
    * @param {TypedArray} typedArray - one of the typed array
    * @return {Object} in form of {type: String, signed: Boolean, bytesPerElements: Number, byteLength: Number, length: Number}
    */

  }, {
    key: "getTypedArrayInfo",
    value: function getTypedArrayInfo(typedArray) {
      var type = null;
      var signed = false;

      if (typedArray instanceof Int8Array) {
        type = "int";
        signed = false;
      } else if (typedArray instanceof Uint8Array) {
        type = "int";
        signed = true;
      } else if (typedArray instanceof Uint8ClampedArray) {
        type = "int";
        signed = true;
      } else if (typedArray instanceof Int16Array) {
        type = "int";
        signed = false;
      } else if (typedArray instanceof Uint16Array) {
        type = "int";
        signed = true;
      } else if (typedArray instanceof Int32Array) {
        type = "int";
        signed = false;
      } else if (typedArray instanceof Uint32Array) {
        type = "int";
        signed = true;
      } else if (typedArray instanceof Float32Array) {
        type = "float";
        signed = false;
      } else if (typedArray instanceof Float64Array) {
        type = "float";
        signed = false;
      }

      return {
        type: type,
        signed: signed,
        bytesPerElements: typedArray.BYTES_PER_ELEMENT,
        byteLength: typedArray.byteLength,
        length: typedArray.length
      };
    }

    /**
    * Counts the number of typed array obj has as attributes
    * @param {Object} obj - an Object
    * @return {Number} the number of typed array
    */

  }, {
    key: "howManyTypedArrayAttributes",
    value: function howManyTypedArrayAttributes(obj) {
      var typArrCounter = 0;
      traverse_1(obj).forEach(function (x) {
        typArrCounter += CodecUtils.isTypedArray(x);
      });
      return typArrCounter;
    }

    /**
    * Check if the given object contains any circular reference.
    * (Circular ref are non serilizable easily, we want to spot them)
    * @param {Object} obj - An object to check
    * @return {Boolean} true if obj contains circular refm false if not
    */

  }, {
    key: "hasCircularReference",
    value: function hasCircularReference(obj) {
      var hasCircular = false;
      traverse_1(obj).forEach(function (x) {
        if (this.circular) {
          hasCircular = true;
        }
      });
      return hasCircular;
    }

    /**
    * Remove circular dependencies from an object and return a circularRef-free version
    * of the object (does not change the original obj), of null if no circular ref was found
    * @param {Object} obj - An object to check
    * @return {Object} a circular-ref free object copy if any was found, or null if no circ was found
    */

  }, {
    key: "removeCircularReference",
    value: function removeCircularReference(obj) {
      var hasCircular = false;
      var noCircRefObj = traverse_1(obj).map(function (x) {
        if (this.circular) {
          this.remove();
          hasCircular = true;
        }
      });
      return hasCircular ? noCircRefObj : null;
    }

    /**
    * Clone the object and replace the typed array attributes by regular Arrays.
    * @param {Object} obj - an object to alter
    * @return {Object} the clone if ant typed array were changed, or null if was obj didnt contain any typed array.
    */

  }, {
    key: "replaceTypedArrayAttributesByArrays",
    value: function replaceTypedArrayAttributesByArrays(obj) {
      var hasTypedArray = false;

      var noTypedArrClone = traverse_1(obj).map(function (x) {
        if (CodecUtils.isTypedArray(x)) {
          // here, we cannot call .length directly because traverse.map already serialized
          // typed arrays into regular objects
          var origSize = Object.keys(x).length;
          var untypedArray = new Array(origSize);

          for (var i = 0; i < origSize; i++) {
            untypedArray[i] = x[i];
          }
          this.update(untypedArray);
          hasTypedArray = true;
        }
      });
      return hasTypedArray ? noTypedArrClone : null;
    }

    /**
    * Creates a clone, does not alter the original object.
    * Remove circular dependencies and replace typed arrays by regular arrays.
    * Both will make the serialization possible and more reliable.
    * @param {Object} obj - the object to make serialization friendly
    * @return {Object} a clean clone, or null if nothing was done
    */

  }, {
    key: "makeSerializeFriendly",
    value: function makeSerializeFriendly(obj) {
      var newObj = obj;
      var noCircular = CodecUtils.removeCircularReference(newObj);

      if (noCircular) newObj = noCircular;

      var noTypedArr = CodecUtils.replaceTypedArrayAttributesByArrays(newObj);

      if (noTypedArr) newObj = noTypedArr;

      return newObj;
    }
  }]);
  return CodecUtils;
}(); /* END of class CodecUtils */

/*
* Author    Jonathan Lurie - http://me.jonahanlurie.fr
* License   MIT
* Link      https://github.com/jonathanlurie/edfdecoder
* Lab       MCIN - http://mcin.ca/ - Montreal Neurological Institute
*/

//import { Float16Array, getFloat16, setFloat16, hfround } from "@petamoriken/float16";
//import * as f16 from "@petamoriken/float16";
/** Class representing a EdfDecoder. */
class EdfDecoder {

  /**
   * Create a EdfDecoder.
   */
  constructor( ) {
    this._inputBuffer = null;
    this._output = null;
  }

  setInput( buff ){
    this._output = {};
    this._inputBuffer = buff;
  }

  decode(){
    var offset = 0;
    try{
      offset = this._decodeHeader();
    }catch(e){
      console.warn( e );
      this._output = null;
    }

    if( offset ){
      try{
        //this._decodeData( offset );
        this._decodeDataFloat16( offset );
      }catch(e){
        console.warn( e );
        this._output = null;
      }
    }

  }

  _decodeHeader(){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    var header = {};
    this._output.header = header;

    var offset = 0;

    // 8 ascii : version of this data format (0)
    header.dataFormat = CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 80 ascii : local patient identification
    header.patientId = CodecUtils.getString8FromBuffer( this._inputBuffer , 80, offset).trim();
    offset += 80;

    // 80 ascii : local recording identification
    header.localRecordingId = CodecUtils.getString8FromBuffer( this._inputBuffer , 80, offset).trim();
    offset += 80;

    // 8 ascii : startdate of recording (dd.mm.yy)
    header.recordingStartDate = CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 8 ascii : starttime of recording (hh.mm.ss)
    header.recordingStartTime = CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim();
    offset += 8;

    // 8 ascii : number of bytes in header record
    header.nbBytesHeaderRecord = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 44 ascii : reserved
    header.reserved = CodecUtils.getString8FromBuffer( this._inputBuffer , 44, offset);
    offset += 44;

    // 8 ascii : number of data records (-1 if unknown)
    header.nbDataRecords = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 8 ascii : duration of a data record, in seconds
    header.durationDataRecordsSec = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 8, offset).trim() );
    offset += 8;

    // 4 ascii : number of signals (ns) in data record
    header.nbSignals = parseInt( CodecUtils.getString8FromBuffer( this._inputBuffer , 4, offset).trim() );
    offset += 4;

    // the following fields occurs ns time in a row each
    var that = this;
    function getAllSections( sizeOfEachThing ){
      var allThings = [];
      for(var i=0; i<header.nbSignals; i++){
        allThings.push( CodecUtils.getString8FromBuffer( that._inputBuffer , sizeOfEachThing, offset ).trim() );
        offset += sizeOfEachThing;
      }
      return allThings;
    }

    var signalInfoArrays = {
      // ns * 16 ascii : ns * label (e.g. EEG Fpz-Cz or Body temp)
      label: getAllSections( 16 ),
      // ns * 80 ascii : ns * transducer type (e.g. AgAgCl electrode)
      transducerType: getAllSections( 80 ),
      // ns * 8 ascii : ns * physical dimension (e.g. uV or degreeC)
      physicalDimension: getAllSections( 8 ),
      // ns * 8 ascii : ns * physical minimum (e.g. -500 or 34)
      physicalMinimum: getAllSections( 8 ),
      // ns * 8 ascii : ns * physical maximum (e.g. 500 or 40)
      physicalMaximum: getAllSections( 8 ),
      // ns * 8 ascii : ns * digital minimum (e.g. -2048)
      digitalMinimum: getAllSections( 8 ),
      // ns * 8 ascii : ns * digital maximum (e.g. 2047)
      digitalMaximum: getAllSections( 8 ),
      // ns * 80 ascii : ns * prefiltering (e.g. HP:0.1Hz LP:75Hz)
      prefiltering: getAllSections( 80 ),
      // ns * 8 ascii : ns * nr of samples in each data record
      nbOfSamples: getAllSections( 8 ),
      // ns * 32 ascii : ns * reserved
      reserved: getAllSections( 32 )
    };

    var signalInfo = [];
    header.signalInfo = signalInfo;
    for(var i=0; i<header.nbSignals; i++){
      signalInfo.push({
        label: signalInfoArrays.label[i],
        transducerType: signalInfoArrays.transducerType[i],
        physicalDimension: signalInfoArrays.physicalDimension[i],
        physicalMinimum: parseFloat( signalInfoArrays.physicalMinimum[i] ),
        physicalMaximum: parseFloat( signalInfoArrays.physicalMaximum[i] ),
        digitalMinimum: parseInt( signalInfoArrays.digitalMinimum[i] ),
        digitalMaximum: parseInt( signalInfoArrays.digitalMaximum[i] ),
        prefiltering: signalInfoArrays.prefiltering[i],
        nbOfSamples: parseInt( signalInfoArrays.nbOfSamples[i] ),
        reserved: signalInfoArrays.reserved[i],
      });
    }

    return offset;
  }


  _decodeData( byteOffset ){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    if(! "header" in this._output ){
      console.warn("Invalid header");
      return;
    }


    var sampleType = Int16Array;
    var header = this._output.header;
    var signals = [];
    this._output.signals = signals;

    var signalOffset = 0;

    for(var i=0; i<header.nbSignals; i++){
      var signalNbSamples = header.signalInfo[i].nbOfSamples * header.nbDataRecords;
      var signal = CodecUtils.extractTypedArray( this._inputBuffer, byteOffset + signalOffset, sampleType, signalNbSamples );
      signalOffset += signalNbSamples * sampleType.BYTES_PER_ELEMENT;
      signals.push( signal );
    }

    console.log( this._output );
  }



  _decodeDataFloat16( byteOffset ){
    if(! this._inputBuffer ){
      console.warn("A input buffer must be specified.");
      return;
    }

    if(! "header" in this._output ){
      console.warn("Invalid header");
      return;
    }


    var bytePerSample = 2;
    var header = this._output.header;
    var signals = [];
    this._output.signals = signals;

    var signalOffset = 0;

    for(var i=0; i<header.nbSignals; i++){
      var signalNbSamples = header.signalInfo[i].nbOfSamples * header.nbDataRecords;

      var slicedBuff = this._inputBuffer.slice(byteOffset + signalOffset, byteOffset + signalOffset + signalNbSamples * bytePerSample);
      let view = new DataView( slicedBuff );
      var signal = [];

      for(var s=0; s<signalNbSamples; s++){
        signal.push( getFloat16.getFloat16(view, s * bytePerSample, false) );
      }


      //var signal = CodecUtils.extractTypedArray( this._inputBuffer, byteOffset + signalOffset, sampleType, signalNbSamples );
      signalOffset += signalNbSamples * bytePerSample;
      signals.push( signal );
    }

    console.log( this._output );
  }



}

exports.EdfDecoder = EdfDecoder;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=edfdecoder.umd.js.map
