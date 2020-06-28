import { each, includes } from 'lodash';

const VueEvent = {};

VueEvent.install = (Vue) => {
  const events = {};
  const fixEventName = [];
  const VueSelf = Vue;
  VueSelf.prototype.$von = (eventName, handler, isFixed) => {
    if (isFixed) {
      fixEventName.push(eventName);
    }
    if (events[eventName]) {
      events[eventName].push(handler);
    } else {
      events[eventName] = [handler];
    }
  };

  VueSelf.prototype.$vonce = (eventName, handler, isFixed) => {
    if (isFixed) {
      fixEventName.push(eventName);
    }
    events[eventName] = [handler];
  };

  VueSelf.prototype.$vemit = (...arg) => {
    const eventName = arg[0];
    arg.shift();
    if (events[eventName]) {
      each(events[eventName], (it) => {
        it(...arg);
      });
    }
  };

  VueSelf.prototype.$vclean = () => {
    each(events, (handler, eventName) => {
      if (!includes(fixEventName, eventName)) {
        delete events[eventName];
      }
    });
  };
};

export default VueEvent;
