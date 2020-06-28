import { extend } from 'lodash';

export default class WS {
  static wss = [];

  constructor(url, settings) {
    this.PING = 'ping';
    this.PONG = 'pong';
    this.lastHealth = -1;
    this.retryCount = 0;
    this.healthTimer = null;
    this.ws = null;
    this.sessionId = null;
    this.url = url;
    this.connectState = false; // 连接状态
    const defaults = {
      dataType: 'json',
      enableHealth: true,
      healthInterval: 15000,
      healthTimeout: 30000,
      enableRetry: true,
      retryMax: 0,
      debugMode: false,
      doStatus: null,
      open: null,
      close: null,
      error: null,
      retry: null,
      message: null,
      protocal: null,
      state: 'closed',

    };
    this.options = extend(defaults, settings);
    this.connect();
  }

  connect() {
    if (this.options.doStatus) {
      this.options.doStatus('connect');
    }
    if (this.options.protocal) {
      this.ws = new WebSocket(this.url, this.options.protocal);
    } else {
      this.ws = new WebSocket(this.url);
    }
    this.events();
    this.retryCount += 1;
    this.constructor.wss.push(this);
  }

  events() {
    this.ws.onopen = (event) => {
      this.state = 'open';
      if (this.options.doStatus) {
        this.options.doStatus('open');
      }
      if (this.options.open) {
        this.options.open(event);
      }
      this.log('connect to server.');
      if (this.options.enableHealth) {
        clearInterval(this.healthTimer);
        this.lastHealth = -1;
        this.healthTimer = setInterval(() => {
          this.keepalive();
        }, this.options.healthInterval);
      }
    };
    this.ws.onclose = (event) => {
      this.state = 'closed';
      if (this.options.doStatus) {
        this.options.doStatus('close');
      }
      if (this.options.close) {
        this.options.close(event);
      }
      this.log('disconnect to server.');
      if (!this.options.enableRetry) {
        clearInterval(this.healthTimer);
      }
    };
    this.ws.onerror = (event) => {
      this.state = 'error';
      if (this.options.doStatus) {
        this.options.doStatus('error');
      }
      if (this.options.error) {
        this.options.error(event);
      }
      this.log('error to server.');
      if (!this.options.enableRetry) {
        clearInterval(this.healthTimer);
      }
    };
    this.ws.onmessage = (event) => {
      if (this.options.doStatus) {
        this.options.doStatus('message');
      }
      if (event == null) {
        this.log('empty message');
      } else if (event.data === this.PONG) {
        this.log('PONG form server.');
        this.lastHealth = (new Date()).getTime();
      } else if (this.options.message) {
        switch (this.options.dataType) {
          case 'json':
            try {
              this.options.message(JSON.parse(event.data));
            } catch (error) {
              this.options.message({});
            }
            break;
          case 'event':
            this.options.message(event);
            break;
          default:
            this.options.message(event.data);
            break;
        }
      }
    };
  }

  log(msg) {
    if (this.options.debugMode) {
      window.console.debug(msg);
    }
  }

  keepalive() {
    if (
      this.lastHealth !== -1
      && (new Date()).getTime() - this.lastHealth > this.options.healthTimeout
    ) {
    // if (true) {
      this.log('WebSocket keepalive timeout.');
      this.ws.close();
      this.connectState = false;
      if (
        this.options.enableRetry
        && (
          this.options.retryMax === 0
          || this.retryCount < this.options.retryMax
        )
      ) {
        this.log('retry connecting to server...');
        if (this.options.retry) {
          this.options.retry();
        } else {
          this.connect();
        }
      }
    } else if (this.ws.bufferedAmount === 0) {
      this.log('ping to server.');
      try {
        this.ws.send(this.PING);
        this.connectState = true;
      } catch (e) {
        this.connectState = false;
        this.log(`WebSocket keepalive exception: ${e.message}`);
      }
    }
  }

  send(message) {
    this.ws.send(message);
  }

  close() {
    if (this.options.enableHealth) {
      clearInterval(this.healthTimer);
    }
    this.ws.close();
  }
}
