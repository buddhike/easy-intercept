import R from 'ramda';
import interceptor from './interceptor';
import matchArgs from './matchArgs';
import constants from './constants';
import addMember from './addMember';

/*
 * Utilities
 */
const isFunction = R.is(Function);
const NOOP = () => {};

function allMembers(of) {
  const items = [];
  for (let i in of) {
    items.push(i);
  }
  return items;
}

function createFunctionInterceptor(target) {
  let interceptorInstance = interceptor();
  let returnValue;
  let calls = [];

  const intercepted = function () {

    calls.push({
      args: arguments
    });

    const count = calls.length;
    const call = {
      index: count - 1,
      count,
      args: R.values(arguments)
    };

    const invokeTarget = () => {
      console.log('target invoked'); // eslint-disable-line
      return target.apply(this, arguments);
    };

    return interceptorInstance
      .intercept(call)
      .getOrElse(returnValue ? returnValue() : invokeTarget());
  };

  const makeConfig = interceptFn => {
    return {
      returns: v => {
        interceptorInstance = interceptFn(v);
        return intercepted;
      },
      throws: e => {
        interceptorInstance = interceptFn(() => {
          throw e;
        });
        return intercepted;
      }
    };
  };

  addMember(intercepted, 'onCall', function (c) {
    return makeConfig(interceptorInstance.onCall(c));
  });

  addMember(intercepted, 'withArgs', function () {
    const args = R.values(arguments);

    return makeConfig(interceptorInstance.withArgs(args));
  });

  addMember(intercepted, 'returns', function (value) {
    returnValue = () => value;
    return intercepted;
  });

  addMember(intercepted, 'getCall', function (index) {
    return calls[index];
  });

  const quickCall = i => () => calls[i];

  addMember(intercepted, 'firstCall', quickCall(0));
  addMember(intercepted, 'secondCall', quickCall(1));
  addMember(intercepted, 'thirdCall', quickCall(2));

  addMember(intercepted, 'received', function () {
    const matchCurrentArguments = R.compose(matchArgs, R.values)(arguments);

    const matchRecordedCall = R.compose(
      matchCurrentArguments,
      R.values,
      R.prop('args'));

    const findMatchingCalls = R.filter(matchRecordedCall);
    const matchingCalls = findMatchingCalls(calls);

    return matchingCalls.length === 0 ? false : matchingCalls
  });

  addMember(intercepted, 'receivedAny', function () {
    return intercepted.received.apply(this, arguments)
      .length > 0;
  });

  addMember(intercepted, 'calls', function() {
    return calls;
  });

  addMember(intercepted, 'throws', function (err) {
    returnValue = () => {
      throw err || new Error('Pre-configured error');
    };
  });

  return intercepted;
}

function createObjectInterceptor(target) {
  const getMember = R.prop(R.__, target);
  const isFunctionMember = R.compose(isFunction, getMember);
  const findFunctionNames = R.compose(R.filter(isFunctionMember), allMembers);
  const createInterceptorMember = R.compose(
    createInterceptor,
    f => f.bind(target),
    getMember);

  const functionNames = findFunctionNames(target);
  const proxyFunctions = R.map(createInterceptorMember, functionNames);

  return R.zipObj(functionNames, proxyFunctions);
}

function createInterceptor(target) {
  target = target || NOOP;
  return isFunction(target) ? createFunctionInterceptor(target) :
    createObjectInterceptor(target);
}

createInterceptor._ = constants.placeholder;

export default createInterceptor
