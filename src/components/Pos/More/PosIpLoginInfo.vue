<template>
  <Dialog
    name="PosDialog.posIpLoginInfo"
    :title="$t('Dict.TerminalIP')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :closeByClickModel="false"
    width="400px"
    height="516px"
    top="10vh"
  >
    <div class="body">
      <div class="table-main">
        <div class="table-head">
          <table>
            <tr>
              <th width="15%">{{$t('Dict.SerialNumber')}}</th>
              <th width="40%">IP</th>
              <th width="15%">{{$t('Biz.Pos.More.PosIpLoginInfoTh2')}}</th>
              <th width="30%">{{$t('Dict.Operation')}}</th>
            </tr>
          </table>
        </div>
        <div class="table-body">
          <ul id="ipList">
            <li v-for="(item, index) in ipList" :key="index">
              <span style="width: 15%">{{index + 1}}</span>
              <span style="width: 40%">{{item.loginIp}}</span>
              <span style="width: 15%">{{item.point}}</span>
              <span style="width: 30%">
                <button
                  type="button"
                  class="btn btn-danger btn-sm" @click="kickout(item.loginIp)"
                >{{$t('Biz.Pos.More.PosIpLoginInfoBtn1')}}</button>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="pos-pager">
        <Pager
          pagerId="ipList"
          :showInfo = "true"
          arrowDirection="up-down"
          v-if="ipList.length > 0"
          ref="pager">
        </Pager>
      </div>
    </div>
  </Dialog>
</template>
<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';

export default {
  name: 'posIpLoginInfo',
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      ipList: [],
    };
  },
  methods: {
    async onOpen() {
      this.$nextTick(async () => {
        const data = await ajax('canyin.sys.ip.getloginiplist');
        this.ipList = data.root;
        // this.$refs.pager.refresh();
      });
    },
    kickout(ip) {
      ajax('canyin.sys.ip.kickout', {
        params: { ip },
      }).then(() => {
        this.$message.success(this.$t('Dict.OperationSucceeded'));
        this.onOpen();
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.body {
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
  .table-main {
    padding: 1rem 1rem 0;
    .table-head {
      padding: 4px 0;
      background-color: #7bcad6;
      color: #fff;
      table {
        width: 100%;
        tr {
          width: 100%;
          th {
            font-weight: normal;
            border-right: 1px solid #fff;
            padding-left: 1rem;
          }
          th:last-child {
            border: none;
          }
        }
      }
    }
    .table-body {
      ul {
        width: 100%;
        height: 360px;
        overflow: scroll;
        li {
          border-bottom: 1px solid #000;
          width: 100%;
          overflow: hidden;
          span {
            padding: 1rem;
            line-height: 30px;
            display: block;
            float: left;
          }
        }
      }
    }
  }
  > .pos-pager {
    width: 100%;
    border-top: 1px solid #000;
    padding: 1rem;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    background-color: #fff;
    > .pos-pager {
      float: right;
      margin-right: 2rem;
    }
  }
}
</style>
