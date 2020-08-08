<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
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
    <EditChildFormHead
      :fTableViewHead="fTableViewHead[0]"
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
    ></EditChildFormHead>
    <!-- 子表格数据    -->
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
import { getTableHeadData, collectionData, tableBodyData } from "@/api/index";
import EditChildFormHead from "../../components/EditChildFormHead";
import ChildFormHead from "../../components/ChildFormHead";
import ItemTable from "./ItemTable";
import { compare } from "@/utils/common";

export default {
  components: {
    EditChildFormHead,
    ChildFormHead,
    ItemTable
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
    },
    rowData: {
      type: Object,
      default: () => {}
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
    //处理数据是修改的，还是新增的，还是删除的
    //传入的参数  （原来的数据，现在的数据）
    //返回一个数组，[修改，新增，删除]
    handelData(BackData, NowData) {
      let that = this;
      let Back = JSON.parse(JSON.stringify(BackData));
      let Now = JSON.parse(JSON.stringify(NowData));
      let update = [],
        insert = [],
        deleted = [],
        common = [];

      //获取原来的和现在的公有数据fMstID
      //公有数据就是修改的数据
      Back.forEach(item => {
        Now.forEach(child => {
          if (item.fMstID == child.fMstID) {
            common.push(child);
          }
        });
      });
      //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
      common.forEach(item1 => {
        Now.forEach((item2, idx2) => {
          if (item1.fMstID == item2.fMstID) {
            Now.splice(idx2, 1);
          }
        });
      });
      //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
      common.forEach(child1 => {
        Back.forEach((child2, idx2) => {
          if (child1.fMstID == child2.fMstID) {
            Back.splice(idx2, 1);
          }
        });
      });
      if (common.length < 1) {
        common = null;
      }
      if (Now.length < 1) {
        Now = null;
      }
      if (Back.length < 1) {
        Back = null;
      }
      return [common, Now, Back];
    },
    async submitForm(formName) {
      //ruleForm的值
      let formData = this.$refs.ruleForm.ruleForm;

      let InBackData = await this.getSearchItemData("v_Maintain_InsideParts");
      let OutBackData = await this.getSearchItemData("v_Maintain_OutsideParts");
      let ConBackData = await this.getSearchItemData("t_Maintain_Content");

      // console.log(this.tableData, "内部");
      // console.log(this.outTableData, "外部");
      // console.log(this.contentTableData, "内容");
      //内部数据
      let InData = this.handelData(InBackData, this.tableData);
      // console.log(InData);
      let InupdateArr = InData[0];
      let IninsertArr = InData[1];
      let IndeletedArr = InData[2];
      // 外部数据
      let OutData = this.handelData(OutBackData, this.outTableData);
      let OutupdateArr = OutData[0];
      let OutinsertArr = OutData[1];
      let OutdeletedArr = OutData[2];
      //内容数据
      let ConData = this.handelData(ConBackData, this.contentTableData);
      let ConupdateArr = ConData[0];
      let ConinsertArr = ConData[1];
      let CondeletedArr = ConData[2];
      if (ConinsertArr && ConinsertArr.length > 0) {
        ConinsertArr.forEach(ele => {
          ele.fMstID = this.rowData.fID;
        });
      }
      if (OutinsertArr && OutinsertArr.length > 0) {
        OutinsertArr.forEach(ele => {
          ele.fMstID = this.rowData.fID;
        });
      }
      if (IninsertArr && IninsertArr.length > 0) {
        IninsertArr.forEach(ele => {
          ele.fMstID = this.rowData.fID;
        });
      }

      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: this.tableHead
            },
            {
              TableName: this.fTableViewItem[0],
              updateData: InupdateArr,
              insertData: IninsertArr,
              deleteData: IndeletedArr,
              headData: this.tableHeadData
            },
            {
              TableName: this.fTableViewItem[1],
              updateData: OutupdateArr,
              insertData: OutinsertArr,
              deleteData: OutdeletedArr,
              headData: this.outHeadData
            },
            {
              TableName: this.fTableViewItem[2],
              updateData: ConupdateArr,
              insertData: ConinsertArr,
              deleteData: CondeletedArr,
              headData: this.contentHeadData
            }
          ]);

          res = JSON.parse(
            decryptDesCbc(res, String(this.userDes))
          );
          // console.log(res);
          if (res.State) {
            this.$message.success("修改成功!");
            this.$emit("closeBox",res.State);
          } else {
            this.$message.error(res.Message);
          }
        }
      });
    },
    resetForm(formName) {
      // this.$refs.formBox.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //获取字表表格头部数据
    async getTableHead(fTableViewItem) {
      let res = await getTableHeadData(fTableViewItem);

      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );

      if (res.State) {
        let headData = res.lstRet.sort(compare);

        return headData;
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //回显的数据

    async getSearchItemData(fTableViewData) {
      // v_UserGroupLimit_Company   v_GroupLimit_Mod
      let res = await tableBodyData([
        {
          Columns: "",
          OrderBy: "",
          SqlConn: this.sqlConn,
          TableView: fTableViewData,
          Where: [
            {
              Computer: "=",
              DataFile: "fMstID",
              Value: this.rowData.fID
            }
          ]
        },
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );

      if (res.State) {
        let result = JSON.parse(res.Data);
        return result;
      }
    },
    async handleClick(activeName) {
      if (activeName == "first") {
        this.fItemTableView = this.fTableViewItem[0];
      } else if (activeName == "second") {
        this.fItemTableView = this.fTableViewItem[1];
      } else if (activeName == "third") {
        this.fItemTableView = this.fTableViewItem[2];
      }
    },
    //关闭字表新增弹窗
    closeItemBox(value, fTableView) {
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
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //新增
    addPopRight() {
      this.drawer = true;
    }
  },

  async mounted() {
    this.fItemTableView = this.fTableViewItem[0];
    this.getTableHeadData();
    //获取回显的table数据
    this.tableData = await this.getSearchItemData("v_Maintain_InsideParts");
    this.outTableData = await this.getSearchItemData("v_Maintain_OutsideParts");
    this.contentTableData = await this.getSearchItemData("t_Maintain_Content");
    //获取字表表头数据
    this.tableHeadData = await this.getTableHead(this.fTableViewItem[0]);
    this.outHeadData = await this.getTableHead(this.fTableViewItem[1]);
    this.contentHeadData = await this.getTableHead(this.fTableViewItem[2]);
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
