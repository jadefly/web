import * as Local from './local';
import * as TakeOut from './takeout';

const defaultMode = 'local';

const apis = {
  local: Local,
  takeout: TakeOut,
};

export default function API(module, params = [], mode = defaultMode) {
  return params.length ? apis[mode][module](...params) : apis[mode][module];
}
