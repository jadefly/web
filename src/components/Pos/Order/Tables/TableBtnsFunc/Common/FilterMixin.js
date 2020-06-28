export default {
  data() {
    return {
      // 当前选择客位类型的数据
      choiceTypeData: null,
      // 当前选择消费区域的数据
      choiceAeraData: null,
      // 过滤类型
      types: [],
      // 过滤区域
      areas: [],
      // 分页特有ID 解决翻页失效问题
      teamAreasId: '',
      teamTablesListId: '',
    };
  },
  methods: {
    // 页面初始化
    initFilterData() {
      // 客位类型信息
      this.types = this.resData.pointTypes;
      // 消费区域信息
      this.areas = this.resData.areas;
      this.$vemit('initFilterHeader');
      // 重置搜索框
      this.$vemit('clearSearch');
    },
    // 客位类型选择监听
    choiceTypes(item) {
      this.ordeInfo = this.ordeInfo.map((d) => {
        if (this.choiceAeraData == null) {
          if (d.pointtypeid === item.id) {
            this.$set(d, 'unShow', false);
          } else {
            this.$set(d, 'unShow', true);
          }
        } else if (d.pointtypeid === item.id && d.areaid === this.choiceAeraData.id) {
          this.$set(d, 'unShow', false);
        } else {
          this.$set(d, 'unShow', true);
        }
        return d;
      });
      this.choiceTypeData = item;
      this.$refs.teamTableList.refreshListPager();
    },
    // 消费区域选择监听
    choiceAeras(item) {
      this.ordeInfo = this.ordeInfo.map((d) => {
        if (this.choiceTypeData == null) {
          if (d.areaid === item.id) {
            this.$set(d, 'unShow', false);
          } else {
            this.$set(d, 'unShow', true);
          }
        } else if (d.areaid === item.id && d.pointtypeid === this.choiceTypeData.id) {
          this.$set(d, 'unShow', false);
        } else {
          this.$set(d, 'unShow', true);
        }
        return d;
      });
      this.choiceAeraData = item;
      this.$refs.teamTableList.refreshListPager();
    },
    // 全部客位类型选择监听
    choiceAllTypes() {
      if (this.choiceAeraData == null) {
        this.ordeInfo = this.ordeInfo.map((d) => {
          this.$set(d, 'unShow', false);
          return d;
        });
      } else {
        this.ordeInfo = this.ordeInfo.map((d) => {
          if (d.areaid === this.choiceAeraData.id) {
            this.$set(d, 'unShow', false);
          } else {
            this.$set(d, 'unShow', true);
          }
          return d;
        });
      }
      this.choiceTypeData = null;
      this.$refs.teamTableList.refreshListPager();
    },
    // 全部消费区域选择监听
    choiceAllAeras() {
      if (this.choiceTypeData == null) {
        this.ordeInfo = this.ordeInfo.map((d) => {
          this.$set(d, 'unShow', false);
          return d;
        });
      } else {
        this.ordeInfo = this.ordeInfo.map((d) => {
          if (d.pointtypeid === this.choiceTypeData.id) {
            this.$set(d, 'unShow', false);
          } else {
            this.$set(d, 'unShow', true);
          }
          return d;
        });
      }
      this.choiceAeraData = null;
      this.$refs.teamTableList.refreshListPager();
    },
    // 刷新过滤、列表分页
    refreshPager(id) {
      this.teamTablesListId = id;
      this.teamAreasId = `${id}Filter`;

      setTimeout(() => {
        this.$refs.teamTableFilter.refreshFilterPager();
        this.$refs.teamTableList.refreshListPager();
      }, 200);
    },
  },
};
