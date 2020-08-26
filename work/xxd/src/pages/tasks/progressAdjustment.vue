<template>
    <div class="content-pages">
        <div class="content-breadcrumb">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item><a href="/tasks/Progress">项目管理</a></el-breadcrumb-item>
                <el-breadcrumb-item><a href="/tasks/Progress">项目进度管理</a></el-breadcrumb-item>
                <el-breadcrumb-item><a href="">项目进度调整</a></el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="content-left">
            <div class="content-container-top">
                <el-page-header @back="goBack"
                    :content="projectName"
                    title="">
                </el-page-header>
            </div>
            <div class="detail-content">
                <el-row :gutter="20"
                    class="row">
                    <el-col :span="4"
                        class="lable">
                        <div>是否异常</div>
                    </el-col>
                    <el-col :span="18">
                        <el-switch v-model="abnormalSwitch"
                            @change="handleSwitch"
                            active-color="#2c9ef7"
                            inactive-color="#f56c6c">
                        </el-switch>
                    </el-col>
                </el-row>
                <el-row :gutter="20"
                    class="row">
                    <el-col :span="4"
                        class="lable">
                        <div>项目进度</div>
                    </el-col>
                    <el-col :span="16">
                        <div class="progressBar">
                            <el-slider v-model="progress"
                                @input="handleProgress"
                                :disabled="disabledProgress || !abnormalSwitch"
                                @change="adjustmentProjectSchedule" />
                        </div>
                    </el-col>
                    <el-col :span="2">
                    <div class="progressVlaue">
                      <el-input-number :disabled="disabledProgress || !abnormalSwitch" v-model="progress" size="medium" :step="1" @change="adjustmentProjectSchedule"></el-input-number>
                    </div>
                </el-col>
                </el-row>
                <el-row :gutter="20"
                    class="row projectStatus">
                    <el-col :span="4"
                        class="lable">
                        <div>项目状态</div>
                    </el-col>
                    <el-col :span="18">
                        <div class="timeline">
                            <div class="processBox">
                                <span v-if="startUp.isStyle" class="icon el-icon-success"></span>
                                <span v-else class="yuan"><span></span></span>
                                <div>
                                    <span class="title">启动过程</span>
                                </div>
                                <el-row :gutter="30"
                                    :class="startUp.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.startUp, startUp, '5', '0')"
                                            :disabled="!(progress>= 0 && progress<10 && abnormalSwitch)"
                                            class="processBtn"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目启动</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-col :md="10" :lg="10" :xl="6"
                                                class="cardTitle">
                                                <span>定级备案证明</span>
                                            </el-col>
                                            <el-col :md="14" :lg="14" :xl="18">
                                                <a :href="url+'/com/esintProjectSubmission/download/'+dbcpBazmFilePath">{{dbcpBazmFilePath?dbcpBazmFilePath.substr(dbcpBazmFilePath.lastIndexOf('/')+1):'-'}}</a>
                                            </el-col>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="30"
                                    :class="startUp.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button disabled
                                            :class="startUp.isStyle && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目经理任命</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-col :md="10" :lg="10" :xl="6"
                                                class="cardTitle">
                                                <span>项目经理</span>
                                            </el-col>
                                            <el-col :md="14" :lg="14" :xl="18">
                                                <span>{{projectManagerName}}</span>
                                            </el-col>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="30"
                                    :class="research.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                            <!-- :disabled="!(startUp.isStyle && startUp.btnIsDisable && abnormalSwitch)" -->
                                        <el-button @click="ProgressAdjust(dictionary.research, research, '10', '5')"
                                            :disabled="!(abnormalSwitch && (research.index == (queryProjectSchedule.length - 1) || (startUp.index + 1) == queryProjectSchedule.length))"
                                            :class="startUp.index == (queryProjectSchedule.length - 1) && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目前期调研</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: research.id,
                                                  type: '1'
                                                }"
                                                :headers="headers"
                                                :limit="10"
                                                :before-remove="beforeRemove"
                                                :on-preview="onPreview"
                                                :disabled="!(research.btnIsDisable && abnormalSwitch)"
                                                :file-list="recordingFile">
                                                <el-button :disabled="!(research.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传首次会议记录</div>
                                            </el-upload>
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: research.id,
                                                  type: '2'
                                                }"
                                                :headers="headers"
                                                accept=".xlsx,.xls"
                                                :limit="1"
                                                :before-remove="beforeRemove"
                                                :disabled="!(research.btnIsDisable && abnormalSwitch)"
                                                :file-list="informationSystemFile">
                                                <el-button :disabled="!(research.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传信息系统基本情况调研表</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row class="auditRecord"
                                    v-if="Object.keys(research).length>0 && research.scheduleApprovalList.length > 0">
                                    <h3>项目助理审批记录</h3>
                                    <el-timeline :reverse="true">
                                        <el-timeline-item v-for="(item, index) in research.scheduleApprovalList"
                                            :key="index"
                                            :color="index == (research.scheduleApprovalList.length -1)?'#4877e6':'#939bae'"
                                            :class="index == (research.scheduleApprovalList.length -1)?'firstContent':'otherContent'">
                                            <div class="scheduleApproval">
                                                <span>{{item.createTime}}</span>
                                                <span>{{item.approvalUserName}}</span>
                                                <span>{{item.approvalState == '1'?'通过':item.approvalState == '-1'?'不通过':'-'}}</span>
                                                <span>说明描述：{{item.approvalContent}}</span>
                                            </div>
                                        </el-timeline-item>
                                    </el-timeline>
                                </el-row>
                            </div>
                            <div class="processBox">
                                <span v-if="planning.isStyle" class="icon el-icon-success"></span>
                                <span v-else class="yuan"><span></span></span>
                                <div>
                                    <span class="title">规划过程</span>
                                </div>
                                <el-row :gutter="30"
                                    :class="planning.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.planning, planning, '15', '10')"
                                            :disabled="!(abnormalSwitch  && research.stageStatus == '0' && (planning.index == (queryProjectSchedule.length - 1) || (research.index + 1) == queryProjectSchedule.length))"
                                            :class="research.index == (queryProjectSchedule.length - 1) && research.stageStatus == '0' && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目规划</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: planning.id
                                                }"
                                                :headers="headers"
                                                :before-remove="beforeRemove"
                                                multiple
                                                :limit="3"
                                                :disabled="!(planning.btnIsDisable && abnormalSwitch)"
                                                :file-list="planningFile">
                                                <el-button :disabled="!(planning.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传项目规划文件</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                            <div class="processBox">
                                <span v-if="implement.isStyle" class="icon el-icon-success"></span>
                                <span v-else class="yuan"><span></span></span>
                                <div>
                                    <span class="title">执行过程</span>
                                </div>
                                <el-row :gutter="30"
                                    :class="implement.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.implement, implement, '60', '15')"
                                            :disabled="!(abnormalSwitch && (implement.index == (queryProjectSchedule.length - 1) || (planning.index + 1) == queryProjectSchedule.length))"
                                            :class="planning.index == (queryProjectSchedule.length - 1) && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目现场实施</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: implement.id
                                                }"
                                                :headers="headers"
                                                :before-remove="beforeRemove"
                                                multiple
                                                :limit="3"
                                                :disabled="!(implement.btnIsDisable && abnormalSwitch)"
                                                :file-list="implementFile">
                                                <el-button :disabled="!(implement.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传项目现场实施文件</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="30"
                                    :class="ending.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.ending, ending, '70', '60')"
                                            :disabled="!(abnormalSwitch && (ending.index == (queryProjectSchedule.length - 1) || (implement.index + 1) == queryProjectSchedule.length))"
                                            :class="implement.index == (queryProjectSchedule.length - 1) && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目现场收尾</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: ending.id
                                                }"
                                                :headers="headers"
                                                :before-remove="beforeRemove"
                                                multiple
                                                :limit="3"
                                                :disabled="!(ending.btnIsDisable && abnormalSwitch)"
                                                :file-list="endingFile">
                                                <el-button :disabled="!(ending.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传项目现场收尾文件</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="30"
                                    :class="update.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.update, update, '90', '70')"
                                            :disabled="!(abnormalSwitch && (update.index == (queryProjectSchedule.length - 1) || (ending.index + 1) == queryProjectSchedule.length))"
                                            :class="ending.index == (queryProjectSchedule.length - 1) && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目过程更新</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: update.id
                                                }"
                                                :headers="headers"
                                                :before-remove="beforeRemove"
                                                multiple
                                                :limit="3"
                                                :disabled="!(update.btnIsDisable && abnormalSwitch)"
                                                :file-list="updateFile">
                                                <el-button :disabled="!(update.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传组织过程资产更新文件</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                            <div class="processBox">
                                <span v-if="summary.isStyle" class="icon el-icon-success"></span>
                                <span v-else class="yuan"><span></span></span>
                                <div>
                                    <span class="title">监控过程</span>
                                </div>
                                <el-row :gutter="30"
                                    :class="summary.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.summary, summary, '90' , '90')"
                                            :disabled="!(abnormalSwitch && (summary.index == (queryProjectSchedule.length - 1) || (update.index + 1) == queryProjectSchedule.length))"
                                            :class="update.index == (queryProjectSchedule.length - 1) && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;项目绩效汇总</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: summary.id
                                                }"
                                                :headers="headers"
                                                :before-remove="beforeRemove"
                                                multiple
                                                :limit="3"
                                                :disabled="!(summary.btnIsDisable && abnormalSwitch)"
                                                :file-list="summaryFile">
                                                <el-button :disabled="!(summary.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传项目情况汇总文件</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="30"
                                    :class="monthlySummary.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.monthlySummary, monthlySummary, '90', '90')"
                                            :disabled="!(abnormalSwitch && (monthlySummary.index == (queryProjectSchedule.length - 1) || (summary.index + 1) == queryProjectSchedule.length))"
                                            :class="summary.index == (queryProjectSchedule.length-1) && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;月度绩效汇总</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: monthlySummary.id
                                                }"
                                                :headers="headers"
                                                :before-remove="beforeRemove"
                                                multiple
                                                :limit="3"
                                                :disabled="!(monthlySummary.btnIsDisable && abnormalSwitch)"
                                                :file-list="monthlySummaryFile">
                                                <el-button :disabled="!(monthlySummary.btnIsDisable && abnormalSwitch)"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传月度绩效汇总文件</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                            <div class="processBox">
                                <span v-if="externalAcceptance.isStyle" class="icon el-icon-success"></span>
                                <span v-else class="yuan"><span></span></span>
                                <div>
                                    <span class="title">收尾过程</span>
                                </div>
                                <el-row :gutter="30"
                                    :class="externalAcceptance.isStyle?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button @click="ProgressAdjust(dictionary.externalAcceptance, externalAcceptance, '95', '90')"
                                            :disabled="!(abnormalSwitch && (externalAcceptance.index == (queryProjectSchedule.length - 1) || (monthlySummary.index + 1) == queryProjectSchedule.length)) || progress == '100'"
                                            :class="monthlySummary.index == (queryProjectSchedule.length - 1) && abnormalSwitch?'processBtn':'processBtnDisabled'"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;外部项目验收</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        <div class="card clear">
                                            <el-upload class="upload"
                                                :action="url+'esintProjectScheduleFile/saveEsintProjectScheduleFile'"
                                                :data="{
                                                  fkProjectScheduleId: externalAcceptance.id
                                                }"
                                                :headers="headers"
                                                :before-remove="beforeRemove"
                                                multiple
                                                :limit="3"
                                                :disabled="!(externalAcceptance.btnIsDisable && abnormalSwitch) || progress == '100'"
                                                :file-list="externalAcceptanceFile">
                                                <el-button :disabled="!(externalAcceptance.btnIsDisable && abnormalSwitch) || progress == '100'"
                                                    size="small"
                                                    type="primary"><span class="iconfont iconshangchuanwenjian"></span>&nbsp;添加文件</el-button>
                                                <div slot="tip"
                                                    class="el-upload__tip">请上传外部项目验收文件</div>
                                            </el-upload>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="30"
                                    :class="progress == '100'?'processRowBox':'processRowBoxDisabled'">
                                    <el-col :span="6">
                                        <el-button disabled
                                            class="processBtnDisabled"
                                            round
                                            size="small"><span class="iconfont iconyiwanchengxiangmu"></span>&nbsp;内部项目验收</el-button>
                                    </el-col>
                                    <el-col :span="18">
                                        &nbsp;
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </el-col>
                </el-row>

            </div>
        </div>
        <div class="content-right">
            <div class="shadowBox">
                <div class="content-container-top">
                    <h3>项目异常记录</h3>
                </div>
                <div v-if="abnormalRecording.length > 0">
                  <div class="exceptionRecordCard" v-for="item in abnormalRecording" :key="item.id">
                      <div class="exceptionRecord">
                          <el-row :gutter="20"
                              class="exceptionRecordRow">
                              <el-col :md="8" :lg="8" :xl="4"
                                  class="lable">异常状态</el-col>
                              <el-col :md="16" :lg="16" :xl="20"
                                  class='content'>{{item.errorStatusName}}</el-col>
                          </el-row>
                          <el-row :gutter="20"
                              class="exceptionRecordRow">
                              <el-col :md="8" :lg="8" :xl="4"
                                  class="lable">异常金额</el-col>
                              <el-col :md="16" :lg="16" :xl="20"
                                  class='content'>{{item.errorMoney}}</el-col>
                          </el-row>
                          <el-row :gutter="20"
                              class="exceptionRecordRow">
                              <el-col :md="8" :lg="8" :xl="4"
                                  class="lable">开始时间</el-col>
                              <el-col :md="16" :lg="16" :xl="20"
                                  class='content'>{{item.errorBeginDatetime}}</el-col>
                          </el-row>
                          <el-row :gutter="20"
                              class="exceptionRecordRow">
                              <el-col :md="8" :lg="8" :xl="4"
                                  class="lable">解决时间</el-col>
                              <el-col :md="16" :lg="16" :xl="20"
                                  class='content'>{{item.errorEndDatetime || '-'}}</el-col>
                          </el-row>
                      </div>
                  </div>
                </div>
                <div v-else class="noRecord">
                  <p>无异常记录</p>
                </div>
            </div>
        </div>
        <el-dialog
          title="项目异常"
          :visible.sync="abnormalVisible"
          :before-close="handleAbnormalCancel"
          width="520px"
          center>
          <el-form ref="abnormalForm"
              class="abnormalForm"
              :model="abnormalForm"
              :rules="rules"
              label-width="80px">
              <el-form-item label="异常状态" prop="errorStatus">
                  <!-- 1-重新实施；2-增加实施 3-变更实施 -->
                  <el-select v-model="abnormalForm.errorStatus"
                      :disabled="!abnormalSwitch"
                      placeholder="请选择异常状态">
                      <el-option v-for="item in errorCode"
                      :key="item.value"
                      :label="item.title"
                      :value="item.value"></el-option>
                  </el-select>
              </el-form-item>
              <el-form-item label="异常金额" prop="errorMoney">
                  <el-input :disabled="!abnormalSwitch" placeholder="请输入异常金额" v-model="abnormalForm.errorMoney"></el-input>
              </el-form-item>
              <el-form-item label="开始时间" prop="errorBeginDatetime">
                  <el-date-picker type="date"
                      placeholder="开始时间"
                      value-format="yyyy-MM-dd"
                      :disabled="!abnormalSwitch"
                      v-model="abnormalForm.errorBeginDatetime"
                      style="width: 100%;"></el-date-picker>
              </el-form-item>
              <el-form-item label="解决时间" prop="errorEndDatetime">
                  <el-date-picker type="date"
                      placeholder="解决时间"
                      value-format="yyyy-MM-dd"
                      :disabled="abnormalSwitch"
                      v-model="abnormalForm.errorEndDatetime"
                      style="width: 100%;"></el-date-picker>
              </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleAbnormalSubmit">确定</el-button>
            <el-button @click="handleAbnormalCancel">取消</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
