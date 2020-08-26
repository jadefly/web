<template>
  <div class="content-pages">
    <div class="warp">
      <div class="warp-left">
        <h5><img class="arrow"
               src="../../assets/images/common/arrow.png">
          <span class="title">天津市石博特等保测评项目-2019</span></h5>
        <el-tabs type="border-card"
                 style="margin:25px 20px 0 20px;">
          <el-tab-pane v-for="item in tablist"
                       :key="item.type"
                       :label="item.name"
                       style="font-size:18px;"
                       tab-click="changeItem(item)">
            <div class="tab-content"
                 v-if="item.type==='1'">
              <el-row>
                <el-col :span="12">
                  <div class="basic-infor">
                    <label class="label-title">服务经理</label>
                    <span class="span-con">张怀瑞</span>
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">项目类型</label>
                    <span class="span-con">等保测评、安全服务</span>
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">实施总金额</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">安全服务金额</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">安全软件金额</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">预计启动时间</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">实际启动时间</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">项目成员</label>
                    <span class="span-con">等保测评、安全服务</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="basic-infor">
                    <label class="label-title">项目经理</label>
                    <span class="span-con">张怀瑞</span>
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">实施金额</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">等保测评金额</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">外购服务金额</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">其他安全服务金额</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">预计完成时间</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">实际完成时间</label>
                    <input class="input-con">
                  </div>
                  <div class="basic-infor">
                    <label class="label-title">项目状态</label>
                    <input class="input-con">
                  </div>
                </el-col>
              </el-row>
              <div class="dotted-line"></div>
              <div class="basic-infor">
                <label class="label-title">额外服务</label>
                <span class="extra-service">
                  <div class="extra-left">
                    <p class="blue-tit">等保服务</p>
                  </div>
                  <div class="extra-right">
                    <p class="blue-tit">安全服务</p>
                    <el-checkbox-group v-model="checked">
                      <el-checkbox v-for="item in checklist"
                                   style="width: 120px;"
                                   :label="item.name"
                                   :key="item.value"></el-checkbox>
                    </el-checkbox-group>
                  </div>
                </span>
              </div>
              <div class="basic-infor">
                <label class="label-title">等保信息系统</label>
              </div>
              <div class="basic-infor">
                <label class="label-title">客户信息</label>
              </div>
              <div class="basic-infor">
                <label class="label-title">项目实施地</label>
              </div>
            </div>
            <div class="tab-content"
                 v-if="item.type==='2'">
              <div class="staff-arrange">
                <p class="staff-name">张磊</p>
                <div class="solid-line1"></div>
                <el-row>
                  <el-col :span="12">
                    <div class="basic-infor">
                      <label class="label-title">项目开始时间</label>
                    </div>
                    <div class="basic-infor">
                      <label class="label-title">项目结束时间</label>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="basic-infor">
                      <label class="label-title">项目权重</label>
                    </div>
                    <div class="basic-infor">
                      <label class="label-title">项目地址</label>
                    </div>
                  </el-col>
                </el-row>
                <div class="basic-infor">
                  <label class="label-title">工作内容</label>
                </div>
              </div>
            </div>
            <div class="tab-content"
                 v-if="item.type==='3'">
              <div class="proProgress">
                <p class="pro-title">等保测评项目进度</p>
                <el-table ref="singleTable"
                          :data="dengProTable"
                          highlight-current-row
                          style="width: 100%">
                  <el-table-column type="key"
                                   label="序号"
                                   width="50">
                  </el-table-column>
                  <el-table-column property="pro"
                                   label="进度"
                                   width="120">
                  </el-table-column>
                  <el-table-column property="beizhu"
                                   label="工作备注"
                                   width="120">
                  </el-table-column>
                  <el-table-column property="shigong"
                                   label="施工期">
                  </el-table-column>
                </el-table>
              </div>
              <div class="proProgress">
                <p class="pro-title">安全服务项目进度</p>
                <el-table ref="singleTable"
                          :data="anProTable"
                          highlight-current-row
                          style="width: 100%">
                  <el-table-column type="key"
                                   label="序号"
                                   width="50">
                  </el-table-column>
                  <el-table-column property="pro"
                                   label="进度"
                                   width="120">
                  </el-table-column>
                  <el-table-column property="beizhu"
                                   label="工作备注"
                                   width="120">
                  </el-table-column>
                  <el-table-column property="shigong"
                                   label="施工期">
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <!-- 链接 -->
      <img class="link-img"
           src="../../assets/images/common/guanlian.png">
      <!-- 右侧 -->
      <div class="warp-right">
        <h5><span class="title">关联交接单</span></h5>
        <div class="basic-infor">
          <label class="label-title">项目名称</label>
          <span class="span-con">{{relatedForm.name}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">客户名称</label>
          <span class="span-con">{{relatedForm.kehu}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">销售负责人</label>
          <span class="span-con">{{relatedForm.sale}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">关联合同</label>
          <span class="span-con">{{relatedForm.relatedCont}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">期望启动时间</label>
          <span class="span-con">{{relatedForm.startDate}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">期望结束时间</label>
          <span class="span-con">{{relatedForm.endDate}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">合同内容</label>
          <span class="span-con">{{relatedForm.contractCon}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">附加服务</label>
          <span class="span-con">{{relatedForm.contractCon}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">备注</label>
          <span class="span-con">{{relatedForm.beizhu}}</span>
        </div>
        <div class="solid-line"></div>
        <div class="basic-infor">
          <label class="label-title">联系人</label>
          <span class="span-con">{{relatedForm.beizhu}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">电话</label>
          <span class="span-con">{{relatedForm.beizhu}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">邮箱</label>
          <span class="span-con">{{relatedForm.beizhu}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">所属部门</label>
          <span class="span-con">{{relatedForm.beizhu}}</span>
        </div>
        <div class="basic-infor">
          <label class="label-title">上级主管</label>
          <span class="span-con">{{relatedForm.beizhu}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'projectdetail',
  components: {

  },
  props: {},
  data () {
    return {
      tablist: [{
        name: '项目基本信息',
        type: '1'
      }, {
        name: '项目人员安排',
        type: '2'
      }, {
        name: '项目进度',
        type: '3'
      }],
      relatedForm: {
        name: '天津市石博特科技',
        kehu: '天津市石博特科技有限公司',
        sale: '李磊',
        relatedCont: '天津市石博特科技有限公司合同',
        startDate: '2019-10-21',
        endDate: '2019-11-30',
        contractCon: '',
        beizhu: '周五'
      },
      checklist: [{
        name: '安全巡检',
        value: '1'
      }, {
        name: '漏洞扫描',
        value: '2'
      }, {
        name: '渗透测试',
        value: '3'
      }, {
        name: '安全咨询',
        value: '4'
      }, {
        name: 'G01',
        value: '5'
      }, {
        name: '网络空间测绘',
        value: '6'
      }, {
        name: 'K01',
        value: '7'
      }, {
        name: '资产安全治理',
        value: '8'
      }, {
        name: '攻防演练',
        value: '9'
      }, {
        name: '重要时期保障',
        value: '10'
      }, {
        name: '风险评估',
        value: '11'
      }, {
        name: '上线测试',
        value: '12'
      }, {
        name: '其他',
        value: '13'
      }],
      checked: ['安全巡检', '渗透测试'],
      dengProTable: [{
        key: '001',
        pro: '0-40%',
        beizhu: '工作备注',
        shigong: '2019-11-11至2019-11-12'
      },
      {
        key: '001',
        pro: '0-40%',
        beizhu: '工作备注',
        shigong: '2019-11-11至2019-11-12'
      }, {
        key: '001',
        pro: '0-40%',
        beizhu: '工作备注',
        shigong: '2019-11-11至2019-11-12'
      }],
      anProTable: [{
        key: '001',
        pro: '0-40%',
        beizhu: '工作备注',
        shigong: '2019-11-11至2019-11-12'
      }, {
        key: '001',
        pro: '0-40%',
        beizhu: '工作备注',
        shigong: '2019-11-11至2019-11-12'
      }]
    }
  }
}
</script>
<style scoped>
.warp {
  position: relative;
  font-family: "微软雅黑";
}
.warp:after{
  content:'';
  clear: both;
  display: block;
}
.warp-left {
  width: 67%;
  margin: 30px auto;
  background: #ffffff;
  float: left;
  margin-left: 30px;
}
.link-img {
  position: absolute;
  left: 67.6%;
  top: 6%;
}
.warp-right {
  width: 30%;
  height: 700px;
  margin: 30px auto;
  background: #ffffff;
  float: right;
}
.warp-left h5,
.warp-right h5 {
  height: 70px;
  line-height: 70px;
  border-bottom: 1px solid #e2e3e3;
}
.arrow {
  padding-left: 30px;
}
.title {
  display: inline-block;
  margin-left: 45px;
  font-size: 20px !important;
  color: black;
  font-weight: 500 !important;
}
.basic-infor {
  line-height: 40px;
  margin-left: 30px;
}
.blue-tit{
  color: #4877e8;
}
.label-title {
  display: inline-block;
  min-width: 100px;
  text-align: right;
  color: #a0a7b8;
}
.span-con {
  width: 70%;
  text-align: left;
  color: #626262;
  margin-left: 20px;
  display: inline-block;
}
.input-con {
  width: 60%;
  height: 30px;
  border:1px solid #DEE1E7;
  margin-left: 20px;
  border-radius: 2px;
}
.solid-line {
  width: 90%;
  height: 1px;
  border: 1px solid #dee1e7;
}
.dotted-line {
  width: 90%;
  margin: 20px 10px;
}
.extra-service {
  display: inline-block;
  width: 80%;
  height: 320px;
  vertical-align: top;
}
.extra-left {
  width: 20%;
  height: 320px;
  margin: 0 5% 0 2%;
  border: 1px solid red;
  float: left;
}
.extra-right {
  width: 35%;
  height: 320px;
  float: left;
}
/* 项目人员安排 */
.staff-arrange {
  width: 100%;
  height: 190px;
  border: 1px solid red;
}
/* 项目进度 */
.proProgress {
  width: 100%;
}
</style>
