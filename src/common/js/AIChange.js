export default class AIChange {
  constructor(num, length) {
    this.num = num;
    this.result = [];
    this.maxReturnLength = 8;
    if (length) {
      this.maxReturnLength = length;
    }
    this.init();
  }

  init() {
    const t = this.num.toString().split('.');
    const x = t[1] ? t[1].length : 0;
    this.calcAI(x);
    this.supplement();
    this.calcInt(
      parseInt(this.num.toString()[this.num.toString().length - 1], 0),
      10 ** x,
    );
  }

  calcAI(x) {
    if (this.result.length < this.maxReturnLength) {
      const a = parseInt(this.num / 100, 0) * 100;
      const y = 10 ** x;
      const b = parseInt((this.num - a) * y / 10, 0) * 10;
      const c = Math.ceil(this.num * y * (10 ** 0) / (10 ** 0)) % 10;
      if (c) {
        if (c < 5) {
          this.result.push(a + (b + 5) / y);
        }
        this.result.push(a + (b + 10) / y);
      }
      if (x) {
        this.calcAI(x - 1);
      }
    }
  }

  supplement() {
    if (this.result.length < this.maxReturnLength) {
      const money = [5, 10, 20, 50, 100];
      const last = this.result[this.result.length - 1] || this.num;
      const a = parseInt(last / 100, 0) * 100;
      const l = last % 100;
      let p = -1;
      for (let i = 0; i < money.length; i += 1) {
        if (l < money[i]) {
          p = i;
          break;
        }
      }
      if (p > 0) {
        for (let i = 0; i < money.length; i += 1) {
          if (money[i + p]) {
            this.result.push(a + money[i + p]);
          }
        }
      }
    }
  }

  calcInt(c, y) {
    const result = [];
    if (c && c > 5) {
      for (let i = 0; i < this.result.length; i += 1) {
        result.push(this.result[i] + (c % 5) / y);
        if (
          (parseInt(this.num, 0) * y).toString()[
            (parseInt(this.num, 0) * y).toString().length - 2
          ] && y === 1
        ) {
          result.push(this.result[i] + c / y);
        }
      }
    }
    if (
      (parseInt(this.num, 0) * y).toString()[
        (parseInt(this.num, 0) * y).toString().length - 2
      ]
      && c && c <= 5
    ) {
      for (let i = 1; i < this.result.length; i += 1) {
        result.push(this.result[i] + c / y);
      }
    }
    this.result = this.result.concat(result);
    this.result = this.result.sort((a, b) => a - b);
  }

  output() {
    return this.result;
  }
}
