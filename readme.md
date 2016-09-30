# easy-intercept
>> Simplest Javascript mocking framework on the planet.

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
