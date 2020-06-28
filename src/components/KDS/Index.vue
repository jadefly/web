<template>
  <div class="kds">
    <ul>
      <li v-for="item in posList" :key="item.id">
        <button type="button" class="btn" @click="signIn(item)">
          <strong>{{ getKitchenModeText(item.kitchenMode) }}</strong>
          <span>{{ item.posName }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { includes } from 'lodash';
import ajax from '@/common/js/ajax';
import {
  COOK_BY_ORDER, SERVE_BY_ORDER, PACKAGE_BY_ORDER, LOGIN_MODE_MAP,
} from '../../store/order/orderConfig';

export default {
  name: 'kds',
  data() {
    return {
      posList: [],
    };
  },
  mounted() {
    ajax('canyin.kitchen.kitchenopening.getkitchenposinfo', {
      contentType: 'json',
    }).then((data) => {
      this.posList = data;
    });
  },
  methods: {
    /**
     * 获取Pos类型文字说明
     * @param { String } mode Pos类型
     * 0: 标准配菜 1: 标准传菜
     * 2: 计件配菜 3: 按单传菜 4: 备餐模式
     * 此处调用getKitchenModeText(item.kitchenMode)参数用到的是kitchenMode
     * 此处的kitchenMode实际是loginMode
     */
    getKitchenModeText(mode) {
      switch (mode) {
        case '0': return '标准配菜';
        case '1': return '标准传菜';
        case '2': return '计件配菜';
        case LOGIN_MODE_MAP[COOK_BY_ORDER].toString():
          return '按单配菜';
        case LOGIN_MODE_MAP[SERVE_BY_ORDER].toString():
          return '按单传菜';
        case LOGIN_MODE_MAP[PACKAGE_BY_ORDER].toString():
          return '按单外卖';
        case '4': return '备餐模式';
        default: return '未知模式';
      }
    },
    signIn(pos) {
      let filterId = '';
      if (pos.kitchenItemFilterId) {
        filterId = `/filterid/${pos.kitchenItemFilterId}`;
      }
      if (
        includes(
          [
            LOGIN_MODE_MAP[COOK_BY_ORDER],
            LOGIN_MODE_MAP[SERVE_BY_ORDER],
            LOGIN_MODE_MAP[PACKAGE_BY_ORDER],
          ],
          parseInt(pos.kitchenMode, 10),
        )
      ) {
        this.$router.push(`/kds/fastfood/loginMode/${pos.kitchenMode}/posid/${pos.posId}${filterId}`);
      } else {
        this.$router.push(`/kds/fastfood/posid/${pos.posId}${filterId}`);
      }
    },
  },
};
</script>
