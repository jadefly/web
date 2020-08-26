<template>
  <div class="home">
    <div class="shopList">
      <div> 商品搜索：<input type="text" v-model="inputData" placeholder="请输入查询内容"/></div>
      <table>
        <tbody>
          <tr>
            <td class="xuhao">序号</td>
            <td class="name">商品名称</td>
            <td class="num">数量</td>
            <td class="price">单价</td>
            <td class="price">商品金额</td>
          </tr>
        </tbody>
        <tr v-for="item in serchData" :key="item.id">
            <td class="xuhao">{{item.id}}</td>
            <td class="name">{{item.name}}</td>
            <td class="num">
              <button class="icon del" @click="item.count--" :disabled="item.count==1">-</button>
                {{item.count}}
              <div class="icon add" @click="item.count++">+</div>
            </td>
            <td class="price">{{item.price|countFix}}</td>
            <td class="price">{{item.price*item.count|countFix(2)}}</td>
        </tr>
      </table>
      <div class="result">{{totalCount}}件商品，总计：{{totalPrice|countFix}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  components: {
  },
  filters:{
    countFix(count,n){
      n = n || 2;
      return '¥'+count.toFixed(n);
    }
  },
  computed:{
    serchData: function(){ //模糊搜索结果
      if(!this.inputData){
        return this.shopInfo;
      }else{
        return this.shopInfo.filter((item)=>{
          return item.name.includes(this.inputData);
        })
      }
    },
    totalCount: function(){
      let n = 0;
      this.shopInfo.forEach(item=>{
        n+=item.count;
      })
      return n;
    },
    totalPrice: function(){
      let tmp=0;
      this.shopInfo.forEach(item=>{
        tmp += item.count*item.price;
      })
      return tmp;
    }
  },
  data(){
    return{
      inputData:'',
      shopInfo:[
        {id:1,name:'西红柿',count:1, price: 100},
        {id:2,name:'土豆',count:2, price: 10},
        {id:3,name:'苹果',count:1, price: 100},
        {id:4,name:'苹果2',count:1, price: 100},
      ]
    }
  }
}
</script>

<style>
.shopList{
  width: 700px; 
  margin: 0 auto;
  font-size:14px;
}
.shopList table{
  border-collapse: collapse;
  width: 100%;
}
.shopList td{
  border:1px solid #eee;
  padding: 5px;
}
/* .shopList dt,.shopList dd{
  display: flex;
  border-bottom: 1px solid #eee;
  line-height: 1.5;
} */
.shopList .xuhao{
  width: 10%;
}
.shopList .name{
  width: 40%;
  text-align: left;
}
.shopList .num{
  width: 10%;
  /* display: flex; */
}
.shopList .num .icon{
  display: inline-block;
  border:1px solid #333;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
}
.shopList .price{
  width: 20%;
}
.result{
  margin-top:10px;
}
</style>

