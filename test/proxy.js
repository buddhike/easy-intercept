import R from 'ramda';
import proxy from '../lib/proxy';

describe('Proxy to a function', () => {
  it('should invoke that function', () => {
    const f = proxy(() => 42);
    f().should.equal(42);
  });
});

describe('Proxy to a function with args', () => {
  it('should pipe the args', () => {
    const f = proxy(a => a);
    f(42).should.equal(42);
  });
});

describe('Proxy that returns specific value for matching input', () => {
  let f;

  beforeEach(() => {
    f = proxy(a => a).withArgs(42).returns(43);
  })

  it('should return the configured value for matching input', () => {
    f(42).should.equal(43);
  });

  it('should return the original value for rest', () => {
    f(1).should.equal(1);
  });
});

describe('Proxy that throws an error for specific args', () => {
  let target;

  beforeEach(() => {
    target = proxy(a => a);
    target.withArgs(42).throws(new Error('doh'));
  });

  it('should throw specified error for that call', () => {
    (() => target(42)).should.throw(/doh/);
  });

  it('should not throw an error for other calls', () => {
    target(1).should.equal(1);
  });
});

describe('Proxy that returns a specific value on specific call', () => {
  let target;

  beforeEach(() => {
    target = proxy(() => 42);
    target.onCall(0).returns(1);
  });

  it('should return the configured value for that call', () => {
    target().should.equal(1);
  });

  it('should return original value for rest', () => {
    target();
    target().should.equal(42);
  });
});

describe('Proxy that throws on specific call', () => {
  let target;

  beforeEach(() => {
    target = proxy(a => a);
    target.onCall(0).throws(new Error('doh'));
  });

  it('should throw specified error for that call', () => {
    (() => target()).should.throw(/doh/);
  });

  it('should not throw an error for other calls', () => {
    const firstCall = R.tryCatch(target, R.F);

    firstCall();
    target(1).should.equal(1);
  });
});

describe('Proxy with a specific return value', () => {
  let target;

  beforeEach(() => {
    target = proxy(() => 42);
    target.returns(43);
  });

  it('should return the configured value', () => {
    target().should.equal(43);
  });

  describe('and a specific return value on specific call', () => {
    beforeEach(() => {
      target.onCall(0).returns(44);
    });

    it('should return the configured value for matching call', () => {
      target().should.equal(44);
    });

    it('should return the original value for rest', () => {
      target();
      target().should.equal(43);
    });
  });

  describe('and a specific return value for matching input', () => {
    beforeEach(() => {
      target.withArgs(0).returns(44);
    });

    it('should return the configured value for matching call', () => {
      target(0).should.equal(44);
    });

    it('should return the original value for rest', () => {
      target(1).should.equal(43);
    });
  });
});

describe('Accessing call information', () => {
  let target;

  beforeEach(() => {
    target = proxy(() => 42);
    target('a');
    target('b');
  });

  it('should return arguments used for specified invocation', () => {
    target.call(0).args[0].should.equal('a');
    target.call(1).args[0].should.equal('b');
  });

  it('should return undefined for invalid calls', () => {
    (target.call(2) || false).should.be.false;
  });
});

describe('Verifying a received call', () => {
  let target;

  beforeEach(() => {
    target = proxy(() => 42);
    target('a');
  });

  it('should return matching calls', () => {
    target.received('a')[0].args[0].should.equal('a');
  });

  it('should return false for non-matching calls', () => {
    target.received('b').should.be.false;
  });

  describe('for multiple invocations', () => {
    it('should return all matching calls', () => {
      target('a');
      target.received('a').length.should.equal(2);
    });
  });
});

describe('receivedAny', () => {
  let target;

  beforeEach(() => {
    target = proxy(() => 42);
    target('a');
  });

  it('should return true for matching calls', () => {
    target.receivedAny('a').should.be.true;
  });

  it('should return false for non-matching calls', () => {
    target.receivedAny('b').should.be.false;
  });
});

describe('quick calls', () => {
  let target;

  beforeEach(() => {
    target = proxy(() => 42);
    target('a');
    target('b');
    target('c');
  });

  it('should include the first call', () => {
    target.firstCall().args[0].should.equal('a');
  });

  it('should include the second call', () => {
    target.secondCall().args[0].should.equal('b');
  });

  it('should include the third call', () => {
    target.thirdCall().args[0].should.equal('c');
  });
});

describe('throws', () => {
  let target;

  beforeEach(() => {
    target = proxy(() => 42);
    target.throws(new Error('doh'));
  });

  it('should throw the specified error', () => {
    (() => target()).should.throw(/doh/);
  });
});

describe('with an alternative implementation', () => {
  it('should receive arguments', () => {
    const target = proxy(() => 42);
    target.onCall(0).returns(a => a);
    target(43).should.equal(43);
  });

  it('should provide call info as the last argument', () => {
    const target = proxy(() => 42);

    target.onCall(0).returns((input, call) => {
      input.should.equal('a');
      call.count.should.equal(1);
    });

    target('a');
  });

  describe('for specific call', () => {
    let target;

    beforeEach(() => {
      target = proxy(() => 42);
      target.onCall(0).returns(() => 43);
    });

    it('should invoke the alternative impl for matching call', () => {
      target().should.equal(43);
    });

    it('should not invoke the alternative impl for other calls', () => {
      target();
      target().should.equal(42);
    });
  });

  describe('for call with specific args', () => {
    let target;

    beforeEach(() => {
      target = proxy(() => 42);
      target.withArgs('a').returns(() => 43);
    });

    it('should invoke the alternative impl for matching calls', () => {
      target('a').should.equal(43);
    });

    it('should not invoke the alternative impl for other calls', () => {
      target('b').should.equal(42);
    });
  });

  describe('accessing this from an arrow function', () => {
    function Foo() {
      this._state = 0;

      this.inc = () => {
        return this._state++;
      };

      this.invokeProxy = () => {
        const p = proxy(() => this.inc() );
        return p();
      }
    }

    it('should provide the correct reference', () => {
      const f = new Foo();
      f.invokeProxy();
      f.invokeProxy().should.equal(1);
    });
  });
});
