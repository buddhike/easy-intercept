import R from 'ramda';
import Maybe from 'data.maybe';
import matchArgs from './matchArgs';

function Interceptor(handler) {
  handler = handler || (() => Maybe.Nothing());

  this.onCall = R.curry((index, value) => {
    return Interceptor.of(call =>
      call.index === index ? Maybe.Just(value) : handler(call)
    );
  });

  this.onFirst = this.onCall(0);
  this.onSecond = this.onCall(1);
  this.onThird = this.onCall(2);

  this.withArgs = R.curry((args, value) => {
    const maybeArgs = Maybe.fromNullable(args);
    const matchingValue = () => Maybe.Just(value);
    const extractInput = R.compose(Maybe.fromNullable, R.prop('args'));
    const matchCurrentArgs = R.lift(matchArgs)(maybeArgs);
    const whichHandler = r => r.getOrElse(false) ? matchingValue : handler;
    const resolve = R.compose(whichHandler, matchCurrentArgs, extractInput);

    const f = call => {
      const h = resolve(call)
      return h(call);
    };

    return Interceptor.of(f);
  });

  this.intercept = call => {
    return handler(call);
  };
}

Interceptor.of = fn => new Interceptor(fn);

export default () => {
  return Interceptor.of();
};
