import Vue from 'vue'

import Input from './components/input.vue'

let elementInput= {}
elementInput.install = (Vue) => {
  Vue.component(Input.name, Input)
}

export default elementInput
