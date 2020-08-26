export function round(number = 0, fractionDigits = 2) {
  const n = parseFloat(number) + 0.0000000001;
  const p = 10 ** fractionDigits;
  return Math.round(n * p) / p;
}

export function ceil(number, fractionDigits = 2) {
  return Math.ceil(number * (10 ** fractionDigits)) / (10 ** fractionDigits);
}

export function floor(number, fractionDigits = 2) {
  return Math.floor(number * (10 ** fractionDigits)) / (10 ** fractionDigits);
}

export function calc5yuan(number, mode = 1) {
  // 判断下过来的数据是否是5/10/15/20/25/30等不做处理
  if (number % 5 === 0) {
    return number;
  }
  let toInt = parseInt(number, 0);
  let lastInt = toInt % 10;
  if (mode === 1) {
    if (lastInt >= 8) {
      return parseInt((toInt + 10) / 10, 0) * 10;
    }
    if (lastInt >= 3) {
      return parseInt(toInt / 10, 0) * 10 + 5;
    }
    return parseInt(toInt / 10, 0) * 10;
  }
  if (mode === 2) {
    toInt = ceil(number, 0);
    lastInt = toInt % 10;
    if (lastInt > 5) {
      return parseInt((toInt + 10) / 10, 0) * 10;
    }
    return parseInt(toInt / 10, 0) * 10 + 5;
  }
  if (mode === 3) {
    if (lastInt >= 5) {
      return parseInt(toInt / 10, 0) * 10 + 5;
    }
    return parseInt(toInt / 10, 0) * 10;
  }
  return 0;
}
export function calc5jiao(number, mode = 1) { // 取到5角 mode 1: 四舍五入 2：收尾 3：去尾 4：不抹零
  if (number * 10 % 5 === 0) return number;
  let nFloat = parseFloat('0.' + (''+number).split('.')[1]);
  if (mode === 1) {
    if (nFloat < 0.8 && nFloat >= 0.3) {
      nFloat = 0.5;
    } else if (nFloat < 0.3) {
      nFloat = 0;
    } else {
      nFloat = 1;
    }
  } else if (mode === 2) {
    if (nFloat > 0.5) {
      nFloat = 1;
    } else {
      nFloat = 0.5;
    }
  } else if (mode === 3) {
    if (nFloat > 0.5) {
      nFloat = 0.5;
    } else {
      nFloat = 0;
    }
  }
  return nFloat + parseInt(number);
}

function calc(numA, numB) {
  const a = Number(numA);
  const b = Number(numB);
  if (a || b) {
    let ra;
    let rb;
    try {
      ra = a.toString().split('.')[1].length;
    } catch (e) {
      ra = 0;
    }
    try {
      rb = b.toString().split('.')[1].length;
    } catch (e) {
      rb = 0;
    }
    const r = 10 ** Math.max(ra, rb);
    return [a, b, r, ra, rb];
  }
  return [0, 0, 0, 0, 0];
}

export function multi(a, b) {
  const base = calc(a, b);
  if (base[2]) {
    return Number(base[0].toString().replace('.', '')) * Number(base[1].toString().replace('.', '')) / (10 ** (base[3] + base[4]));
  }
  return base[0] * base[1];
}

export function div(a, b) {
  if (b === 0 || b === '0') {
    return 0;
  }
  const base = calc(a, b);
  return Number(base[0].toString().replace('.', '')) / Number(base[1].toString().replace('.', '')) * (10 ** (base[4] - base[3]));
}


export function add(a, b) {
  const base = calc(a, b);
  if (base[3] === 0 && base[4] === 0) {
    return base[0] + base[1];
  }
  return div(multi(base[0], base[2]) + multi(base[1], base[2]), base[2]);
}

export function sub(a, b) {
  const base = calc(a, b);
  if (base[3] === 0 && base[4] === 0) {
    return base[0] - base[1];
  }
  return div(multi(base[0], base[2]) - multi(base[1], base[2]), base[2]);
}

export function zeroize(num) {
  const reg = /.*\..*/;
  return reg.test(num) ? `${num}` : `${num}.00`;
}
// 获取字节的长度
export function getByteLength(val) {
  const str = String(val);
  let bytesCount = 0;
  for (let i = 0; i < str.length; i += 1) {
    const uniCodeNum = str.charCodeAt(i);
    if (
      (uniCodeNum >= 0x0001 && uniCodeNum <= 0x007e)
      || (uniCodeNum >= 0xff60 && uniCodeNum <= 0xff9f)
    ) {
      bytesCount += 1;
    } else {
      bytesCount += 2;
    }
  }
  return bytesCount;
}
