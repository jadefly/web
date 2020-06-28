import i18n from '@/locales/index';
import ajax from '@/common/js/ajax';

export default {
  methods: {
    // 打印结账单
    printSettleBill(data) {
      ajax(data.url, {
        contentType: 'paramsEncoded',
        needToken: true,
        data: data.params,
      }).then((res) => {
        // printType PRINT_PARALLEL 打印类型是并口的执行 进行打印业务
        if (res.data.printType === 'PRINT_PARALLEL' && res.data.printD) {
          this.$devices.Printer.print(res.data.printD);
        }
      }).catch((error) => {
        this.$message.error(i18n.t('Dict.Abnormal', [error]));
      });
    },
  },
};
