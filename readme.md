# easy-intercept
>> Simplest Javascript interception framework on the planet.

easy-intercept is a function interception library, nothing more nor less. It's commonly used for unit testing with other utilities like mocha and proxyquire. However, it can be used for any other intercepting scenarios you fancy.

## Installation
```sh
npm install easy-intercept
```

Create an intercepted function.
```javascript
var intercept = require('easy-intercept');
var f = intercept();
```

Configure a return value.
```javascript
f.returns(42);
```

Throw an error.
```javascript
f.throws('doh');
```

Configure a return value on specific call.
```javascript
f.onCall(0).returns(42);
```

There are some helpers to configure most common calls.
```javascript
f.firstCall().returns(42);
f.secondCall().returns(42);
f.thirdCall().returns(42);
```

Throw an error on a specific call.
```javascript
f.onCall(0).throws('doh');
```

Configure a return value for a call with matching arguments.
```javascript
f.withArgs('a', 'b').returns(42);
```

Throw an error for matching arguments.
```javascript
f.withArgs('a', 'b').throws('doh');
```

Access calls received with specific arguments. ```received``` method returns an array of ```callInfo``` objects containing the call information.
```javascript
var calls = f.received('a', 'b');
var numberOfCalls = calls.length;
```

Verify if a call with any argument is made.
```javascript
f.receivedAny('a', 'b');
```

Use ```proxy._``` match any argument.
```javascript
f.received(intercept._, 'b');
```

Receive an array of callInfo containing all calls made to an
intercepted function.
```javascript
f.calls();
```

Passing an existing functions to ```intercept``` will create a new function
that can be manipulated as shown in preceding examples. At runtime, if a specific
behavior cannot be found, the original function is executed.

```javascript
function add(a, b) {
  return a + b;
}

var p = intercept(print);
p.onCall(0).returns(42);
p(1, 1); // 42
p(1, 1); // 2

p.withArgs(10, 5).returns(42);
p(10, 5); // 42
p(1, 1); // 2;

p.withArgs(2, 2).throws('doh');
p(2, 2); // throws
p(1, 1); // 2
```

Passing an object to ```intercept``` will create a new object mirroring all
functions available in the original object. Behavior of these functions is identical
to the behavior described above.

```Javascript
function Foo() {
  this.add = function(a, b) {
    return a + b;
  };
}

var f = new Foo();
var i = intercept(f);

i.add.firstCall().returns(42);
i.add(1, 1); // 42
i.add(2, 2); // 4
```
