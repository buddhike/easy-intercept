import R from 'ramda';
import interceptor from './interceptor';
import matchArgs from './matchArgs';

function createProxy(target) {
  let interceptorInstance = interceptor();
  let index = 0;
  let returnValue;
  let calls = [];

  let proxy = function() {
    calls.push({
      args: arguments
    });

    return interceptorInstance
      .intercept({
        index: index++,
        args: R.values(arguments)
      })
      .getOrElse(returnValue || target.apply(this, arguments));
  };

  proxy.onCall = function(c) {
    return {
      returns: v => {
        interceptorInstance = interceptorInstance.onCall(c)(v);
        return proxy;
      }
    };
  };

  proxy.withArgs = function() {
    const args = R.values(arguments);
    return {
      returns: v => {
        interceptorInstance = interceptorInstance.withArgs(args)(v);
        return proxy;
      }
    };
  };

  proxy.returns = function(value) {
    returnValue = value;
    return proxy;
  };

  proxy.call = function(index) {
    return calls[index];
  };

  proxy.received = function() {
    const matchCurrentArguments = R.compose(matchArgs, R.values)(arguments);

    const matchRecordedCall = R.compose(matchCurrentArguments,
      R.values,
      R.prop('args'));

    const anyMatchingCall = R.any(matchRecordedCall);

    return anyMatchingCall(calls);
  };

  return proxy;
}

export default createProxy
