export default {
  methods: {
    printerData(data) {
      if (data.result === 1) {
        if (data.printType === 'PRINT_PARALLEL' && data.printD) {
          this.$devices.Printer.print(data.printD);
        }
      } else {
        this.$message.error(data.msg);
      }
    },
  },
};
