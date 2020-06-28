<script>
export default {
  render() {
    return null;
  },
  props: {
    data: Object,
  },
  created() {
    this.$emit('add', this.data);
  },
  destroyed() {
    this.$emit('remove', this.data);
  },
};
</script>
