import { get } from 'lodash';
import canyin from './canyin';
import dbi from './dbi';
import platform from './platform';

const apis = {
  canyin,
  dbi,
  platform,
};

export default function logic(api) {
  return get(apis, api);
}
