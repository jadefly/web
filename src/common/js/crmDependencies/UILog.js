import dateFormat from '../dateformat';

export default class UILog {
  constructor() {
    this.uiLogMessage = [];
    this.init();
  }

  init() {
    setInterval(() => {
      if (this.uiLogMessage.length) {
        this.submit();
      }
    }, 60000);
  }

  push(type, msg) {
    this.uiLogMessage.push({
      level: type,
      message: `【${dateFormat('%Y-%M-%D %H:%I:%S.%x')}】${msg}`,
    });
    this.preSubmit();
  }

  preSubmit() {
    if (this.uiLogMessage.length >= 10) {
      this.submit();
    }
  }

  debug(msg) {
    this.push('debug', msg);
  }

  warn(msg) {
    this.push('warn', msg);
  }

  info(msg) {
    this.push('info', msg);
  }

  error(msg) {
    this.push('error', msg);
  }

  submit() {
    // eslint-disable-next-line no-undef
    log4web.log(JSON.stringify(this.uiLogMessage));
    this.uiLogMessage = [];
  }
}
