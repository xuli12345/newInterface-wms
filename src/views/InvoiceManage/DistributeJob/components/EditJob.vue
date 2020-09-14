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
      <el-button
        type="primary"
        :disabled="isDisabled"
        class="iconfont icon-ziyuan"
        size="mini"
        >排车</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-danju"
        @click="createNotice"
        size="mini"
        :disabled="isDisabled"
        >生成补货单</el-button
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
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :isDisabled="isDisabled"
      :fID="rowData.fID"
      :fState="fState"
      @openEditDrawer="openEditDrawer"
    ></child-table>

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
    </el-dialog>
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
    <!-- 生成拣货单 :tableName="'t_OutboundOrder_Mst'"-->
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
import { compare, batchDelete, handelData } from "@/utils/common";
import {
  getTableHeadData,
  collectionData,
  saveStockAdjust,
  DistributeJob
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "@/components/EditChildFormHead";
import ChildTable from "./EditChildTable";
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
    "selectArr2",
    "rowData",
    "fTableViewAlert",
    "searchData"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    AlertTable,
    JobEditTable,
    CreatFrom
  },
  data() {
    return {
      tableHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      userId: JSON.parse(sessionStorage.getItem("user")).userId,
      drawer: false,
      newisDestory: false,
      dialogForm: false,
      // formLabelWidth: "120px",
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
        }
        //{
        //  fName: "fID",
        //  fUrl: "v_DistributeJob_Mst",
        //  fDes: "fID",
        //  fID: "fID"
        //  //fAuto: ["fState"],
        //  //fAutoID: ["fState"]
        //}
      ],
      //表格添加的数据
      insertData: {},
      //表格数据表头
      tableHead: [],
      dialogFormVisible: false,
      openTitle: "选择货品",
      fMstID: "",
      isDisabled: false,
      fState: 5,
      //从表定单号
      ItmeSelID: ""
    };
  },
  methods: {
    openEditDrawer(row) {
      this.ItmeSelID = row.fID;
      this.drawer = true;
    },
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表格的表头，保存的时候需要用到
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },

    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      this.fMstID = this.$refs.ruleForm.ruleForm.fID; //字表添加数据时,需要手动添加的键
      backData.forEach(element => {
        for (const key in element) {
          if (element[key] == null) {
            this.$set(element, key, 0);
          }
        }
      });
      tableData.forEach(element => {
        for (const key in element) {
          if (element[key] == null) {
            this.$set(element, key, 0);
          }
        }
      });

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
              headData: this.tableHeadData
            },
            {
              TableName: this.fTableViewItem[0],
              updateData: updateArr,
              insertData: insertArr,
              deleteData: deletedArr,
              headData: this.tableHead
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State === true) {
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
      let res = await DistributeJob([
        {
          OrderType: ruleForm.OrderType,
          Warehouse: ruleForm.Warehouse,
          fID: ruleForm.fID
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.$message.success("保存成功!");
        this.dialogForm=false;
      } else {
        this.$message.warning(res.Message);
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
    this.getTableHeadData();
    this.getTableHead();
    if (this.rowData.fState && this.rowData.fState == 5) {
      this.isDisabled = true;
    }
  }
};
</script>

<style></style>
