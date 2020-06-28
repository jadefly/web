import Vue from 'vue';
import Vuex from 'vuex';
import Pos from './pos';
import KDS from './kds';
import order from './order';
import fastFood from './fastFood';

Vue.use(Vuex);

const debug = process.env.NODE_DEV !== 'production';

export default new Vuex.Store({
  modules: {
    pos: Pos,
    KDS,
    order,
    fastFood: {
      namespaced: true,
      ...fastFood,
    },
  },
  strict: debug,
});
