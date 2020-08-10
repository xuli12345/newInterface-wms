<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="addPopRight"
        >库存筛选</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >保存</el-button
      >
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
        >取消</el-button
      >
    </div>
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
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
import { compare } from "@/utils/common";
import { getTableHeadData, collectionData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "../../components/ChildFormHead";
import ChildTable from "../../components/ChildTable";
import alertTable from "./alertTable";
export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "alertArr",
    "searchData",
    "fTableViewAlert"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    alertTable
  },
  data() {
    return {
      tableHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格数据
      tableData: [],
      //表格数据表头
      tableHead: [],
      dialogFormVisible: false,
      openTitle: "选择货品",
      insertData: []
    };
  },
  methods: {
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );
        console.log('res1',res)
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表格的表头
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );
        console.log('res2',res);
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: this.tableHeadData,
              IdentityColumn: this.fTableViewHead[1]
            },
            {
              TableName: this.fTableViewItem[0],
              insertData: this.tableData,
              headData: this.tableHead,
              IdentityColumn: this.fTableViewItem[1]
            }
          ]);
          res = JSON.parse(
            decryptDesCbc(res, String(this.userDes))
          );
          if (res.State === true) {
            this.$message.success("新增成功!");
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
      //   this.drawer = true;
      this.dialogFormVisible = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭子表新增弹窗
    closeItemBox(value) {
      if (value) {
        value.forEach(item => {
          this.$set(item, "fStockID", item.fID);
        });
        this.tableData = [...this.tableData, ...value];
        //动态将tableData中不存在的键添加
        this.tableData.forEach(item => {
          this.tableHead.forEach(ele => {
            for (const key in item) {
              if (item[ele.fColumn] == undefined) {
                this.$set(item, ele.fColumn, 0);
              }
            }
          });
        });
      }
      this.dialogFormVisible = false;
    }
  },


  created() {
    this.getTableHeadData();
    this.getTableHead();
  }
};
</script>

<style></style>
