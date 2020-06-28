export default class ScreenSaver {
  constructor(callback, timeout) {
    this.eventList = ['mousemove', 'mousedown', 'keydown', 'keypress'];
    this.timer = null;
    this.timeout = timeout;
    this.callback = callback;
    this.stop();
    this.start();
    this.bindEvent();
  }

  bindEvent() {
    this.eventList.forEach((event) => {
      document.addEventListener(event, this.onEvent.bind(this));
    });
  }

  removeEvent() {
    this.eventList.forEach((event) => {
      document.removeEventListener(event, this.onEvent.bind(this));
    });
  }

  start() {
    this.timer = setTimeout(() => {
      if (this.callback) {
        this.callback();
      }
    }, this.timeout);
  }

  onEvent() {
    this.stop();
    this.start();
  }

  stop() {
    clearTimeout(this.timer);
  }

  clear() {
    this.stop();
    this.removeEvent();
    this.callback = null;
  }
}
