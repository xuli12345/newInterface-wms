<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        size="mini"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
        >取消</el-button
      >
    </div>
    <!-- form表格 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 子表格数据    -->
    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-button
        style="margin-bottom:10px"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng"
        @click="addPopRight"
        >新增</el-button
      >
      <el-tab-pane label="内部配件" name="first">
        <ItemTable
          :tableHeadData="tableHeadData"
          :ItemTableData="tableData"
        ></ItemTable>
      </el-tab-pane>
      <el-tab-pane label="外部配件" name="second">
        <ItemTable
          :tableHeadData="outHeadData"
          :ItemTableData="outTableData"
        ></ItemTable>
      </el-tab-pane>
      <el-tab-pane label="维修内容" name="third">
        <!-- 子表格数据  -->

        <ItemTable
          :tableHeadData="contentHeadData"
          :ItemTableData="contentTableData"
        ></ItemTable>
      </el-tab-pane>
    </el-tabs>
    <!-- 新增字表数据 -->
    <el-drawer
      :modal="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <child-form-head
        @closeBox="closeItemBox"
        :fTableViewHead="fItemTableView"
        ref="ItemRuleForm"
        :selectArr="selectArr2"
        :addItem="addItem"
      ></child-form-head>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData, getTableHeadData } from "@/api/index";
import ItemTable from "./ItemTable";
import { compare } from "@/utils/common";
import ChildFormHead from "../../components/ChildFormHead";
export default {
  components: {
    ItemTable,
    ChildFormHead
  },
  props: {
    fTableViewHead: {
      type: Array,
      default: () => []
    },
    fTableViewItem: {
      type: Array,
      default: () => []
    },
    selectArr: {
      type: Array,
      default: () => []
    },
    selectArr2: {
      type: Array,
      default: () => []
    },

    tableName: {
      type: String,
      default: () => ""
    },
    addItem: {
      type: Boolean,
      default: () => false
    }
  },
  watch: {
    drawer(newval, oldval) {
      setTimeout(() => {
        this.newisDestory = newval;
      }, 10);
    }
  },
  data() {
    return {
      drawer: false,
      activeName: "first",
      //新增从表表头字段
      fItemTableView: "",
      //form表单头部数据
      tableHead: [],
      //内部字表表头
      tableHeadData: [],
      //外部
      outHeadData: [],
      //内容
      contentHeadData: [],
      //内部表体数据
      tableData: [],
      //外部配件表体数据
      outTableData: [],
      //内容表体数据
      contentTableData: [],
      newisDestory: false,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },

  methods: {
    submitForm(formName) {
      let formData = this.$refs.ruleForm.ruleForm;
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          // //权限表
          let res = await collectionData(
            //insert新建，update修改，delete删除
            [
              //主表
              {
                TableName: this.fTableViewHead[0],
                insertData: [formData],
                headData: this.tableHead,
                IdentityColumn: this.fTableViewHead[1]
              },
              {
                TableName: this.fTableViewItem[0],
                insertData: this.tableData,
                headData: this.tableHeadData,
                IdentityColumn: this.fTableViewItem[3]
              },
              {
                TableName: this.fTableViewItem[1],
                insertData: this.outTableData,
                headData: this.outHeadData,
                IdentityColumn: this.fTableViewItem[3]
              },
              {
                TableName: this.fTableViewItem[2],
                insertData: this.contentTableData,
                headData: this.contentHeadData,
                IdentityColumn: this.fTableViewItem[3]
              }
            ]
          );
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.State);
            // this.$refs.formBox.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      // this.$refs.formBox.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },

    //获取表格头部数据
    async getTableHead() {
      let res = await getTableHeadData(this.fItemTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        if (this.fItemTableView == this.fTableViewItem[0]) {
          this.tableHeadData = res.lstRet.sort(compare);
        } else if (this.fItemTableView == this.fTableViewItem[1]) {
          this.outHeadData = res.lstRet.sort(compare);
        } else if (this.fItemTableView == this.fTableViewItem[2]) {
          this.contentHeadData = res.lstRet.sort(compare);
        }
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //tabs
    handleClick(activeName) {
      if (activeName == "first") {
        this.fItemTableView = this.fTableViewItem[0];
        this.getTableHead();
      } else if (activeName == "second") {
        this.fItemTableView = this.fTableViewItem[1];
        this.getTableHead();
      } else if (activeName == "third") {
        this.fItemTableView = this.fTableViewItem[2];
        this.getTableHead();
      }
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },

    //新增
    addPopRight() {
      this.drawer = true;
    },
    //关闭字表新增弹窗
    closeItemBox(value, fTableView) {
    //  console.log(value,fTableView,this.fTableViewItem[0])
      if (value && fTableView == this.fTableViewItem[0]) {
         
        value.fSort = this.tableData.length + 1;
        this.tableData.unshift(value);
      } else if (value && fTableView == this.fTableViewItem[1]) {
        value.fSort = this.outTableData.length + 1;
        this.outTableData.unshift(value);
      } else if (value && fTableView == this.fTableViewItem[2]) {
        value.fSort = this.contentTableData.length + 1;
        this.contentTableData.unshift(value);
      }
      this.drawer = false;
    }
  },
  created() {
    this.fItemTableView = this.fTableViewItem[0];
    this.getTableHeadData();
    this.getTableHead();
  }
};
</script>
<style lang="scss" scoped>
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
</style>
