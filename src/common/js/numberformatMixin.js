import { prefixInteger } from './numberformat';

export default {
  filters: {
    prefixInteger(value, length) {
      return prefixInteger(value, length);
    },
  },
};
