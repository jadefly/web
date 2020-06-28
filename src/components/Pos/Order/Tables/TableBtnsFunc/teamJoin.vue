<template>
  <!-- 国际化：加入团队 -->
  <Dialog
    name="PosDialog.TeamJoin"
    :title="$t('Dict.Btn.TeamJoin')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    width="640px"
    height="412px"
    submitId="teamJoinSubmit"
  >
    <div class="pos-dialog-content pos-team-join-wrapper">
      <!-- 弹窗内容 -->
      <div class="team-list-wrapper">
        <!-- 国际化：选择要加入的团队 -->
        <h1>{{$t('Biz.Order.CheckTeamJoin')}}</h1>
        <div class="team-list">
          <ul id="teamList">
            <li v-for="(item, index) in teamList" :key="index"
            :class="{ active: selectedTeam === index }"
            @click="selectTeam(index, item)">{{ item.name }}</li>
          </ul>
        </div>
        <div class="pos-pager">
          <Pager :showInfo="true" pagerId="teamList"></Pager>
        </div>
      </div>
      <div class="team-info-wrapper">
        <!-- 国际化：已有客位：；数量：；位置： -->
        <ul  v-if="teamInfo">
          <li><strong>{{ teamInfo.name }}</strong><span> {{$t('Biz.Order.CheckedSeats')}}</span></li>
          <li><strong>{{$t('Dict.AmountLabel')}}</strong><span v-if="teamInfo">{{ teamInfo.team_num }}</span></li>
          <li><strong>{{$t('Biz.Order.Position')}}</strong><span>{{ teamInfo.pointNames }}</span></li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      teamList: [],
      selectedTeam: -1,
      teamInfo: '',
    };
  },
  methods: {
    // 页面初始化
    onOpen() {
      this.teamList = this.resData.teamAndNum;
      // 每次都重置清空已执行数据!!
      this.selectedTeam = -1;
      this.teamInfo = '';
    },

    selectTeam(index, item) {
      this.selectedTeam = index;
      this.teamInfo = item;
    },

    // 提交事件
    onSubmit() {
      if (!this.teamInfo) {
        this.$message.error(this.$t('Biz.Order.PleaseCheckToJoin'));
        return;
      }
      const params = {
        teamId: this.teamInfo.id,
        pointId: this.resData.pointId, // 是否是团队退单
        bsId: this.resData.bsId,
        loadmodule: 1,
        _t: (new Date()).getTime(),
      };
      ajax('canyin.pos.teammangeradd.addteam', {
        needToken: true,
        contentType: 'paramsEncoded',
        data: params,
      }).then(() => {
        this.submit(this.teamInfo.name);
        this.close();
        this.$message.success(this.$t('Biz.Order.JoinTeamSuccess', [this.teamInfo.name]));
      }).catch((errCode, msg) => {
        this.$message.error(msg);
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-team-join-wrapper {
  position: relative;
  .square(100%);
  .team-list-wrapper {
    position: relative;
    float: left;
    .size(60%, 100%);
    background-color: white;

    > h1 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 50px;
      line-height: 50px;
      padding-left: 16px;
      font-weight: 500;
    }

    .team-list {
      height: 100%;
      padding-top: 50px;
      padding-bottom: 52px;
      overflow: hidden;
      > ul {
        height: 85% !important;
        .clearfix();

        > li {
          float: left;
          .size(100px, 40px);
          line-height: 40px;
          margin-left: 16px;
          margin-top: 14px;
          border: 1px solid #ccc;
          border-radius: 4px;
          text-align: center;
          cursor: pointer;

          &.active {
            color: white;
            background-color: #0babb9;
          }
        }
      }
    }
  }

  .team-info-wrapper {
    float: left;
    .size(40%, 100%);
    padding: 20px;
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-team-join-wrapper {
  .pos-pager {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    text-align: right;
    > .pager-btn {
      background-color: white;
    }
    .pos-pager {
      padding-right: 18px;
      padding-bottom: 16px;
    }
  }
}
</style>
