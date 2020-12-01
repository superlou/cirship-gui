import { helper } from '@ember/component/helper';

export default helper(function fmtNum(params) {
  if (params[0] === undefined) {
    return '-';
  }

  let value = params[0];
  let decimals = params[1];
  return value.toFixed(decimals);
});
