<template>
  <div class="detailBox" :class="{rightShow: from === 'right'}">
    <el-row :gutter="rowGutter" class="formRow">
      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
          :lg="colName.lg "
          :xl="colName.xl">
          <span class="pull-right text-gray">交接单编号</span>
      </el-col>
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md" :lg="colContent.lg" :xl="colContent.xl">
          <strong>{{approvalMsgData.number || '-'}}</strong>
      </el-col>
      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
          :lg="colName.lg"
          :xl="colName.xl">
          <span class="pull-right text-gray">交接单名称</span>
      </el-col>
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md" :lg="colContent.lg" :xl="colContent.xl">
          <span>{{approvalMsgData.projectName || '-'}}</span>
      </el-col>

      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
          :lg="colName.lg "
          :xl="colName.xl">
          <span class="pull-right text-gray">关联合同</span>
      </el-col>
      
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
          :lg="colContent.lg "
          :xl="colContent.xl">
          <span>{{bargainName || '无关联合同'}}</span>
      </el-col>

      <el-col v-if="!bargainName" :xs="colName.xs" :sm="colName.sm" :md="colName.md"
          :lg="colName.lg "
          :xl="colName.xl">
          <span class="pull-right text-gray">预销售金额</span>
      </el-col>
      <el-col v-if="!bargainName" :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
          :lg="colContent.lg "
          :xl="colContent.xl">
          <span>{{approvalMsgData.expectMoney || '-'}}</span>
      </el-col>

      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
          :lg="colName.lg "
          :xl="colName.xl">
          <span class="pull-right text-gray">客户名称</span>
      </el-col>
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
          :lg="colContent.lg "
          :xl="colContent.xl">
          <span>{{approvalMsgData.customerName || '-'}}</span>
      </el-col>

      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
              :lg="colName.lg "
              :xl="colName.xl">
          <span class="pull-right text-gray">归属地</span>
      </el-col>
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
          :lg="colContent.lg "
          :xl="colContent.xl">
          <!-- 归属地类型：0-本地，1-异地 -->
          <span>{{approvalMsgData.addressType == '1'?'异地':approvalMsgData.addressType == '0'?'本地':'-'}}</span>&nbsp;
          <span v-if="approvalMsgData.addressType == '1'">{{approvalMsgData.addressProvince || '-'}}</span>&nbsp;
          <span v-if="approvalMsgData.addressType == '1'">{{approvalMsgData.addressCity || '-'}}</span>&nbsp;
      </el-col>

      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
          :lg="colName.lg "
          :xl="colName.xl">
          <span class="pull-right text-gray">销售负责人</span>
      </el-col>
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
          :lg="colContent.lg "
          :xl="colContent.xl">
          <span>{{approvalMsgData.headOfSales || '-'}}</span>
      </el-col>

      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
              :lg="colName.lg "
              :xl="colName.xl">
          <span class="pull-right text-gray">期望启动时间</span>
      </el-col>
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
          :lg="colContent.lg "
          :xl="colContent.xl">
          <span>{{approvalMsgData.expectedStartTime || '-'}}</span>
      </el-col>
      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
          :lg="colName.lg "
          :xl="colName.xl">
          <span class="pull-right text-gray">期望结束时间</span>
      </el-col>
      <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
          :lg="colContent.lg "
          :xl="colContent.xl">
          <span>{{approvalMsgData.expectedEndTime || '-'}}</span>
      </el-col>
    </el-row>

    <el-row :gutter="rowGutter" class="contractContentBox">
        <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl">
            <span class="pull-right text-gray">合同内容</span>
        </el-col>
        <template v-if="approvalMsgData.disCompliance">
          <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
              <div class="blue">合规</div>
          </el-col>
          <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl" v-if="approvalMsgData.disDbcp || approvalMsgData.disFxpg ||approvalMsgData.disBwpj ||approvalMsgData.disCyfx">
              <div class="detailsCard">
                  <div class="triangle"></div>
                  <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disDbcp">
                      <el-col :md="cardColName.md" :lg="cardColName.lg" :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;等保测评</span>
                      </el-col>
                      <el-col :md="cardColContent.md"
                          :lg="cardColContent.lg"
                          :xl="cardColContent.xl">
                          <div>
                              <span>服务年限：<span class="detailsCardNum">{{approvalMsgData.dbcpServeYear}}</span>年</span>
                              <span>测评系统建设完成：{{approvalMsgData.dbcpSystemIsComplate?'是':'否'}}</span>
                              <span>是否完成定级：{{approvalMsgData.dbcpIsScore ==0?'否':
                                                    approvalMsgData.dbcpIsScore ==1?'是':
                                                    approvalMsgData.dbcpIsScore ==-1?'其他':
                                                    '-'}}
                                  <span v-if="approvalMsgData.dbcpIsScore ==-1">{{approvalMsgData.dbcpIsScoreOther}}</span>
                              </span>
                          </div>
                          <div>
                              <span>系统级别：
                                二级系统<span class="detailsCardNum">{{approvalMsgData.dbcpSystemLeveTwo}}</span>个，
                                三级系统<span class="detailsCardNum">{{approvalMsgData.dbcpSystemLeveThree}}</span>个，
                                四级系统<span class="detailsCardNum">{{approvalMsgData.dbcpSystemLeveFour}}</span>个
                              </span>
                          </div>
                          <div>
                              <span>上传备案证明：<a class="download" :href="url+'/com/esintProjectSubmission/download/'+approvalMsgData.dbcpBazmFilePath">{{approvalMsgData.dbcpBazmFilePath?approvalMsgData.dbcpBazmFilePath.substr(approvalMsgData.dbcpBazmFilePath.lastIndexOf('/')+1):''}}</a></span>
                          </div>
                      </el-col>
                  </el-row>
                  <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disFxpg">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;风险评估</span>
                      </el-col>
                      <el-col :md="cardColContent.md"
                          :lg="cardColContent.lg"
                          :xl="cardColContent.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.fxpgServeYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.fxpgNum}}</span>次</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.fxpgSystemNum}}</span>个系统</span>
                      </el-col>
                  </el-row>
                  <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disBwpj">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;并网评价</span>
                      </el-col>
                      <el-col :md="cardColContent.md"
                          :lg="cardColContent.lg"
                          :xl="cardColContent.xl">
                      </el-col>
                  </el-row>
                  <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disCyfx">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;差异分析</span>
                      </el-col>
                      <el-col :md="cardColContent.md"
                          :lg="cardColContent.lg"
                          :xl="cardColContent.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.cyfxServeYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.cyfxNum}}</span>次</span>
                          <span>
                              二级系统<span class="detailsCardNum">{{approvalMsgData.cyfxSystemLeveTwo}}</span>个，
                              三级系统<span class="detailsCardNum">{{approvalMsgData.cyfxSystemLeveThree}}</span>个，
                              四级系统<span class="detailsCardNum">{{approvalMsgData.cyfxSystemLeveFour}}</span>个</span>
                      </el-col>
                  </el-row>
              </div>
          </el-col>
        </template>
        <el-col v-if="approvalMsgData.disCompliance" :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl"></el-col>
        <template v-if="approvalMsgData.disSecurityService">
          <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
              <div class="blue">安全服务</div>
          </el-col>
          <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl" v-if="approvalMsgData.disLdsm ||approvalMsgData.disGfyl ||approvalMsgData.disAqxj ||approvalMsgData.disAqpx ||approvalMsgData.disStcs ||approvalMsgData.disYjxy ||approvalMsgData.disOther">
            <div class="detailsCard">
              <div class="triangle"></div>
              <el-row :gutter="rowGutter"
                  class="formRow">
                  <template v-if="approvalMsgData.disLdsm">
                      <el-col :sm="cardColName.sm" :md="cardColName.md" :lg="cardColName.lg" :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;漏洞扫描</span>
                      </el-col>
                      <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.ldsmYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.ldsmNum}}</span>次</span>
                      </el-col>
                  </template>
                  <template v-if="approvalMsgData.disGfyl">
                      <el-col  :sm="cardColName.sm" :md="cardColName.md" :lg="cardColName.lg" :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;攻防演练</span>
                      </el-col>
                      <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                    <span>服务<span class="detailsCardNum">{{approvalMsgData.gfylYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.gfylNum}}</span>次</span>
                      </el-col>
                  </template>
                  <template v-if="approvalMsgData.disAqxj">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;安全巡检</span>
                      </el-col>
                      <el-col  :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.aqxjYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.aqxjNum}}</span>次</span>
                      </el-col>
                  </template>
                  <template v-if="approvalMsgData.disAqpx">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;安全培训</span>
                      </el-col>
                      <el-col  :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.aqpxYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.aqpxNum}}</span>次</span>
                      </el-col>
                  </template>
                  <template v-if="approvalMsgData.disStcs">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;渗透测试</span>
                      </el-col>
                      <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.stcsYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.stcsNum}}</span>次</span>
                      </el-col>
                  </template>
                  <template v-if="approvalMsgData.disYjxy">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;应急响应</span>
                      </el-col>
                      <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.yjxyYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.yjxyNum}}</span>次</span>
                      </el-col>
                  </template>
                  <template v-if="approvalMsgData.disOther">
                      <el-col :md="cardColName.md"
                          :lg="cardColName.lg "
                          :xl="cardColName.xl">
                          <span class="pull-right">✔&nbsp;其他</span>
                      </el-col>
                      <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                          <span>服务<span class="detailsCardNum">{{approvalMsgData.otherYear}}</span>年</span>
                          <span><span class="detailsCardNum">{{approvalMsgData.otherNum}}</span>次</span>
                      </el-col>
                  </template>
              </el-row>
          </div>
          </el-col>
        </template>

        <el-col v-if="approvalMsgData.disSecurityService" :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl"></el-col>
        <template v-if="approvalMsgData.disThirdServe">
          <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
              <div class="blue">第三方服务</div>
          </el-col>
          <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl" v-if="approvalMsgData.disGOne ||approvalMsgData.disDOne ||approvalMsgData.disEOne ||approvalMsgData.disKOne ||approvalMsgData.disCloud ||approvalMsgData.disOtherThird ||approvalMsgData.disOtherThird">
            <div class="detailsCard">
              <div class="triangle"></div>
              <el-row :gutter="rowGutter"
                  class="formRow">
                <template v-if="approvalMsgData.disGOne">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;G01</span>
                    </el-col>
                    <el-col  :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.gOneYear}}</span>年</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disDOne">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;D01</span>
                    </el-col>
                    <el-col  :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.dOneYear}}</span>年</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disEOne">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;E01</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.eOneYear}}</span>年</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disKOne">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;K01</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.kOneYear}}</span>年</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disCloud">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;云防护</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.cloudYear}}</span>年</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disOtherThird">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;其他外采购</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.otherYearThird}}</span>年</span>
                    </el-col>
                </template>
              </el-row>
          </div>
          </el-col>
        </template>
        <el-col v-if="approvalMsgData.disThirdServe" :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl"></el-col>
        <template v-if="approvalMsgData.disSelfProduct">
          <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
              <div class="blue">自有产品</div>
          </el-col>
          <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl">
            <div class="detailsCard">
              <div class="triangle"></div>
              <el-row :gutter="rowGutter"
                  class="formRow">
                  <el-col :md="cardColName.md"
                      :lg="cardColName.lg "
                      :xl="cardColName.xl">
                      <span class="pull-right">产品名称：</span>
                  </el-col>
                  <el-col :md="cardColContent.md"
                      :lg="cardColContent.lg"
                      :xl="cardColContent.xl">
                      <span>{{approvalMsgData.productName || '-'}}</span>
                  </el-col>
              </el-row>
          </div>
          </el-col>
        </template>
        <el-col v-if="!approvalMsgData.disCompliance && !approvalMsgData.disSecurityService && !approvalMsgData.disThirdServe && !approvalMsgData.disSelfProduct"
            :xs="colContent.xs"
            :sm="colContent.sm"
            :md="colContent.md"
            :lg="colContent.lg"
            :xl="colContent.xl">
            <span>-</span>
        </el-col>
    </el-row>
    <el-row :gutter="rowGutter" class="contractContentBox">
      <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl">
        <span class="pull-right text-gray">合同内减少内容</span>
      </el-col>
      <template v-if="approvalMsgData.disComplianceReduce">
        <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
            <div class="blue">合规</div>
        </el-col>
        <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl" v-if="approvalMsgData.disDbcpReduce ||approvalMsgData.disFxpgReduce ||approvalMsgData.disBwpjReduce ||approvalMsgData.disCyfxReduce">
          <div class="detailsCard">
            <div class="triangle"></div>
            <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disDbcpReduce">
                <el-col  :md="cardColName.md"
                    :lg="cardColName.lg "
                    :xl="cardColName.xl">
                    <span class="pull-right">✔&nbsp;等保测评</span>
                </el-col>
                <el-col :md="cardColContent.md"
                    :lg="cardColContent.lg"
                    :xl="cardColContent.xl">
                    <div>
                        <span>服务年限：<span class="detailsCardNum">{{approvalMsgData.dbcpServeYearReduce}}</span>年</span>
                        <span>测评系统建设完成：{{approvalMsgData.dbcpSystemIsComplateReduce?'是':'否'}}</span>
                        <span>是否完成定级：{{approvalMsgData.dbcpIsScoreReduce ==0?'否':
                                              approvalMsgData.dbcpIsScoreReduce ==1?'是':
                                              approvalMsgData.dbcpIsScoreReduce ==-1?'其他':
                                              '-'}}
                            <span v-if="approvalMsgData.dbcpIsScoreReduce ==-1">{{approvalMsgData.dbcpIsScoreOtherReduce}}</span>
                        </span>
                    </div>
                    <div>
                        <span>系统级别：
                          二级系统<span class="detailsCardNum">{{approvalMsgData.dbcpSystemLeveTwoReduce}}</span>个，
                          三级系统<span class="detailsCardNum">{{approvalMsgData.dbcpSystemLeveThreeReduce}}</span>个，
                          四级系统<span class="detailsCardNum">{{approvalMsgData.dbcpSystemLeveFourReduce}}</span>个
                        </span>
                    </div>
                    <div>
                        <span>上传备案证明：<a class="download" :href="url+'/com/esintProjectSubmission/download/'+approvalMsgData.dbcpBazmFilePathReduce">{{approvalMsgData.dbcpBazmFilePathReduce?approvalMsgData.dbcpBazmFilePathReduce.substr(approvalMsgData.dbcpBazmFilePathReduce.lastIndexOf('/')+1):''}}</a></span>
                    </div>
                </el-col>
            </el-row>
            <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disFxpgReduce">
                <el-col :md="cardColName.md"
                    :lg="cardColName.lg "
                    :xl="cardColName.xl">
                    <span class="pull-right">✔&nbsp;风险评估</span>
                </el-col>
                <el-col :md="cardColContent.md"
                    :lg="cardColContent.lg"
                    :xl="cardColContent.xl">
                    <span>服务<span class="detailsCardNum">{{approvalMsgData.fxpgServeYearReduce}}</span>年</span>
                    <span><span class="detailsCardNum">{{approvalMsgData.fxpgNumReduce}}</span>次</span>
                    <span><span class="detailsCardNum">{{approvalMsgData.fxpgSystemNumReduce}}</span>个系统</span>
                </el-col>
            </el-row>
            <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disBwpjReduce">
                <el-col :md="cardColName.md"
                    :lg="cardColName.lg "
                    :xl="cardColName.xl">
                    <span class="pull-right">✔&nbsp;并网评价</span>
                </el-col>
                <el-col :md="cardColContent.md"
                    :lg="cardColContent.lg"
                    :xl="cardColContent.xl">
                </el-col>
            </el-row>
            <el-row :gutter="rowGutter" class="formRow" v-if="approvalMsgData.disCyfxReduce">
                <el-col :md="cardColName.md"
                    :lg="cardColName.lg "
                    :xl="cardColName.xl">
                    <span class="pull-right">✔&nbsp;差异分析</span>
                </el-col>
                <el-col :md="cardColContent.md"
                    :lg="cardColContent.lg"
                    :xl="cardColContent.xl">
                    <span>服务<span class="detailsCardNum">{{approvalMsgData.cyfxServeYearReduce}}</span>年</span>
                    <span><span class="detailsCardNum">{{approvalMsgData.cyfxNumReduce}}</span>次</span>
                    <span>
                        二级系统<span class="detailsCardNum">{{approvalMsgData.cyfxSystemLeveTwoReduce}}</span>个，
                        三级系统<span class="detailsCardNum">{{approvalMsgData.cyfxSystemLeveThreeReduce}}</span>个，
                        四级系统<span class="detailsCardNum">{{approvalMsgData.cyfxSystemLeveFourReduce}}</span>个</span>
                </el-col>
            </el-row>
        </div>
        </el-col>
      </template>

      <el-col v-if="approvalMsgData.disComplianceReduce" :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl"></el-col>
      <template v-if="approvalMsgData.disSecurityServiceReduce">
        <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
            <div class="blue">安全服务</div>
        </el-col>
        <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl" v-if="approvalMsgData.disLdsmReduce ||approvalMsgData.disGfylReduce ||approvalMsgData.disAqxjReduce ||approvalMsgData.disAqpxReduce ||approvalMsgData.disStcsReduce ||approvalMsgData.disYjxyReduce ||approvalMsgData.disOtherReduce">
          <div class="detailsCard">
            <div class="triangle"></div>
            <el-row :gutter="rowGutter"
                class="formRow">
                <template v-if="approvalMsgData.disLdsmReduce">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;漏洞扫描</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.ldsmYearReduce}}</span>年</span>
                        <span><span class="detailsCardNum">{{approvalMsgData.ldsmNumReduce}}</span>次</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disGfylReduce">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;攻防演练</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                  <span>服务<span class="detailsCardNum">{{approvalMsgData.gfylYearReduce}}</span>年</span>
                        <span><span class="detailsCardNum">{{approvalMsgData.gfylNumReduce}}</span>次</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disAqxjReduce">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;安全巡检</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.aqxjYearReduce}}</span>年</span>
                        <span><span class="detailsCardNum">{{approvalMsgData.aqxjNumReduce}}</span>次</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disAqpxReduce">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;安全培训</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.aqpxYearReduce}}</span>年</span>
                        <span><span class="detailsCardNum">{{approvalMsgData.aqpxNumReduce}}</span>次</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disStcsReduce">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;渗透测试</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.stcsYearReduce}}</span>年</span>
                        <span><span class="detailsCardNum">{{approvalMsgData.stcsNumReduce}}</span>次</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disYjxyReduce">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;应急响应</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.yjxyYearReduce}}</span>年</span>
                        <span><span class="detailsCardNum">{{approvalMsgData.yjxyNumReduce}}</span>次</span>
                    </el-col>
                </template>
                <template v-if="approvalMsgData.disOtherReduce">
                    <el-col :md="cardColName.md"
                        :lg="cardColName.lg "
                        :xl="cardColName.xl">
                        <span class="pull-right">✔&nbsp;其他</span>
                    </el-col>
                    <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                        <span>服务<span class="detailsCardNum">{{approvalMsgData.otherYearReduce}}</span>年</span>
                        <span><span class="detailsCardNum">{{approvalMsgData.otherNumReduce}}</span>次</span>
                    </el-col>
                </template>
            </el-row>
        </div>
        </el-col>
      </template>

      <el-col v-if="approvalMsgData.disSecurityServiceReduce" :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl"></el-col>
      <template v-if="approvalMsgData.disThirdServeReduce">
        <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
            <div class="blue">第三方服务</div>
        </el-col>
        <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl" v-if="approvalMsgData.disGOneReduce ||approvalMsgData.disDOneReduce ||approvalMsgData.disEOneReduce ||approvalMsgData.disKOneReduce ||approvalMsgData.disCloudReduce ||approvalMsgData.disOtherThirdReduce">
          <div class="detailsCard">
            <div class="triangle"></div>
            <el-row :gutter="rowGutter"
                class="formRow">
              <template v-if="approvalMsgData.disGOneReduce">
                  <el-col :md="cardColName.md"
                      :lg="cardColName.lg "
                      :xl="cardColName.xl">
                      <span class="pull-right">✔&nbsp;G01</span>
                  </el-col>
                  <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                      <span>服务<span class="detailsCardNum">{{approvalMsgData.gOneYearReduce}}</span>年</span>
                  </el-col>
              </template>
              <template v-if="approvalMsgData.disDOneReduce">
                  <el-col :md="cardColName.md"
                      :lg="cardColName.lg "
                      :xl="cardColName.xl">
                      <span class="pull-right">✔&nbsp;D01</span>
                  </el-col>
                  <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                      <span>服务<span class="detailsCardNum">{{approvalMsgData.dOneYearReduce}}</span>年</span>
                  </el-col>
              </template>
              <template v-if="approvalMsgData.disEOneReduce">
                  <el-col :md="cardColName.md"
                      :lg="cardColName.lg "
                      :xl="cardColName.xl">
                      <span class="pull-right">✔&nbsp;E01</span>
                  </el-col>
                  <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                      <span>服务<span class="detailsCardNum">{{approvalMsgData.eOneYearReduce}}</span>年</span>
                  </el-col>
              </template>
              <template v-if="approvalMsgData.disKOneReduce">
                  <el-col :md="cardColName.md"
                      :lg="cardColName.lg "
                      :xl="cardColName.xl">
                      <span class="pull-right">✔&nbsp;K01</span>
                  </el-col>
                  <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                      <span>服务<span class="detailsCardNum">{{approvalMsgData.kOneYearReduce}}</span>年</span>
                  </el-col>
              </template>
              <template v-if="approvalMsgData.disCloudReduce">
                  <el-col :md="cardColName.md"
                      :lg="cardColName.lg "
                      :xl="cardColName.xl">
                      <span class="pull-right">✔&nbsp;云防护</span>
                  </el-col>
                  <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                      <span>服务<span class="detailsCardNum">{{approvalMsgData.cloudYearReduce}}</span>年</span>
                  </el-col>
              </template>
              <template v-if="approvalMsgData.disOtherThirdReduce">
                  <el-col :md="cardColName.md"
                      :lg="cardColName.lg "
                      :xl="cardColName.xl">
                      <span class="pull-right">✔&nbsp;其他外采购</span>
                  </el-col>
                  <el-col :sm="fwCon.sm" :md="fwCon.md" :lg="fwCon.lg" :xl="fwCon.xl">
                      <span>服务<span class="detailsCardNum">{{approvalMsgData.otherYearThirdReduce}}</span>年</span>
                  </el-col>
              </template>
            </el-row>
        </div>
        </el-col>
      </template>

      <el-col v-if="approvalMsgData.disThirdServeReduce" :xs="colName.xs" :sm="colName.sm" :md="colName.md" :lg="colName.lg " :xl="colName.xl"></el-col>
      <template v-if="approvalMsgData.disSelfProductReduce">
        <el-col :md="htFt.md" :lg="htFt.lg" :xl="htFt.xl">
            <div class="blue">自有产品</div>
        </el-col>
        <el-col :sm="htCon.sm" :md="htCon.md" :lg="htCon.lg" :xl="htCon.xl">
          <div class="detailsCard">
            <div class="triangle"></div>
            <el-row :gutter="rowGutter"
                class="formRow">
                <el-col :md="cardColName.md"
                    :lg="cardColName.lg "
                    :xl="cardColName.xl">
                    <span class="pull-right">产品名称：</span>
                </el-col>
                <el-col :md="cardColContent.md"
                    :lg="cardColContent.lg"
                    :xl="cardColContent.xl">
                    <span>{{approvalMsgData.productNameReduce || '-'}}</span>
                </el-col>
            </el-row>
        </div>
        </el-col>
      </template>
      <el-col v-if="!approvalMsgData.disComplianceReduce && !approvalMsgData.disSecurityServiceReduce && !approvalMsgData.disThirdServeReduce && !approvalMsgData.disSelfProductReduce"
          :xs="colContent.xs"
          :sm="colContent.sm"
          :md="colContent.md"
          :lg="colContent.lg"
          :xl="colContent.xl">
          <span>-</span>
      </el-col>
    </el-row>
    <el-row :gutter="rowGutter"
        class="formRow">
        <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
            :lg="colName.lg "
            :xl="colName.xl">
            <span class="pull-right text-gray">销售人员建议</span>
        </el-col>
        <el-col :xs="colContent.xs" :sm="colContent.sm" :md="colContent.md"
            :lg="colContent.lg "
            :xl="colContent.xl">
            <span>{{approvalMsgData.sellerAdvise || '-'}}</span>
        </el-col>
    </el-row>
    <el-row :gutter="rowGutter"
        class="formRow">
        <el-col :xs="colName.xs" :sm="colName.sm" :md="colName.md"
            :lg="colName.lg "
            :xl="colName.xl">
            <span class="pull-right text-gray">备注</span>
        </el-col>
        <el-col :xs="colContent.xs" :md="colContent.md"
            :lg="colContent.lg "
            :xl="colContent.xl">
            <span>{{approvalMsgData.marks || '-'}}</span>
        </el-col>
    </el-row>
    <el-divider></el-divider>
    <h3 class="customer-title"><i class="icon-icon_khjkr"></i>客户接口人</h3>
    <el-row :gutter="rowGutter"
        class="formRow">
        <el-col :md="contractName.md" :lg="contractName.lg" :xl="contractName.xl">
            <span class="pull-right text-gray">*联系人</span>
        </el-col>
        <el-col :md="contractCon.md" :lg="contractCon.lg" :xl="contractCon.xl">
            <span>{{approvalMsgData.customerContact || '-'}}</span>
        </el-col>
        <el-col :md="contractName.md" :lg="contractName.lg" :xl="contractName.xl">
            <span class="pull-right text-gray">*电话</span>
        </el-col>
        <el-col :md="contractCon.md" :lg="contractCon.lg" :xl="contractCon.xl">
            <span>{{approvalMsgData.customerTel || '-'}}</span>
        </el-col>
        <el-col :md="contractName.md" :lg="contractName.lg" :xl="contractName.xl">
            <span class="pull-right text-gray">*邮箱</span>
        </el-col>
        <el-col :md="contractCon.md" :lg="contractCon.lg" :xl="contractCon.xl">
            <span>{{approvalMsgData.customerEmail || '-'}}</span>
        </el-col>
    </el-row>
    <el-row :gutter="rowGutter"
        class="formRow">
        <el-col :md="contractName.md" :lg="contractName.lg" :xl="contractName.xl">
            <span class="pull-right text-gray">*所属部门</span>
        </el-col>
        <el-col :md="contractCon.md" :lg="contractCon.lg" :xl="contractCon.xl">
            <span>{{approvalMsgData.customerPost || '-'}}</span>
        </el-col>
        <el-col :md="contractName.md" :lg="contractName.lg" :xl="contractName.xl">
            <span class="pull-right text-gray">*上级主管</span>
        </el-col>
        <el-col :md="contractCon.md" :lg="contractCon.lg" :xl="contractCon.xl">
            <span>{{approvalMsgData.customerSuperior || '-'}}</span>
        </el-col>
    </el-row>
  </div>
