<template>
  <div class="fashion-book-content">
    <SystemContent :title="$t('Dict.ShiShangDingSetting')">
      <div class="fashion-book-warp">
        <div class="fashion-book-info">
          <div class="pic">
            <img src="@static/img/fashion-book.png" :alt="$t('Dict.ShiShangDing')">
          </div>
          <div class="text">
            <h3>{{$t('Dict.ShiShangDing')}}</h3>
            <div class="status">
              <i class="icon" :class="statusObj.iconClass"></i>
              <span>{{ statusObj.text }}</span>
            </div>
            <button type="button" class="btn" @click="changeBindInfo">{{ statusObj.btn }}</button>
          </div>
        </div>
        <div
          class="fashion-book-setting"
          v-if="bindStatus"
        >
          <el-tabs v-model="activeName">
            <el-tab-pane :label="$t('Dict.UploadGuestInformation')" name="points">
              <div class="fashion-panel">
                <div class="fashion-panel-head">
                  <div class="fashion-panel-control">
                    <el-button type="primary" plain @click="setPoints">{{$t('Dict.AddPassengerSeat')}}</el-button>
                    <el-button
                      type="primary"
                      @click="uploadPoints"
                      :disabled="pointsData.length === 0"
                    >{{$t('Dict.Upload')}}</el-button>
                    <el-button type="primary" @click="reloadPointsData">{{$t('Dict.Btn.Refresh')}}</el-button>
                  </div>
                  <div class="fashion-panel-search">
                    <Search class="search" @onSearch="pointsSearch"></Search>
                  </div>
                </div>
                <div class="fashion-panel-table" ref="pointsTableWrap">
                  <el-table
                    :data="pointsData"
                    style="width: 100%"
                  >
                    <el-table-column prop="name" :label="$t('Dict.GuestName')"></el-table-column>
                    <el-table-column prop="code" :label="$t('Dict.GuestCode')"></el-table-column>
                    <el-table-column :label="$t('Dict.GuestBindingStatus')">
                      <template slot-scope="scope">
                        {{ scope.row.bindFlag ? $t('Dict.Bound') : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('Dict.Operation')">
                      <template slot-scope="scope">
                        <el-button
                          type="text"
                          size="mini"
                          @click="deletePoint(scope.row.pointId)"
                          :disabled="scope.row.bindFlag"
                        >{{$t('Dict.Delete')}}</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <div class="fashion-panel-foot">
                  <Pagination
                    :total="pointsPageTotal"
                    :limit="pointsPageLimit"
                    :page="pointsPage"
                    @handleChangePage="changePointsPage"
                  ></Pagination>
                </div>
              </div>
            </el-tab-pane>
<!--            <el-tab-pane :label="$t('Biz.UserDesktop.UserDesktopMsg134')" name="items">-->
<!--              <div class="fashion-panel">-->
<!--                <div class="fashion-panel-head">-->
<!--                  <div class="fashion-panel-control">-->
<!--                    <el-button type="primary" plain @click="setItems">{{$t('Dict.AddItem')}}</el-button>-->
<!--                    <el-button-->
<!--                      type="primary"-->
<!--                      @click="uploadItems"-->
<!--                      :disabled="itemsData.length === 0"-->
<!--                    >{{$t('Dict.Upload')}}</el-button>-->
<!--                    <el-button type="primary" @click="reloadItemsData">{{$t('Dict.Btn.Refresh')}}</el-button>-->
<!--                  </div>-->
<!--                  <div class="fashion-panel-search">-->
<!--                    <Search class="search" @onSearch="itemsSearch"></Search>-->
<!--                  </div>-->
<!--                </div>-->
<!--                <div class="fashion-panel-table" ref="itemsTableWrap">-->
<!--                  <el-table-->
<!--                    :data="itemsData"-->
<!--                    style="width: 100%"-->
<!--                  >-->
<!--                    <el-table-column prop="itemName" :label="$t('Dict.ItemName')"></el-table-column>-->
<!--                    <el-table-column prop="itemCode" :label="$t('Dict.ItemCode')"></el-table-column>-->
<!--                    <el-table-column prop="SizeName" :label="$t('Dict.Specifications')"></el-table-column>-->
<!--                    <el-table-column prop="unitName" :label="$t('Dict.UnitName')"></el-table-column>-->
<!--                    <el-table-column :label="$t('Biz.UserDesktop.UserDesktopMsg135')">-->
<!--                      <template slot-scope="scope">-->
<!--                        {{ scope.row.bindFlag ? $t('Dict.Bound') : '-' }}-->
<!--                      </template>-->
<!--                    </el-table-column>-->
<!--                    <el-table-column :label="$t('Dict.Operation')">-->
<!--                      <template slot-scope="scope">-->
<!--                        <el-button-->
<!--                          type="text"-->
<!--                          size="mini"-->
<!--                          @click="deleteItem(scope.row)"-->
<!--                          :disabled="scope.row.bindFlag"-->
<!--                        >{{$t('Dict.Delete')}}</el-button>-->
<!--                      </template>-->
<!--                    </el-table-column>-->
<!--                  </el-table>-->
<!--                </div>-->
<!--                <div class="fashion-panel-foot">-->
<!--                  <Pagination-->
<!--                    :total="itemsPageTotal"-->
<!--                    :limit="itemsPageLimit"-->
<!--                    :page="itemsPage"-->
<!--                    @handleChangePage="changeItemsPage"-->
<!--                  ></Pagination>-->
<!--                </div>-->
<!--              </div>-->
<!--            </el-tab-pane>-->
          </el-tabs>
        </div>
      </div>
    </SystemContent>
    <BindData ref="fashionBookBindDialog"></BindData>
    <SetPoints ref="setPoints"></SetPoints>
    <SetItems ref="setItems"></SetItems>
  </div>
</template>

<script>
import SystemContent from '@/components/Index/UserDesktop/base/SystemContent';
import Search from '@/components/Index/UserDesktop/base/Search';
import Pagination from '@/components/Index/UserDesktop/base/Pagination';
import ajax from '@/common/js/ajax';
import BindData from './BindData';
import SetPoints from './SetPoints';
import SetItems from './SetItems';

export default {
  components: {
    SystemContent,
    BindData,
    SetPoints,
    SetItems,
    Search,
    Pagination,
  },
  data() {
    return {
      bindStatus: false, // 绑定的状态
      bindData: {
        ip: '',
        port: '',
        id: '',
      },
      activeName: 'points',
      pointsPageTotal: 0,
      pointsPageLimit: 10,
      pointsPage: 1,
      pointsSearchParams: '',
      pointsData: [],
      itemsPageTotal: 0,
      itemsPageLimit: 10,
      itemsPage: 1,
      itemsSearchParams: '',
      itemsData: [],
    };
  },
  mounted() {
    // 进入页面先重置一些数据
    this.resetData();
  },
  computed: {
    statusObj() {
      return this.bindStatus
        ? {
          iconClass: 'icon-success',
          text: this.$t('Dict.Bound'),
          btn: this.$t('Dict.ModifyBindingInformation'),
        } : {
          iconClass: 'icon-error',
          text: this.$t('Dict.Unbound'),
          btn: this.$t('Dict.AddBindings'),
        };
    },
  },
  methods: {
    getPageSize(height) {
      const re = parseInt((height - 48) / 53, 0);
      if (re > 1) {
        return re;
      }
      return 1;
    },
    calcTablePageSize() {
      this.pointsPageLimit = this.getPageSize(this.$refs.pointsTableWrap.offsetHeight);
      this.itemsPageLimit = this.pointsPageLimit;
    },
    // 重置基础数据
    resetData() {
      this.activeName = 'points';
      this.resetPointsData();
      this.resetItemsData();
      this.bindStatus = false;
      // 读取绑定信息
      this.loadBindData();
    },
    // 重置客位列表数据
    resetPointsData() {
      this.pointsPage = 1;
      this.pointsSearchParams = '';
    },
    // 重置品项列表数据
    resetItemsData() {
      this.itemsPage = 1;
      this.itemsSearchParams = '';
    },
    // 读取后台接口绑定信息
    loadBindData() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.getbasicconfig').then((data) => {
        this.setBindData(data.bindData);
        this.bindStatus = data.bindStatus;
        if (data.bindStatus) {
          this.$nextTick(() => {
            this.calcTablePageSize();
            this.getPointsList();
            // this.getItemsList();
          });
        }
      });
    },
    changeBindInfo() {
      this.$refs.fashionBookBindDialog.open({
        bindStatus: this.bindStatus,
        bindData: this.bindData,
      }, {
        submit: () => {
          this.resetData();
        },
      });
    },
    setBindData(data) {
      this.bindData = data;
    },
    pointsSearch(value) {
      this.pointsPage = 1;
      this.pointsSearchParams = value.toUpperCase();
      this.getPointsList();
    },
    itemsSearch(value) {
      this.itemsPage = 1;
      this.itemsSearchParams = value.toUpperCase();
      this.getItemsList();
    },
    changePointsPage(page) {
      this.pointsPage = page;
      this.getPointsList();
    },
    changeItemsPage(page) {
      this.itemsPage = page;
      this.getItemsList();
    },
    reloadPointsData() {
      this.resetPointsData();
      this.getPointsList();
    },
    reloadItemsData() {
      this.resetItemsData();
      this.getItemsList();
    },
    getPointsList() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.getpoints', {
        contentType: 'URLEncoded',
        data: {
          filter: this.pointsSearchParams,
          page: this.pointsPage,
          limit: this.pointsPageLimit,
        },
      }).then((data) => {
        this.pointsPageTotal = data.total;
        this.pointsData = data.root;
      });
    },
    deletePoint(pointId) {
      this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg136'), this.$t('Dict.Tips'), {
        type: 'warning',
      }).then(() => {
        ajax('canyin.interfaces.shishangd.shishangdbooking.deletepoint', {
          contentType: 'URLEncoded',
          data: { pointId },
        }).then(() => {
          this.reloadPointsData();
        });
      }).catch(() => {});
    },
    deleteItem(item) {
      this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg137'), this.$t('Dict.Tips'), {
        type: 'warning',
      }).then(() => {
        ajax('canyin.interfaces.shishangd.shishangdbooking.deleteitem', {
          contentType: 'URLEncoded',
          data: {
            itemId: item.itemId,
            sizeId: item.SizeId,
          },
        }).then(() => {
          this.reloadItemsData();
        });
      }).catch(() => {});
    },
    getItemsList() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.getitems', {
        contentType: 'URLEncoded',
        data: {
          filter: this.itemsSearchParams,
          page: this.itemsPage,
          limit: this.itemsPageLimit,
        },
      }).then((data) => {
        this.itemsPageTotal = data.total;
        this.itemsData = data.root;
      });
    },
    setPoints() {
      this.$refs.setPoints.open({}, {
        submit: () => {
          this.reloadPointsData();
        },
      });
    },
    setItems() {
      this.$refs.setItems.open({}, {
        submit: () => {
          this.reloadItemsData();
        },
      });
    },
    uploadPoints() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.uploadpoints').then((data) => {
        this.$message.success(data);
        this.reloadPointsData();
      });
    },
    uploadItems() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.uploaditems').then((data) => {
        this.$message.success(data);
        this.reloadItemsData();
      });
    },
  },
};
</script>

