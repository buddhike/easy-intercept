import ensure from 'easy-ensure';

export default function(target, name, fn) {
  ensure.nonEmptyString(name, 'name');
  ensure.func(fn, 'fn');

  if (target[name]) {
    throw new Error(`Member already exists - ${name}`);
  }

  target[name] = fn;
  return target;
}