import { queryByprojectId, saveScheduleFileByproject, deleteProjectSchedule, updateProjectSchedule, saveEsintProjectScheduleFile, deleteEsintProjectScheduleFile, operationErrorNotes, queryErrorDict, quertProjectErrors, downloadEsintProjectScheduleFile } from '@/api/tasks'
export default {
  name: 'approval',
  components: {

  },
  props: {},
  data () {
    return {
      url: process.env.VUE_APP_BASE_API, // url前缀
      headers: {}, // 上传文件的headers
      flag: '',
      abnormalSwitch: true,
      abnormalVisible: false,
      projectName: '', // 项目名称
      errorCode: [], // 异常状态的下拉列表
      abnormalForm: {
        errorStatus: '',
        errorMoney: '',
        errorBeginDatetime: '',
        errorEndDatetime: ''
      },
      abnormalRecording: [],
      progress: 0,
      oldProgress: 0,
      disabledProgress: true,
      minProgress: 0,
      maxProgress: 100,
      fileList: [],
      dataDictionaryResultList: [], // 全部进度字典列表
      queryProjectSchedule: [], // 已经进行的项目进度
      // startUpProcess: [], // 启动过程
      // planningProcess: [], // 规划过程
      // carriedOutProcess: [], // 执行过程
      // monitorProcess: [], // 监控过程
      // endingProcess: [], // 收尾过程
      dbcpBazmFilePath: '', // 定级备案证明
      projectManagerName: '', // 项目经理
      startUp: {}, // 项目启动
      appointment: {}, // 项目经理任命
      research: {}, // 项目前期调研
      planning: {}, // 项目规划
      implement: {}, // 项目现场实施
      ending: {}, // 项目现场收尾
      update: {}, // 项目过程更新
      summary: {}, // 项目绩效汇总
      monthlySummary: {}, // 月度绩效统计
      externalAcceptance: {}, // 外部项目验收
      internalAcceptance: {}, // 内部项目验收
      dictionary: { // 字典数据
        startUp: {}, // 项目启动
        appointment: {}, // 项目经理任命
        research: {}, // 项目前期调研
        planning: {}, // 项目规划
        implement: {}, // 项目现场实施
        ending: {}, // 项目现场收尾
        update: {}, // 项目过程更新
        summary: {}, // 项目绩效汇总
        monthlySummary: {}, // 月度绩效统计
        externalAcceptance: {}, // 外部项目验收
        internalAcceptance: {} // 内部项目验收
      },
      recordingFile: [], // 会议记录文件
      informationSystemFile: [], // 信息系统基本情况调研表
      planningFile: [], // 项目规划文件
      implementFile: [], // 项目现场实施文件
      endingFile: [], // 项目现场收尾文件
      updateFile: [], // 组织过程资产更新文件
      summaryFile: [], // 项目情况汇总文件
      monthlySummaryFile: [], // 月度绩效统计文件
      externalAcceptanceFile: [], // 外部项目验收文件
      rules: {
        errorStatus: [
          { required: true, message: '请选择异常状态', trigger: 'change' }
        ],
        errorMoney: [
          { required: true, message: '请输入异常金额', trigger: 'blur' },
          { pattern: /(?:^[1-9]([0-9]+)?(?:\.[0-9]{1,2})?$)|(?:^(?:0){1}$)|(?:^[0-9]\.[0-9](?:[0-9])?$)/, message: '请输入正确金额', trigger: 'blur' }
        ],
        errorBeginDatetime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        errorEndDatetime: [
          { required: true, message: '请选择解决时间', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
  },
  mounted () {
    this.getQueryByprojectId()
    this.getToke()
    this.queryErrorDict()
  },
  methods: {
    goBack() {
      this.$router.back(-1)
    },
    getToke() {
      this.headers = {
        'X-Access-Token': window.sessionStorage.getItem('token'),
        'Access-Control-Allow-Origin': '*'
      }
    },
    async queryErrorDict() {
      const data = await queryErrorDict()
      this.errorCode = data.result.errorCode
      console.log(data)
    },
    async getQueryByprojectId() {
      this.startUp = {} // 项目启动
      this.appointment = {} // 项目经理任命
      this.research = {} // 项目前期调研
      this.planning = {} // 项目规划
      this.implement = {} // 项目现场实施
      this.ending = {} // 项目现场收尾
      this.update = {} // 项目过程更新
      this.summary = {} // 项目绩效汇总
      this.monthlySummary = {} // 月度绩效统计
      this.externalAcceptance = {} // 外部项目验收
      this.internalAcceptance = {} // 内部项目验收
      this.recordingFile = [] // 会议记录文件
      this.informationSystemFile = [] // 信息系统基本情况调研表
      this.planningFile = [] // 项目规划文件
      this.implementFile = [] // 项目现场实施文件
      this.endingFile = [] // 项目现场收尾文件
      this.updateFile = [] // 组织过程资产更新文件
      this.summaryFile = [] // 项目情况汇总文件
      this.monthlySummaryFile = [] // 月度绩效统计文件
      this.externalAcceptanceFile = [] // 外部项目验收文件
      const data = await queryByprojectId({ projectId: this.$route.query.id })
      console.log('queryByprojectId', data.data.result)
      this.progress = Number(data.data.result.esintProject.progress) // 项目进度（进度条）
      this.oldProgress = Number(data.data.result.esintProject.progress) // 项目进度（进度条）备份
      if (data.data.result.esintProject.stagnateStateExplain == '0') { // 异常状态 0 正常 -1 异常
        this.abnormalSwitch = true
      } else if (data.data.result.esintProject.stagnateStateExplain == '-1') {
        this.abnormalSwitch = false
      }
      const { dataDictionaryResultList, queryProjectSchedule } = data.data.result.schedule
      this.dbcpBazmFilePath = data.data.result.Submission.dbcpBazmFilePath
      this.projectManagerName = data.data.result.esintProject.projectManagerName
      this.projectName = data.data.result.Submission.projectName
      this.dataDictionaryResultList = dataDictionaryResultList // 字典
      this.queryProjectSchedule = queryProjectSchedule // 数据
      dataDictionaryResultList.forEach((item) => { // 字典数组
        item.esintDataDictionaryList.forEach((element) => { // 字典数组中的子级数组
          queryProjectSchedule.forEach((value, index) => { // 数据数组
            if (item.esintDataDictionary.dcCode == value.parentStageId) {
              if (element.dcCode == value.subStageId) {
                value['isStyle'] = true
                value['btnIsDisable'] = false
                value['index'] = index
                if (index == queryProjectSchedule.length - 1) {
                  value['btnIsDisable'] = true
                  console.log(element.dcName, value.btnIsDisable)
                }
                console.log(value.isStyle, value.btnIsDisable)
                // console.log(index, queryProjectSchedule.length)
                // console.log(element.dcName, value.btnIsDisable)
                if (element.dcName == '项目启动') {
                  this.startUp = value
                } else if (element.dcName == '项目经理任命') {
                  this.appointment = value
                } else if (element.dcName == '项目前期调研') {
                  this.research = value
                  value.scheduleFileList.forEach((data) => {
                    if (data.fileClassification == '1') { // 会议记录
                      this.recordingFile.push({
                        name: data.fileOriginalName,
                        url: data.fileUrl,
                        id: data.id,
                        type: '1'
                      })
                    } else if (data.fileClassification == '2') { // 信息系统基本情况调研表
                      this.informationSystemFile.push({
                        name: data.fileOriginalName,
                        url: data.fileUrl,
                        id: data.id,
                        type: '2'
                      })
                    }
                  })
                } else if (element.dcName == '项目规划') {
                  this.planning = value
                  value.scheduleFileList.forEach((data) => {
                    this.planningFile.push({
                      name: data.fileOriginalName,
                      url: data.fileUrl,
                      id: data.id
                    })
                  })
                } else if (element.dcName == '项目现场实施') {
                  this.implement = value
                  value.scheduleFileList.forEach((data) => {
                    this.implementFile.push({
                      name: data.fileOriginalName,
                      url: data.fileUrl,
                      id: data.id
                    })
                  })
                } else if (element.dcName == '项目现场收尾') {
                  this.ending = value
                  value.scheduleFileList.forEach((data) => {
                    this.endingFile.push({
                      name: data.fileOriginalName,
                      url: data.fileUrl,
                      id: data.id
                    })
                  })
                } else if (element.dcName == '项目过程更新') {
                  this.update = value
                  value.scheduleFileList.forEach((data) => {
                    this.updateFile.push({
                      name: data.fileOriginalName,
                      url: data.fileUrl,
                      id: data.id,
                      type: '3'
                    })
                  })
                } else if (element.dcName == '项目绩效汇总') {
                  this.summary = value
                  value.scheduleFileList.forEach((data) => {
                    this.summaryFile.push({
                      name: data.fileOriginalName,
                      url: data.fileUrl,
                      id: data.id
                    })
                  })
                } else if (element.dcName == '月度绩效汇总') {
                  this.monthlySummary = value
                  value.scheduleFileList.forEach((data) => {
                    this.monthlySummaryFile.push({
                      name: data.fileOriginalName,
                      url: data.fileUrl,
                      id: data.id
                    })
                  })
                } else if (element.dcName == '外部项目验收') {
                  console.log(item.esintDataDictionary.dcCode, element.dcCode)
                  this.externalAcceptance = value
                  value.scheduleFileList.forEach((data) => {
                    this.externalAcceptanceFile.push({
                      name: data.fileOriginalName,
                      url: data.fileUrl,
                      id: data.id
                    })
                  })
                } else if (element.dcName == '内部项目验收') {
                  this.internalAcceptance = value
                }
              }
            }
          })
          if (element.dcName == '项目启动') {
            this.dictionary.startUp = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '项目经理任命') {
            this.dictionary.appointment = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '项目前期调研') {
            this.dictionary.research = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '项目规划') {
            this.dictionary.planning = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '项目现场实施') {
            this.dictionary.implement = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '项目现场收尾') {
            this.dictionary.ending = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '项目过程更新') {
            this.dictionary.update = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '项目绩效汇总') {
            this.dictionary.summary = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '月度绩效汇总') {
            this.dictionary.monthlySummary = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '外部项目验收') {
            this.dictionary.externalAcceptance = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          } else if (element.dcName == '内部项目验收') {
            this.dictionary.internalAcceptance = {
              parentStageId: item.esintDataDictionary.dcCode,
              subStageId: element.dcCode
            }
          }
        })
      })
      this.getquertProjectErrors()
    },
    ProgressAdjust(dictionary, projectSchedule, currentProgress, previousProgress) {
      console.log('projectSchedule', projectSchedule)
      if (Object.keys(projectSchedule).length > 0) {
        this.deleteProjectSchedule(dictionary, projectSchedule, previousProgress)
      } else {
        this.saveScheduleFileByproject(dictionary, currentProgress)
      }
    },
    async saveScheduleFileByproject(dictionary, currentProgress) { // 添加进度
      let params
      if (dictionary.parentStageId == '300101' && dictionary.subStageId == '30010103') {
        params = {
          parentStageId: dictionary.parentStageId,
          subStageId: dictionary.subStageId,
          projectId: this.$route.query.id,
          stageStatus: '1',
          speedProgress: currentProgress
        }
      } else if (dictionary.parentStageId == '300105' && dictionary.subStageId == '30010501') {
        params = {
          parentStageId: dictionary.parentStageId,
          subStageId: dictionary.subStageId,
          projectId: this.$route.query.id,
          stageStatus: '1',
          speedProgress: currentProgress
        }
      } else {
        params = {
          parentStageId: dictionary.parentStageId,
          subStageId: dictionary.subStageId,
          projectId: this.$route.query.id,
          speedProgress: currentProgress
        }
      }
      const data = await saveScheduleFileByproject(params)
      this.message(data)
      this.getQueryByprojectId()
    },
    async deleteProjectSchedule(dictionary, projectSchedule, previousProgress) { // 删除进度
      let superiorSuperclassScheduleCode // 父节点
      let superiorsubclassScheduleCode // 子节点
      this.queryProjectSchedule.forEach((item, index) => {
        console.log('queryProjectSchedule', this.queryProjectSchedule[index])
        if (item.subStageId == projectSchedule.subStageId) {
          if (index == 0) {
            superiorSuperclassScheduleCode = '0'
            superiorsubclassScheduleCode = '0'
          } else {
            superiorSuperclassScheduleCode = this.queryProjectSchedule[index - 1].parentStageId
            superiorsubclassScheduleCode = this.queryProjectSchedule[index - 1].subStageId
          }
        }
      })
      let params = {
        superiorSuperclassScheduleCode,
        superiorsubclassScheduleCode,
        projectId: this.$route.query.id,
        speedProgress: previousProgress,
        projectScheduleId: projectSchedule.id
      }
      const data = await deleteProjectSchedule(params)
      this.message(data)
      this.getQueryByprojectId()
    },
    adjustmentProjectSchedule() {
      let params = {
        projectId: this.$route.query.id,
        speedProgress: this.progress
      }
      console.log(params)
      clearTimeout(this.flag)
      this.flag = setTimeout(async () => {
        const data = await updateProjectSchedule(params)
        this.message(data)
        this.getQueryByprojectId()
      }, 500)
    },
    handleProgress(changedValue) {
      console.log(this.oldProgress, this.progress, changedValue)
      if (this.oldProgress < 15) {
        this.disabledProgress = true
      } else if (this.oldProgress >= 15 && this.oldProgress < 60) {
        this.disabledProgress = false
        if (this.progress <= 15) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 15
          }, 1)
        } else if (this.progress >= 60) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 59
          }, 1)
        }
      } else if (this.oldProgress >= 60 && this.oldProgress < 70) {
        this.disabledProgress = false
        if (this.progress <= 60) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 60
          }, 1)
        } else if (this.progress >= 70) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 69
          }, 1)
        }
      } else if (this.oldProgress >= 70 && this.oldProgress < 90) {
        this.disabledProgress = false
        if (this.progress <= 70) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 70
          }, 1)
        } else if (this.progress >= 90) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 89
          }, 1)
        }
      } else if (this.oldProgress >= 90 && this.oldProgress < 95) {
        this.disabledProgress = false
        if (this.progress <= 90) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 90
          }, 1)
        } else if (this.progress >= 95) {
          clearTimeout(this.flag)
          this.flag = setTimeout(() => {
            this.progress = 94
          }, 1)
        }
      } else if (this.oldProgress >= 95) {
        this.disabledProgress = true
      }
    },
    async beforeRemove(file, fileList) {
      let params = {
        fileId: file.id
      }
      // type 文件分类，用于区分一个子类下多个上传按钮的情况（1：会议记录 2：信息系统基本情况调研表，3：测评报告）
      if (file.type == '1' || file.type == '2'|| file.type == '3') {
        params['type'] = file.type
      }
      console.log('beforeRemove', params)
      const data = await deleteEsintProjectScheduleFile(params)
      console.log(data)
      this.getQueryByprojectId()
    },
    async onPreview(file) {
      console.log(file)
      // let params = {
      //   fileId: file.id
      // }
      // if (file.type == '1' || file.type == '2'|| file.type == '3') {
      //   params['type'] = file.type
      // }
      // const data = await downloadEsintProjectScheduleFile(params)
      // console.log(data)
    },
    onSuccess() {
      this.getQueryByprojectId()
    },
    handleSwitch() {
      this.abnormalSwitch = !this.abnormalSwitch // 保持switch点击前的状态
      this.abnormalForm.errorStatus = ''
      this.abnormalForm.errorMoney = ''
      this.abnormalForm.errorBeginDatetime = ''
      if (this.abnormalRecording.length > 0) {
        if (this.abnormalRecording[0].errorEndDatetime == '') {
          this.abnormalForm.errorStatus = this.abnormalRecording[0].errorStatus
          this.abnormalForm.errorMoney = this.abnormalRecording[0].errorMoney
          this.abnormalForm.errorBeginDatetime = this.abnormalRecording[0].errorBeginDatetime
        }
      }
      this.abnormalVisible = true
    },
    async handleAbnormalSubmit() {
      // errorCode 1-重新实施；2-增加实施 3-变更实施
      let errorStatusName
      this.errorCode.forEach((item) => {
        if (item.value == this.abnormalForm.errorStatus) {
          errorStatusName = item.title
        }
      })
      let params
      let validNum = 0; // 验证个数
      if (this.abnormalSwitch) {
        params = {
          errorStatusName,
          errorStatus: this.abnormalForm.errorStatus,
          errorMoney: this.abnormalForm.errorMoney,
          errorBeginDatetime: this.abnormalForm.errorBeginDatetime,
          projectId: this.$route.query.id
        }
        this.$refs['abnormalForm'].validateField(['errorStatus', 'errorMoney', 'errorBeginDatetime'], (valid) => {
          if (valid) {
            console.log(valid);
            validNum += 1;
            return false
          }
        })
      } else {
        params = {
          id: this.abnormalRecording[0].id,
          errorEndDatetime: this.abnormalForm.errorEndDatetime,
          projectId: this.$route.query.id
        }
        this.$refs['abnormalForm'].validateField(['errorEndDatetime'], (valid) => {
          if (valid) {
            console.log(valid);
            validNum += 1;
            return false
          }
        })
      }
      if (validNum == 0) {
        console.log(params)
        const data = await operationErrorNotes(params)
        this.$refs['abnormalForm'].resetFields();
        this.message(data)
        this.abnormalVisible = false
        this.getQueryByprojectId()
      }
    },
    handleAbnormalCancel() {
      this.abnormalVisible = false
      this.$refs['abnormalForm'].resetFields();
    },
    async getquertProjectErrors() {
      const data = await quertProjectErrors({ projectId: this.$route.query.id })
      this.abnormalRecording = data.result
      console.log(data)
    },
    message(data) { // 消息提示
      if (data.code == '0' || data.code == '200') {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          });
        } else {
          this.$message.error(data.message);
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .row{
    height: 40px;
    .lable{
      text-align: right;
      color: #989fb1;
      font-size: 14px;
      padding-right: 20px !important;
    }
    // .progressVlaue{
    //   font-size: 16px;
    //   color:#5091ee;
    //   font-weight: 700;
    // }
    .timeline{
      position: relative;
      border-left: 3px solid #d8d7d7;
      padding-left: 40px;
      .processBox{
        margin-bottom: 20px;
        .icon{
          position: absolute;
          font-size: 30px;
          color:#4877e6;
          background-color: #fff;
          border-radius: 50%;
          left: -2px;
          transform: translate(-50%,-10px);
          border: 5px solid #99acfc73;
          // box-shadow: 0px 0px 20px #4877e6;
          // margin-left: -15px;
        }
        .yuan{
          display: block;
          position: absolute;
          left: -2px;
          transform: translate(-50%,-10px);
          border-radius: 50%;
          border: 5px solid #adb2bd65;
          background-color: #fff;
          span{
            display: block;
            // position: absolute;
            // left: 0;
            // transform: translate(-50%,-10px);0
            width: 25px;
            height: 25px;
            border-radius: 50%;
            border: 5px solid #adb2bd;
          }
        }
        .title{
          font-size: 20px;
          font-weight: 700;
        }
        // 按钮未禁用样式
        .processRowBox{
          margin: 20px 0;
          .processBtn{
           min-width: 100%;
           background-image: linear-gradient(to right,#56baf9, #4877e8);
           color: #fff;
          }
          .processBtnDisabled{
           min-width: 100%;
           background-image: linear-gradient(to right,#56baf9, #4877e8);
           color: #fff;
          }
          .card{
            position: relative;
            font-size: 16px;
            padding: 10px 30px;
            border: 1px solid #e5e7ec;
            border-radius: 3px;
            background-color: #f9f9f9;
            &::before {
              content: '';
              top:-5px;
              left: 0;
              margin-left: -7px;
              border-bottom-color: #f9f9f9;
              display: block;
              width: 13px;
              height: 13px;
              position: absolute;
              top: 10px;
              left: 0px;
              border-bottom: 1px solid #e5e7ec;
              border-left: 1px solid #e5e7ec;
              background-color: #f9f9f9;
              transform:translate(-10%) rotate(45deg)
            }
            .cardTitle{
              color: #939bae;
              text-align: right;
            }
            .upload{
              margin: 10px 0;
              .el-upload__tip{
                font-size: 14px;
                color: #5a8bff;
              }
            }
          }
        }
        // 按钮禁用后样式
        .processRowBoxDisabled{
          margin: 20px 0;
          .processBtn{
           min-width: 100%;
           background-color: #f0f3fa;
           color: #000;
          }
          .processBtnDisabled{
           min-width: 100%;
           background-color: #f0f3fa;
           color: #9a9a9b;
          }
          .card{
            position: relative;
            font-size: 16px;
            padding: 10px 30px;
            border: 1px solid #e5e7ec;
            border-radius: 3px;
            background-color: #f9f9f9;
            &::before {
              content: '';
              top:-5px;
              left: 0;
              margin-left: -7px;
              border-bottom-color: #f9f9f9;
              display: block;
              width: 13px;
              height: 13px;
              position: absolute;
              top: 10px;
              left: 0px;
              border-bottom: 1px solid #e5e7ec;
              border-left: 1px solid #e5e7ec;
              background-color: #f9f9f9;
              transform:translate(-10%) rotate(45deg)
            }
            .cardTitle{
              color: #939bae;
              text-align: right;
            }
            .upload{
              margin: 10px 0;
              .el-upload__tip{
                font-size: 14px;
                color: #9da4b6;
              }
            }
          }
        }
        // 项目助理审批记录样式
        .auditRecord{
          border: 1px solid #b5c8f5;
          background-color: #dfe8fb;
          padding: 10px 30px;
          border-radius: 3px;
          h3{
            font-size: 16px;
            font-weight: 700;
            color:#4877e6;
            margin-bottom: 15px;;
          }
          .firstContent{
            font-weight: 700;
          }
          .otherContent{
            font-weight: 700;
            span{
              color: #9da5b8;
            }
          }
          .scheduleApproval{
            span{
              padding: 10px;
            }
          }
        }

      }
    }
  }
  .projectStatus{
    margin-top: 30px;
  }
// 项目异常记录样式
.exceptionRecordCard{
  padding: 20px 40px;
  .exceptionRecord{
    border: 1px solid #dee0e7;
    background-color: #f9f9f9;
    border-radius: 3px;
    padding: 10px 25px;
    font-size: 14px;
    .exceptionRecordRow{
      margin: 20px;
      .lable{
        color: #a3a9ba;
      }
      .content{
        color: #6e6e6e;
      }
    }
  }
}
// 无异常记录
.noRecord{
  p{
    font-size: 16px;
    text-align: center;
    padding: 20px;
  }
}
</style>

<style lang="scss">
// 进度条样式修改
.progressBar{
  .el-slider {
    .el-slider__input {
      margin-top: 0;
    }
    .el-slider__runway {
      height: 15px;
      border-radius: 50px;
      margin-top: 8px;
      margin-bottom: 0 !important;
      background-color: #dfe2ea;
      border: 1px solid #DCDFE6;
      .el-slider__bar {
        height: 14px;
        border-radius: 50px 0 0 50px;
        background-image: linear-gradient(to left,#56baf9, #4877e8);
      }
      .el-slider__button-wrapper {
        top: 50%;
        height: 15px;
        border-radius: 50px;
        .el-slider__button {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #FFFFFF;
          border:4px solid #96d5fc;
          transform: translateY(-50%);
        }
        .el-slider__button:hover{
          transform: translateY(-50%) scale(1.2)
        }
      }
      .el-slider__stop {
        width: 1px;
        height: 26px;
        border-radius: 100px;
        background-color: #DCDFE6;
      }
      .el-slider__marks-text {
        color: #717171;
        margin-top: 0;
        transform: translateX(-115%);
      }
    }
  }
}
  .el-input-number {
    width: 110px;
    margin-right: 20px;
  }
// 时间线样式修改
.auditRecord{
  .el-timeline-item__tail{
    border-left: 2px solid #939bae;
  }
}
// 弹窗样式修改
.abnormalForm{
  .el-select{
    margin-bottom: 0;
    width: 100%;
  }
}
</style>