<style lang="less" scoped>
.fashion-book-content {
  height: 100%;
}

.fashion-book-warp {
  position: relative;
  height: 100%;
  padding-top: 120px;
}

.fashion-book-info {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 120px;
  padding-left: 205px;

  > .pic {
    position: absolute;
    left: 0;
    top: 0;
    width: 190px;
    height: 105px;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding-top: 15px;

    > img {
      display: block;
      width: 100%;
    }
  }

  > .text {
    > h3 {
      line-height: 28px;
      font-size: 18px;
      color: #000;
    }

    > .status {
      line-height: 34px;

      > .icon-success {
        color: #46bc15;
      }

      > .icon-error {
        color: #ff3000;
      }

      > span {
        font-size: 12px;
      }
    }

    > .btn {
      width: 130px;
      height: 40px;
      background-color: #fff;
      border: 1px solid #5584ff;
      color: #5584ff;
    }
  }
}

.fashion-book-setting {
  height: 100%;
}

.fashion-panel {
  position: relative;
  height: 100%;
  padding-top: 45px;
  padding-bottom: 45px;
}

.fashion-panel-head,
.fashion-panel-foot {
  position: absolute;
  left: 0;
  width: 100%;
}

.fashion-panel-head {
  top: 0;
}

.fashion-panel-foot {
  bottom: 0;
  height: 40px;
}

.fashion-panel-control {
  float: left;

  > .tag {
    margin-left: 10px;
  }
}

.fashion-panel-search {
  float: right;
}

.fashion-panel-table {
  height: 100%;
}
</style>

<style lang="less">
.fashion-book-setting {
  .el-tabs {
    height: 100%;
    position: relative;
    padding-top: 55px;
  }

  .el-tabs__header {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .el-tabs__content,
  .el-tab-pane {
    height: 100%;
  }
}
  .lang-enUS{
    .fashion-book-info > .text > .btn{
      width: auto;
    }
  }
</style>