</template>

<script>
import { getHandoverSlip,dicCodeTypesOne } from '@/api/loophole'
export default {
  name: 'approvalMsg',
  components: {},
  props: {
    approvalMsgData: {
      type: Object,
      default: () => {}
    },
    bargainName: {
      type: String,
      default: ''
    },
    from: {
      type: String,
      default: 'left'
    }
  },
  data () {
    return {
      url: process.env.VUE_APP_BASE_API, // url前缀
      htFt: {
        xs: 2, md: 4, lg: 2, xl: 2
      },
      htCon: {
        xs: 15, md: 15, lg: 16, xl: 18
      },
      colName: { // 详情标题栅格
        xs: 8, sm: 7, md: 4, lg: 4, xl: 3
      },
      colContent: { // 详情内容栅格
        sm: 17, md: 8, lg: 8, xl: 9
      },
      cardColName: {// 详情内容中卡片标题栅格
        md: 5, lg: 5, xl: 3
      },
      cardColContent: {// 详情内容中卡片内容栅格
        md: 13, lg: 13, xl: 16
      },
      // 合同详情栅格
      contractName: {
        md: 3, lg: 3, xl: 2
      },
      contractCon: {
        md: 5, lg: 5, xl: 6
      },
      fwCon: {
        md: 7, lg: 7, xl: 5
      },
      rowGutter: 15
    }
  },
  watch: {
  },
  mounted () {
    // console.log('form', this.from)
    if (this.from === 'right') {
      this.colName = {// 详情标题栅格
        xs: 7,
        sm: 7,
        md: 7,
        lg: 7,
        xl: 7
      }
      this.colContent = {// 详情内容栅格
        xs: 17,
        md: 17,
        lg: 17,
        xl: 17
      }
      this.contractName = this.colName
      this.contractCon = this.colContent

      this.htFt = {
        xs: 17, md: 17, lg: 17, xl: 17
      }
      this.htCon = {
        xs: 24, md: 24, lg: 24, xl: 24
      }
      this.cardColName = {// 详情内容中卡片标题栅格
        md: 8, lg: 7, xl: 4
      }
      this.cardColContent = {// 详情内容中卡片标题栅格
        md: 13, lg: 17, xl: 20
      }
      this.fwCon = {
        md: 16, lg: 16, xl: 8
      }
    }
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.blue{
    color: #409EFF;
}
.contractContentBox{
    margin-top: 20px;
    .contractContent{
        display: flex;
    }
  .detailsCard{
    width: 100%;
    position: relative;
    z-index: 3;
    padding: 5px 10px;
    border: 1px solid #dee1e7;
    background-color: #f9f9f9;
    border-radius: 3px;
    margin: -3px 0 0px 0;
    .triangle{
        position: absolute;
        width: 10px;
        height: 10px;
        left: -5px;
        top: 10px;
        z-index: 1;
        border: 1px solid #dee1e7;
        border-top: #40a0ff00;
        border-right: #40a0ff00;
        background-color: #f9f9f9;
        transform:rotate(45deg)
    }
    .pull-right{
        color: #000;
        font-weight: 700;
        margin-right: 0px;
    }
    span{
        margin-right: 20px;
    }
    .detailsCardNum{
        color: #409EFF;
        font-size: 14px !important;
        margin: 0 2px;
    }
}
}
.detailBox {
  // line-height: 40px;
  .el-col {
    margin: 10px 0 5px 0;
    color: #666;
    line-height: 23px;
  }
  .customer-title {
    margin-left: 20px;
    color: #5a8bff;
    font-size: 15px !important;
  }
}

/*右侧显示 */
.rightShow {
  .detailsCard {
    width:90%;
    margin-left: 8%;
    .triangle{
      left: 29%;
      top: -5px;
      transform: rotate(135deg);
    }
  }
}
.download{
    color: #409EFF;
}
</style>
