<template>
  <div class="home">
    <my-menu>
      <!-- 1).先循环一次 -->
      <template v-for="menu in menuData">
        <!-- 2.将有可能重复的项 再次循环 -->
        <resub v-if="menu.children" :key="menu.id" :data="menu"></resub>
        <menu-item v-else :key="menu.id">{{menu.name}}</menu-item>
      </template>
    </my-menu>

    <div class="right">
      <section class="showhideBox">
        <div class="box"
        v-for="(item,index) in list" :key="index"
        v-clickoutside:[{isOpen:item.isOpen,index}]="handleClose">
          <button @click="showHideFn(item)">{{item.name}}</button>
          <ul class="list" v-if="item.isOpen" v-show="item.isShow">
            <li>111</li>
            <li>222</li>
            <li>333</li>
          </ul>
        </div>
        
        <div class="box" v-clickoutside="handleClose2">
          <button @click="showHideFn2">单个显示隐藏</button>
          <ul class="list" v-show="listShow">
            <li>111</li>
            <li>222</li>
            <li>333</li>
          </ul>
        </div>
      </section>
      
      <section class="rowBox">
        {{ numVal }}
        <numberAddDel
          :inputNum="editData.num"
          :limitMin="editData.minAddQty"
          :limitMax="editData.maxAddQty?editData.maxAddQty:Number.MAX_VALUE"
          :showToast="true"
          :decimalDigit="3"
          :setTimeoutNum="1800"
          :numAllowZero="false"
          @changeLimit="changeLimit">
        </numberAddDel>
      </section>

      <section class="rowBox">
        <PagerSlot class="buffetBox"
          :style="{height: fanyeData.length>pageSize?'190px':'auto'}"
          type="scroll"
          :listAll="fanyeData" :pageSize="pageSize" :paginationShow="paginationShow" :paginationBtnShow="fanyeData.length>pageSize">
            <template slot="list" slot-scope="scope">
              <li v-for="(item, index) in scope.showList" :key="item.id">
                <button>{{index}}. {{item.name}}</button>
              </li>
            </template>
          </PagerSlot>
      </section>
    </div>

  </div>
</template>

<script>
import myMenu from '@/components/menu/menu'
import menuItem from '@/components/menu/menuItem'
import resub from '@/components/menu/Resub'

import numberAddDel from '@/components/common/numberAddDel'

const PagerSlot = () => import('@/components/common/PagerSlot');
export default {
  name: 'home',
  components: {
    myMenu,
    menuItem,
    resub,
    numberAddDel,
    PagerSlot, // 翻页组件
  },
  data() {
    return {
      menuData: [{
          name: '导航一',
          id: 1,
          children: [{
              name: "导航1.1",
              id: 1.1,
              children: [{
                name: '导航1.1.1',
                id: '1.1.1'
              }]
            },
            {
              name: "导航1.2",
              id: 1.2
            },
            {
              name: "导航1.3",
              id: 1.3
            },
          ]
        },
        {
          name: "导航二",
          id: 2
        },
        {
          name: "导航三",
          id: 3
        },
      ],
      listShow: false,
      a: { b:'aaaaaa'},
      name0: false,
      name1: false,
      name2: false,
      list: [
        { name:'name0', isOpen: true, isShow:false },
        { name:'name1', isOpen: true, isShow:false },
        { name:'name2', isOpen: false, isShow:false },
      ],
      editData: {
        num: 1,
        minAddQty: 1,
      },
      numVal: 0,

      fanyeData:[
        { num:1, id: '01', name: 'test1'},
        { num:2, id: '02', name: 'test2'},
        { num:3, id: '03', name: 'test3'},
        { num:4, id: '04', name: 'test4'},
      ],
      pageSize: 3,
      paginationShow: true,
    }
  },
  mounted() {
    this.numVal = this.editData.num;
  },
  methods: {
    showHideFn2() {
      this.listShow = !this.listShow;
    },
    handleClose2() {
      this.listShow = false;
    },
    showHideFn(item) {
      if(item.isOpen) item.isShow = !item.isShow;
    },
    handleClose(e, msg) {
      // console.log(e, msg)
      this.list[msg.index].isShow = false;
    },
    changeLimit(val) {
      this.numVal = val;
    },
  }
}
</script>
<style lang="scss" scoped>
.home {
  display:flex;
  .right { 
    width: 800px; border: 1px solid #f1f1f1;
    padding: 20px;
    .showhideBox {display: flex; }
    .box {
      position: relative;
      height: 40px;
      width: 100px;
      line-height: 40px;
      text-align: center;
      margin-right:10px;
      
      button {
        width: 100%; height: 100%;
        background: cornflowerblue;
        color: #fff;
        border-radius: 4px;
        border: 0;
        cursor: pointer;
      }
      .list{
        position: absolute;
        top:100%;
        left: 0;
        width: 100%;
        overflow: hidden;
        color: #333;
        background: #f1f1f1;
      }
    }
    
  }

  .buffetBox{
    margin-top: 10px;
    .pageList {
      > ul {
        // display: flex;
        li {
          button {
            width: 100px;
            height: 40px;
            border: 1px solid gray;
            margin-bottom: 10px;
          }
        }
      }
    }
  }
}
</style>