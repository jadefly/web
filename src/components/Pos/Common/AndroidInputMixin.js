export default {
  methods: {
    showAndroidInput(obj, isSearch) {
      if (browser.isAndroid() || browser.isIPad()) {
        if (!isSearch && isSearch != null) {
          return;
        }
        const parmaArr = obj.split('.');
        this.$refs.AndroidInput.open({
          remark: parmaArr.length > 1 ? this[parmaArr[0]][parmaArr[1]] : this[obj],
        }, {
          // 回调
          submit: (data) => {
            if (parmaArr.length > 1) {
              this[parmaArr[0]][parmaArr[1]] = data;
            } else {
              this[obj] = data;
            }
          },
        });
      }
    },
  },
};
