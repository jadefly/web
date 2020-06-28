<template>
  <Dialog
      name="PosDialog.SelectCardNum"
      :title="$t('Biz.Pos.Member.SelectCardNumTitle1')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :hotkeys="ration"
      :append-to-body="true"
      :showSubmit="true"
      width="500px"
      height="300px"
      top="20vh"
    >
    <div class="selectCardNum">
      <div class="w100">
        <div
          class="cardNum"
          :class="activeCard == index ? 'active' : ''"
          v-for="(item, index) in cardList"
          :key="index"
          @click="selectedCard(item, index)"
        >
        {{item.hardCardNumber ? item.hardCardNumber : item.memberCardTypeName}}
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters } from 'vuex';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      cardInfo: '', // 选择的卡数据
      cardList: [], // 卡列表
      activeCard: 0,
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    // 添加快捷键
    ration() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.cardInfo = '';
      this.activeCard = 0;
      this.cardList = this.resData.cardList;
    },
    onClose() {
      this.cardInfo = '';
    },
    onSubmit() {
      this.submit(this.cardList[this.activeCard]);
      this.close();
    },
    selectedCard(item, index) {
      this.activeCard = index;
    },
  },
};
</script>

<style lang="less" scoped>
  .selectCardNum{
    height: 100%;
    background: #fff;
    overflow: auto;
    padding-top: 15px;
    .w100{
      width: 100%;
    }
    .cardNum{
      width: 46%;
      text-align: center;
      height: 60px;
      line-height: 60px;
      margin: 0 2%;
      margin-bottom: 15px;
      display: inline-block;
      border: 1px solid #ddd;
      cursor: pointer;
      font-weight: bold;
      border-radius: 5px;
    }
    .active{
      background-color: #0096a4;
      border-color: #0096a4;
      color: #fff;
    }
  }
</style>
