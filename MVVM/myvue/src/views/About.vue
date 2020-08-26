<template>
  <div class="home">
    <input type="text" v-model.trim="text1" v-focus="text1">
    <div style="margin-top:10px">
      <textarea name="" id="" cols="30" rows="10" v-model="text2"></textarea>
    </div>
    <div class="box">
      {{selectedVal}}
      <select name="" v-model="selectedVal">
        <option value="" disabled>请选择</option>
        <option v-for="o in selectD" :value="o.id" :key="o.id">{{ o.val }}</option>
      </select>
    </div>

    <section>
      {{sex}}
      <input type="radio" v-model="sex" value="男"> 男
      <input type="radio" v-model="sex" value="女"> 女
    </section>
    
    <section>
      <input type="checkbox" > 全选
      爱好：{{checked1}}
      <br>
      <input type="checkbox" v-model="checked1" value="游泳">游泳
      <input type="checkbox" v-model="checked1" value="健身">健身
    </section>
    {{ check2 }}
    <baseCheckBox val="xxx" v-model="check2"></baseCheckBox>
    <baseCheckBox val="yyy" v-model="check2"></baseCheckBox>
    <!-- 这里的 check2 的值将会传入这个名为 checked 的 prop -->
  </div>
</template>

<script>
import Vue from 'vue';
import baseCheckBox from '@/components/form/baseCheckBox';

Vue.directive('focus',{
  inserted(el,binding,vnode){
    //指令插入到页面时获取焦点
    console.log(el,binding,vnode)
    el.focus();
  }
})

export default{
  components: {
    baseCheckBox
  },
  data(){
    return{
      checked:[],
      check2: [],
      checked1: [], //多个为数组
      sex:'',
      text1: '',
      text2: '',
      selectedVal: '', //多个为数组
      selectD:[
        {
          val: '香蕉', id:1
        },{
          val:'苹果',id: 2
        }
      ]
    }
  },
}
</script>
