<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="addPopRight"
        :disabled="isDisabled"
        >库存筛选</el-button
      >
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-gengxin "
        @click="updateKucun"
        :disabled="isDisabled"
        >盘点更新库存</el-button
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
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :isDisabled="isDisabled"
      :fID="rowData.fID"
    ></child-table>
    <!-- 新增字表数据 -->
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
  </div>
</template>

<script>
import { compare, batchDelete, handelData } from "@/utils/common";
import { getTableHeadData, collectionData, saveStockAdjust } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "../../components/EditChildFormHead";
import ChildTable from "../../components/EditChildTable";
import alertTable from "./alertTable";
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
    alertTable
  },
  data() {
    return {
      kucHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      userId: JSON.parse(sessionStorage.getItem("user")).userId,
      drawer: false,
      //表格添加的数据
      insertData: {},
      dialogFormVisible: false,
      openTitle: "选择货品",
      fMstID: "",

      isDisabled: false
    };
  },
  methods: {
    //保存
    submitForm() {
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
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
          //   console.log(res)
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
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
    //设置盘点更新库存表头
    async kucunHeadData() {
      let res = await getTableHeadData("t_Stock_Adjust");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.kucHeadData = res.lstRet.sort(compare);
        console.log(this.kucHeadData, "盘点更新库存表头");
      }
    },
    //盘点更新库存
    async updateKucun() {
      let tableData = this.$refs.childTable.tableData; //表格的数据
      //  console.log(tableData, "回显的数据");
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      let newArr = tableData.map(item => {
        return {
          fID: item.fID,
          fStockID: item.fStockID,
          fProductCode: item.fProductCode,
          fProductName: item.fProductName,
          fStockNum: item.fStockNum,
          fOriginalNum: item.fStockNum,
          fAfterNum: item.fCheckNum,
          fRemark: item.fRemark,
          fCreater: userInfo.userId,
          fCreaterCode: userInfo.usercode,
          fCreateDate: new Date(),
          fModifier: userInfo.userId,
          fModifierCode: userInfo.usercode,
          fModifyDate: new Date()
        };
      });
      let result = batchDelete(this.kucHeadData, newArr);
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let ruleForm = this.$refs.ruleForm.ruleForm; //表单数据
      ruleForm.fMstState = 7;
      let data = batchDelete(formHeadData, [ruleForm]);
      let res = await saveStockAdjust([
        {
          lstSaveData: [
            {
              TableName: "t_Stock_Adjust",
              IdentityColumn: "fID",
              InsertRow: result.arr,
              UpdateRow: null,
              DeleteRow: null,
              Columns: result.columns
            },
            {
              TableName: "t_CheckOrder_Mst",
              IdentityColumn: "fID",
              InsertRow: null,
              UpdateRow: data.arr,
              DeleteRow: null,
              Columns: data.columns
            }
          ]
        },
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.$message.success("更新库存成功!");
        this.$emit("closeBox", res.State);
      } else {
        this.$message.error(res.Message);
      }
    }
  },
  created() {
    this.kucunHeadData();
    if (this.rowData.fMstState && this.rowData.fMstState == 7) {
      this.isDisabled = true;
    }
  }
};
</script>

<style></style>
