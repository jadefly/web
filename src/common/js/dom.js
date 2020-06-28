import $ from 'jquery';
import { delay } from 'lodash';

export function excluded(target, query, callback) {
  if (!$(target).is(query) && !$(target).parents(query).length) {
    if (callback) {
      callback();
    }
  }
}

export function getClientSize() {
  return {
    width: document.documentElement.clientWidth || document.body.clientWidth,
    height: document.documentElement.clientHeight || document.body.clientHeight,
  };
}

export function selectInput(dom) {
  $(dom).one('blur click', (event) => {
    delay(() => {
      $(event.target).data('selected', false);
    }, 200);
  }).focus();
  delay(() => {
    $(dom).data('selected', true);
    dom.select();
  }, 300);
}
