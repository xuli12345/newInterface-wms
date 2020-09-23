<template>
  <div>
    <div class="btns">
      <!-- <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="addPopRight"
        :disabled="isDisabled"
        >筛选</el-button
      > -->
      <!-- <el-button
        type="primary"
        :disabled="isDisabled"
        class="iconfont icon-ziyuan"
        size="mini"
        >排车</el-button
      > -->
      <el-button
        type="primary"
        class="iconfont icon-danju"
        @click="createNotice"
        size="mini"
        :disabled="isDisabled"
        >生成拣货单</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        :disabled="isDisabled"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        :disabled="isDisabled"
        size="mini"
        @click="resetForm()"
        >取消</el-button
      >
    </div>
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
      :fState="fState"
    ></child-form-head>
    <!-- 表格 -->
    <el-alert
      title="请双击表格中的内容查看货品信息!"
      type="warning"
      :closable="false"
    ></el-alert>

    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="配货信息" name="first">
        <child-table
          ref="childTable"
          :fTableView="fTableViewItem"
          :insertData="insertData"
          :isDisabled="isDisabled"
          :fID="rowData.fID"
          :fState="fState"
          @openEditDrawer="openEditDrawer"
        ></child-table>
      </el-tab-pane>
      <el-tab-pane label="错误日志" name="second">
        <ErrorTable
          :ishow="false"
          :fTableView="'t_JobErrorLog'"
          :tableData="tableData"
        ></ErrorTable>
      </el-tab-pane>
    </el-tabs>
    <!-- 筛选 -->
    <!-- 
    <el-dialog
      :title="openTitle"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="true"
    >
      <alert-table
        @closeBox="closeItemBox"
        :fTableView="fTableViewAlert[0]"
        :searchData="searchData"
      ></alert-table>
    </el-dialog> -->
    <!-- 货品从表的从表 -->
    <el-drawer
      :modal="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <JobEditTable
        ref="ItemData"
        fTableView="t_JobProduct_Item"
        :ItmeSelID="ItmeSelID"
      ></JobEditTable>
    </el-drawer>
    <!-- 生成拣货单 -->
    <el-dialog :append-to-body="true" title="拣货单" :visible.sync="dialogForm">
      <CreatFrom
        :selectArr="selectArrD"
        :fID="rowData.fID"
        :tableHead="DialogTableHead"
        ref="ruleForm"
      ></CreatFrom>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogForm = false">取 消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { handelData } from "@/utils/common";
import { collectionData, DistributeJob, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "@/components/EditChildFormHead";
import ChildTable from "./EditChildTable";
import ErrorTable from "./ChildTable";
import AlertTable from "./AlertTable";
import JobEditTable from "./JobEditTable";
import CreatFrom from "./CreatFrom";
export default {
  //弹出框请求的表头字段fTableViewAlert searchData:搜索的字段
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "rowData",
    "fTableViewAlert",
    "searchData"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    AlertTable,
    JobEditTable,
    CreatFrom,
    ErrorTable
  },
  data() {
    return {
      drawer: false,
      newisDestory: false,
      dialogForm: false,
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      userId: JSON.parse(sessionStorage.getItem("user")).userId,
      DialogTableHead: [
        {
          fColumn: "OrderType",
          fColumnDes: "单据类型名称",
          fVisible: 1
        },
        {
          fColumn: "Warehouse",
          fColumnDes: "仓库名称",
          fVisible: 1
        },
        {
          fColumn: "fID",
          fColumnDes: "ID",
          fVisible: 1
        },
        {
          fColumn: "PickingPlanID",
          fColumnDes: "拣货位方案名称",
          fVisible: 1
        }
      ],
      selectArrD: [
        {
          fName: "OrderType",
          fUrl: "v_Type_OutboundOrder",
          fDes: "fTypeName",
          fID: "fID"
        },
        {
          fName: "Warehouse",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID"
        },
        {
          fName: "PickingPlanID",
          fUrl: "v_PickingPlan_Mst",
          fDes: "fPlanName",
          fID: "fID"
          //fAuto: ["fState"],
          //fAutoID: ["fState"]
        }
      ],
      //表格添加的数据
      insertData: {},
      //错误日志的数据
      tableData: [],
      dialogFormVisible: false,
      openTitle: "选择货品",
      fMstID: "",
      isDisabled: false,
      fState: 5,
      //从表定单号
      ItmeSelID: "",
      activeName: "first"
    };
  },
  methods: {
    handleClick(tab, event) {
      if (this.activeName == "second") {
        this.getErrorData();
      } else if (this.activeName == "first") {
      }
    },
    openEditDrawer(row) {
      this.ItmeSelID = row.fID;
      this.drawer = true;
    },

    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据

      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      this.fMstID = this.$refs.ruleForm.ruleForm.fID; //字表添加数据时,需要手动添加的键
      // backData.forEach(element => {
      //   for (const key in element) {
      //     if (element[key] == null) {
      //       this.$set(element, key, 0);
      //     }
      //   }
      // });
      // tableData.forEach(element => {
      //   for (const key in element) {
      //     if (element[key] == null) {
      //       this.$set(element, key, 0);
      //     }
      //   }
      // });

      let wantData = handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      if (insertArr && insertArr.length > 0) {
        insertArr.forEach(element => {
          element.fMstID = this.fMstID;
        });
      }

      let deletedArr = wantData[2];
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: formHeadData
            },
            {
              TableName: this.fTableViewItem[0],
              updateData: updateArr,
              insertData: insertArr,
              deleteData: deletedArr,
              headData: childTableData
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("修改成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.Message);
          }
        }
      });
    },
    //取消
    resetForm() {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //新增按钮
    addPopRight() {
      this.dialogFormVisible = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        this.insertData = value;
      }
      this.dialogFormVisible = false;
    },
    //生成补货/拣货单
    createNotice() {
      this.dialogForm = true;
    },
    async save() {
      let ruleForm = this.$refs.ruleForm.ruleForm;

      if ("PickingPlanID" in ruleForm) {
      } else {
        this.$set(ruleForm, "PickingPlanID", "");
      }
      let res = await DistributeJob([
        {
          OrderType: ruleForm.OrderType,
          Warehouse: ruleForm.Warehouse,
          fID: ruleForm.fID,
          PickingPlanID: ruleForm.PickingPlanID
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.$message.success("保存成功!");
        this.dialogForm = false;
      } else {
        this.$message.warning(res.Message);
      }
    },
    //获取错误日志的数据
    async getErrorData() {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: this.rowData.fID
        }
      ];
      let res = await getTableBodyData("v_JobErrorLog", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
      }
    }
  },
  watch: {
    drawer: function(val, old) {
      // console.log(val, old);
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
    }
  },
  created() {
    if (this.rowData.fState && this.rowData.fState == 5) {
      this.isDisabled = true;
    }
  }
};
</script>

<style></style>
