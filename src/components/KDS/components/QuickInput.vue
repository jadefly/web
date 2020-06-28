<template>
  <div></div>
</template>

<script>
export default {
  props: {
    callback: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      startFlag: false,
      startTime: 0,
      endTime: 0,
      timeout: 500,
      str: [],
    };
  },
  created() {
    /* eslint-disable object-property-newline */
    const KeyCodeMap = {
      48: '0', 49: '1', 50: '2', 51: '3', 52: '4',
      53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
      65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e',
      70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j',
      75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o',
      80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't',
      85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y',
      90: 'z', 96: '0', 97: '1', 98: '2', 99: '3',
      100: '4', 101: '5', 102: '6', 103: '7', 104: '8',
      105: '9',
    };

    window.addEventListener('keydown', (event) => {
      if (!this.startFlag) {
        this.startFlag = true;
        this.startTime = parseInt(event.timeStamp, 10);
        setTimeout(() => {
          this.startTime = 0;
          this.str = [];
        }, this.timeout);
      }
      if (event.keyCode === 13) {
        this.endTime = parseInt(event.timeStamp, 10);
        if (this.endTime - this.startTime < this.timeout && this.str.length) {
          this.callback(this.str.join(''));
        }
        this.startFlag = false;
        this.startTime = 0;
        this.endTime = 0;
        this.str = [];
      } else {
        this.str.push(KeyCodeMap[event.keyCode]);
      }
    }, false);
  },
};
</script>
