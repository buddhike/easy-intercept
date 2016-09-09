import interceptor from '../lib/interceptor';
import R from 'ramda';

const output = f => {
  let o;

  f.map(v => { o = v; });

  return o;
};

describe('interceptor', () => {
  const call = { index: 0 }

  it('should return nothing by default', () => {
    const i = interceptor();

    (!output(i.intercept())).should.be.true;
  });

  describe('onCall', () => {
    it('should return the pre-configured value', () => {
      const i = interceptor().onCall(0, 42);
      const t = R.compose(output, i.intercept);
      t(call).should.equal(42);
    });

    describe('chained multiple times', () => {
      it('should return the last value', () => {
        const i = interceptor().onCall(0)(42).onCall(0)(43);

        output(i.intercept({ index: 0 })).should.equal(43);
      });
    });

    describe('mixed configurations', () => {
      it('should return the matching value', () => {
        const i = interceptor().onCall(0)(42).onCall(1)(43);

        output(i.intercept({ index: 1 })).should.equal(43);
      });
    });
  });

  describe('withArgs', () => {
    describe('matching all args', () => {
      it('should return the configured value', () => {
        const i = interceptor().withArgs(['a', 'b'])(42);
        const r = i.intercept({ args: ['a', 'b'] });
        const result = output(r) || false;

        result.should.equal(42);
      });
    });

    describe('chained multiple times', () => {
      it('should return the last value', () => {
        const i = interceptor()
          .withArgs(['a' ])(42)
          .withArgs(['a'])(43);

        const r = i.intercept({ args: ['a'] });
        const result = output(r) || false;

        result.should.equal(43);
      })
    });

    describe('match no arguments', () => {
      it('should not return the value for calls with arguments', () => {
        const i = interceptor().withArgs([])(42);

        const result = output(i.intercept( { args: ['a'] })) || false;
        result.should.be.false;
      });
    });

    describe('match some args', () => {
      it('should return the configured value', () => {
        const i = interceptor().withArgs(['a'])(42);
        const r = i.intercept({ args: [ 'a', 'b' ] });
        const result = output(r) || false;

        result.should.equal(42);
      });
    });

    describe('match some args out of order', () => {
      it('should not return the configured value', () => {
        const i = interceptor().withArgs(['a', 'b'])(42);
        const r = i.intercept({ args: [ 'c', 'b' ] });
        const result = output(r) || false;

        result.should.be.false;
      });
    });
  });
});
