import * as dateTools from './dateformat';


export default {
  filters: {
    dateFormat(value, format) {
      if (value) {
        return dateTools.default(format, value);
      }
      return '';
    },
    timeFormat(value, format) {
      if (value) {
        return dateTools.timeFormat(format, value);
      }
      return '';
    },
    tDateFormat(value, format) {
      if (value) {
        const date = new Date(value.replace('T', ' '));
        return dateTools.default(format, date);
      }
      return '';
    },
  },
};
