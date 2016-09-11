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
      .getOrElse(returnValue ? returnValue() : target.apply(this, arguments));
  };

  proxy.onCall = function(c) {
    const interceptOnCall = interceptorInstance.onCall(c);

    return {
      returns: v => {
        interceptorInstance = interceptOnCall(v);
        return proxy;
      },
      throws: e => {
        interceptorInstance = interceptOnCall(() => { throw e; });
        return proxy;
      }
    };
  };

  proxy.withArgs = function() {
    const args = R.values(arguments);
    const interceptWithArgs = interceptorInstance.withArgs(args);

    return {
      returns: v => {
        interceptorInstance = interceptWithArgs(v);
        return proxy;
      },
      throws: e => {
        interceptorInstance = interceptWithArgs(() => { throw e; });
        return proxy;
      }
    };
  };

  proxy.returns = function(value) {
    returnValue = () => value;
    return proxy;
  };

  proxy.call = function(index) {
    return calls[index];
  };

  const quickCall = i => () => calls[i];

  proxy.firstCall = quickCall(0);
  proxy.secondCall = quickCall(1);
  proxy.thirdCall = quickCall(2);

  proxy.received = function() {
    const matchCurrentArguments = R.compose(matchArgs, R.values)(arguments);

    const matchRecordedCall = R.compose(matchCurrentArguments,
      R.values,
      R.prop('args'));

    const findMatchingCalls = R.filter(matchRecordedCall);
    const matchingCalls = findMatchingCalls(calls);

    return matchingCalls.length === 0 ? false : matchingCalls
  };

  proxy.receivedAny = function() {
    return proxy.received.apply(this, arguments).length > 0;
  };

  proxy.throws = function(err) {
    returnValue = () => {
      throw err || new Error('Pre-configured error');
    };
  };

  return proxy;
}

export default createProxy
