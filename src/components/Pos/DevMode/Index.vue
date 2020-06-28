<template>
  <Dialog
    name="devMode"
    title="开发者模式"
    width="100%"
    height="100%"
    top="0"
    ref="dialog"
  >
    <div class="devmode-wrap">
      <el-tabs v-model="activeName">
        <el-tab-pane label="Vuex" name="vuex">
          <div class="devmode-search">搜索</div>
          <div class="devmode-items">
            <div class="devmode-item" v-for="item in result" :key="item.vuex">
              <dl>
                <dt><strong>数据：</strong><span>{{ item.vuex }}</span></dt>
                <dd><strong>接口：</strong><span>{{ item.url }}</span></dd>
              </dl>
              <el-table
                :data="item.data"
              >
                <el-table-column
                  prop="text"
                  label="设置"
                ></el-table-column>
                <el-table-column
                  prop="key"
                  label="Key"
                ></el-table-column>
                <el-table-column label="值类型" >
                  <template slot-scope="scope">
                    {{ scope.row.type.name }}
                  </template>
                </el-table-column>
                <el-table-column label="值">
                  <template slot-scope="scope">
                    <template v-if="scope.row.type.name === 'Boolean'">
                      <el-switch
                        :value="getVal(item.vuex, scope.row.key)"
                        active-text="是"
                        inactive-text="否"
                      ></el-switch>
                    </template>
                    <template v-else-if="scope.row.type.name === 'Array'">
                      <template v-if="scope.row.columns">
                        <el-popover trigger="click">
                          <el-table :data="getVal(item.vuex, scope.row.key)">
                            <el-table-column
                              v-for="col in scope.row.columns"
                              :key="col.key"
                              :prop="col.key"
                              :label="col.text"
                              :width="col.width"
                            ></el-table-column>
                          </el-table>
                          <el-button type="primary" slot="reference">查看数据</el-button>
                        </el-popover>
                      </template>
                      <template v-else>
                        {{ getVal(item.vuex, scope.row.key).join(', ') }}
                      </template>
                    </template>
                    <template v-else>
                      {{ getVal(item.vuex, scope.row.key) }}
                    </template>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="i18n" name="i18n">
          <el-table :data="alli18n" class="select-all">
            <el-table-column prop="key" label="KEY"></el-table-column>
            <el-table-column prop="zh" label="zh"></el-table-column>
            <el-table-column prop="en" label="en"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  values, each, map, get,
} from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import datas from './datas';
import i18n from '@/locales/index';

export default {
  name: 'devMode',
  data() {
    return {
      activeName: 'vuex',
    };
  },
  components: { Dialog },
  mixins: [DialogMixin],
  computed: {
    ...mapGetters([
      'posInfo',
      'setting',
      'posBooking',
      'posTakeout',
      'posDevice',
      'outDeviceSetting',
    ]),
    result() {
      return values(datas);
    },
    mainLang() {
      if (process.env.NODE_ENV === 'development') {
        return [];
        // return this.platI18n(i18n.messages.zh);
      }
      return [];
    },
    alli18n() {
      return map(this.mainLang, item => ({
        key: item.key,
        zh: item.value,
        en: this.getLang('en', item.key),
      }));
    },
  },
  methods: {
    getVal(vuex, key) {
      return this[vuex][key];
    },
    getLang(lang, key) {
      return get(i18n.messages, lang + key);
    },
    platI18n(json, pk = '') {
      const result = [];
      each(json, (value, key) => {
        const keys = (pk ? `${pk}.` : '') + key;
        if (typeof value === 'string') {
          result.push({ key: keys, value });
        } else {
          result.push(...this.platI18n(value, keys));
        }
      });
      return result;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.select-all {
  .user-select(all);
}
</style>
