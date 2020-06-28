import { trim, map, filter } from 'lodash';

class QuickSearch {
  constructor() {
    this.searchText = '';
    this.searchArr = [];
    this.result = [];
  }

  input(searchText) {
    const text = trim(searchText);
    if (text !== '') {
      this.result = [];
      this.searchText = text;
      this.searchArr = this.searchText.match(/\(\w+\)|[\w\d]+?/gi);
      this.format();
      this.do(0);
      return map(filter(this.result, item => item), item => item.join(''));
    }
    return [];
  }

  format() {
    this.searchArr = map(this.searchArr, item => item.replace(/\((\w+)\)/, '$1').split(''));
  }

  do(index, it) {
    if (index >= this.searchArr.length) {
      this.result.push(it);
      return;
    }
    const a = this.searchArr[index];
    if (!it) {
      it = [];
    }
    for (let i = 0; i < a.length; i++) {
      const re = it.slice(0, it.length);
      re.push(a[i]);
      this.do(index + 1, re);
    }
  }
}

const q = new QuickSearch();

export default function quickSearch(s) {
  return q.input(s);
}
