import R from 'ramda';
import Maybe from 'data.maybe';
import matchArgs from './matchArgs';

/*
 * Utilities
 */
const isFunction = R.is(Function);

/**
 * Creates a call handler that returns a specific value
 * or invokes a specific function.
 * Functions are invoked with arguments to the proxied
 * function and call information captured by the proxy.
 */
const makeHandler = function(value) {
  const wrapper = R.ifElse(isFunction, R.identity, v => () => v);
  const wrapped = wrapper(value);

  return function(call) {
    const args = R.concat(call.args, [ call ]);
    return Maybe.Just(wrapped.apply(this, args));
  };
};

/**
 * A function interceptor
 */
function Interceptor(nextHandler) {
  nextHandler = nextHandler || (()  => Maybe.Nothing());

  /**
   * Used to change the behavior on a specifi call.
   * @param {int} index - Index of the call to change behavior.
   * @param value - A return value or a function with modified behavior.
   */
  const onCall = R.curry((index, value) => {
    const handler = makeHandler(value);

    return Interceptor.of(function(call) {
      return call.index === index ? handler(call) : nextHandler(call)
    });
  });

  this.onCall = onCall;

  // Utilities to change the behavior of most commonly changed calls.
  this.onFirst = onCall(0);
  this.onSecond = onCall(1);
  this.onThird = onCall(2);

  /**
   * Used to change the behavior upon received specific arguments.
   * @param {Array} args - An array of arguments to match.
   * @param value - A return value or a function with modified behavior.
   */
  this.withArgs = R.curry((args, value) => {
    const handler = makeHandler(value);
    const extractInput = R.compose(Maybe.fromNullable, R.prop('args'));
    const maybeMatchArgs = R.lift(matchArgs);
    const matchCurrentArgs = maybeMatchArgs(Maybe.fromNullable(args));

    const whichHandler = function(r) {
      return r.getOrElse(false) ? handler : nextHandler;
    };

    const resolveHandler = R.compose(
      whichHandler,
      matchCurrentArgs,
      extractInput);

    const f = call => {
      const h = resolveHandler(call)
      return h(call);
    };

    return Interceptor.of(f);
  });

  /**
   * Invokes the matching handler for the specified call.
   */
  this.intercept = function(call) {
    return nextHandler(call);
  };
}

/**
 * Creates an instance of Interceptor for the given function.
 */
Interceptor.of = function(fn) {
  return new Interceptor(fn);
};

export default () => {
  return Interceptor.of();
};
