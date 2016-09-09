import R from 'ramda';
import constants from './constants';

const matchArgs = R.curry((a, b) => {
  if (R.isEmpty(a) && R.isEmpty(b)) return true;

  const left = R.head(a);
  const right = R.head(b);

  const matchRest = () => {
    const restA = R.tail(a);

    return R.isEmpty(restA) ? true : matchArgs(restA, R.tail(b));
  };

  return left === right || left === constants.placeholder ?
    matchRest() : false;
});

export default matchArgs;
