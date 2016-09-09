import proxy from '../lib/proxy';

function Foo() {
  this.state = 42;
}

Foo.prototype.bar = function() {
  return this.state;
};

describe('prototype functions', () => {
  it('should see the state of current instance', done => {
    const foo = new Foo();
    const f = function() {
      return foo.bar();
    };

    f.prototype = foo;

    setTimeout(() => {
      f().should.equal(42);
      done();
    }, 0)

  });
});

describe('proxy', () => {
  describe('to a function', () => {
    let proxyFunction;

    beforeEach(() => {
      proxyFunction = proxy(() => 42);
    });

    it('should invoke that function', () => {
      proxyFunction().should.equal(42);
    });
  });

  describe('to a function with args', () => {
    let target;

    beforeEach(() => {
      target = proxy(a => a);
    });

    it('should pipe the args', () => {
      target(42).should.equal(42);
    });

    describe('with specific return value for input', () => {
      beforeEach(() => {
        target.withArgs(42).returns(43);
      });

      it('should return the configured value for matching input', () => {
        target(42).should.equal(43);
      });
    });
  });

  describe('configure value on call', () => {
    let proxyFunction;

    beforeEach(() => {
      proxyFunction = proxy(() => 42);
      proxyFunction.onCall(0).returns(1);
    });

    it('should return the configured value for that call', () => {
      proxyFunction().should.equal(1);
    });
  });

  describe('configure a return value', () => {
    let proxyFunction;

    beforeEach(() => {
      proxyFunction = proxy(() => 42);
      proxyFunction.returns(43);
    });

    it('should return the configured value', () => {
      proxyFunction().should.equal(43);
    });

    describe('with a specific call configuration', () => {
      beforeEach(() => {
        proxyFunction.onCall(0).returns(44);
      });

      it('should return call specific value for that call', () => {
        proxyFunction().should.equal(44);
      });

      it('should return the default value of all other calls', () => {
        proxyFunction();
        proxyFunction().should.equal(43);
      });
    });
  });

  describe('call', () => {
    let proxyFunction;

    beforeEach(() => {
      proxyFunction = proxy(() => 42);
    });

    it('should provide access to arguments', () => {
      proxyFunction('a');
      proxyFunction('b');
      proxyFunction.call(0).args[0].should.equal('a');
      proxyFunction.call(1).args[0].should.equal('b');
    });

    it('should return undefined for invalid calls', () => {
      (proxyFunction.call(0) || false).should.be.false;
    });
  });

  describe('received', () => {
    let proxyFunction;

    beforeEach(() => {
      proxyFunction = proxy(() => 42);
      proxyFunction('a');
    });

    it('should return matching calls', () => {
      proxyFunction.received('a')[0].args[0].should.equal('a');
    });

    it('should return false for non-matching calls', () => {
      proxyFunction.received('b').should.be.false;
    });
  });

  describe('receivedAny', () => {
    let proxyFunction;

    beforeEach(() => {
      proxyFunction = proxy(() => 42);
      proxyFunction('a');
    });

    it('should return true for matching calls', () => {
      proxyFunction.receivedAny('a').should.be.true;
    });

    it('should return fals for non-matching calls', () => {
      proxyFunction.receivedAny('b').should.be.false;
    });
  });
});
