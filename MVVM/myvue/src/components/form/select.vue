<template>
  <select :multiple="multiple" v-if="listData.length>0" :value="modelValue" @change="updateVal($event.target.value)" >
    <option
      v-for="(item,index) in listData"
      :value="item.dictValue"
      :key="index"
    >{{ item.dictLabel }}</option>
  </select>
</template>