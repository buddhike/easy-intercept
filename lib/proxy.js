import R from 'ramda';
import interceptor from './interceptor';
import matchArgs from './matchArgs';

function createProxy(target) {
  let interceptorInstance = interceptor();
  let returnValue;
  let calls = [];

  const proxy = function() {
    calls.push({
      args: arguments
    });

    const count = calls.length;
    const call = {
      index: count - 1,
      count,
      args: R.values(arguments)
    };

    return interceptorInstance
      .intercept(call)
      .getOrElse(returnValue ? returnValue() : target.apply(this, arguments));
  };

  const makeConfig = interceptFn => {
    return {
      returns: v => {
        interceptorInstance = interceptFn(v);
        return proxy;
      },
      throws: e => {
        interceptorInstance = interceptFn(() => { throw e; });
        return proxy;
      }
    };
  };

  proxy.onCall = function(c) {
    return makeConfig(interceptorInstance.onCall(c));
  };

  proxy.withArgs = function() {
    const args = R.values(arguments);

    return makeConfig(interceptorInstance.withArgs(args));
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
