import Vue from 'vue'

import InputNumber from './components/input-number.vue'

let elementHotfix = {}
elementHotfix.install = (Vue) => {
  Vue.component(InputNumber.name, InputNumber)
}

export default elementHotfix
