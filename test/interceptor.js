import interceptor from '../lib/interceptor';

describe('interceptor', () => {
  const call = { index: 0 }

  it('should return nothing by default', () => {
    const i = interceptor();

    i.intercept().getOrElse(false).should.be.false;
  });

  describe('onCall', () => {
    it('should return the pre-configured value', () => {
      const i = interceptor().onCall(0, 42);

      i.intercept(call).getOrElse(false).should.equal(42);
    });

    describe('chained multiple times', () => {
      it('should return the last value', () => {
        const i = interceptor().onCall(0)(42).onCall(0)(43);

        i.intercept({ index: 0 }).getOrElse(false).should.equal(43);
      });
    });

    describe('mixed configurations', () => {
      it('should return the matching value', () => {
        const i = interceptor().onCall(0)(42).onCall(1)(43);

        i.intercept({ index: 1 }).getOrElse(false).should.equal(43);
      });
    });
  });

  describe('withArgs', () => {
    describe('matching all args', () => {
      it('should return the configured value', () => {
        const i = interceptor().withArgs(['a', 'b'])(42);

        i.intercept({ args: ['a', 'b'] }).getOrElse(false).should.equal(42);
      });
    });

    describe('chained multiple times', () => {
      it('should return the last value', () => {
        const i = interceptor()
          .withArgs(['a' ])(42)
          .withArgs(['a'])(43);

        i.intercept({ args: ['a'] }).getOrElse(false).should.equal(43);
      })
    });

    describe('match no arguments', () => {
      it('should not return the value for calls with arguments', () => {
        const i = interceptor().withArgs([])(42);

        i.intercept( { args: ['a'] }).getOrElse(false).should.be.false;
      });
    });

    describe('match some args', () => {
      it('should return the configured value', () => {
        const i = interceptor().withArgs(['a'])(42);

        i.intercept({ args: [ 'a', 'b' ] }).getOrElse(false).should.equal(42);
      });
    });

    describe('match some args out of order', () => {
      it('should not return the configured value', () => {
        const i = interceptor().withArgs(['a', 'b'])(42);

        i.intercept({ args: [ 'c', 'b' ] }).getOrElse(false).should.be.false;
      });
    });
  });
});
