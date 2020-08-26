<template>
  <span>
    <input
    type="checkbox"
    :checked="checked"
    @change="$emit('change', $event.target.checked)"
    :value="val"> {{ val }}
  </span>
  
</template>

<script>
export default {
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: {},
    val: {
      type: String,
      default: '',
    }
  },
}
</script>