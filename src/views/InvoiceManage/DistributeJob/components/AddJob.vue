<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="addPopRight"
        >筛选</el-button
      >
      <!-- <el-button type="primary" class="iconfont icon-ziyuan" size="mini"
        >排车</el-button
      > -->

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
    <el-alert
      title="请双击表格中的内容选择对应的货品信息!"
      type="warning"
      :closable="false"
    >
    </el-alert>
    <child-table
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
      :ishow="true"
      @openEditDrawer="openEditDrawer"
      ref="childTable"
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
    <!-- 货品从表的从表 -->
    <el-drawer
      :modal="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <JobItemTable
        ref="ItemData"
        fTableView="t_JobProduct_Item"
        :ItmeOrderNO="ItmeOrderNO"
        @closeDrawer="closeDrawer"
      ></JobItemTable>
    </el-drawer>
  </div>
</template>

<script>
import { collectionData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "@/components/ChildFormHead";
import JobItemTable from "./JobItemTable";
import ChildTable from "./ChildTable";
import alertTable from "./AlertTable";

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
    alertTable,
    JobItemTable
  },
  data() {
    return {
      drawer: false,
      newisDestory: false,
      //表格数据
      tableData: [],
      dialogFormVisible: false,
      openTitle: "选择配货单",
      insertData: [],
      //从表定单号
      ItmeOrderNO: "",
      //从表中的货品信息字段
      selItemHead: [],
      selItemList: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  methods: {
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据

      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          if (this.selItemList.length == 0) {
            this.$message.warning("请选择货品信息!");
            return;
          }
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: formHeadData,
              IdentityColumn: this.fTableViewHead[1]
            },
            {
              TableName: this.fTableViewItem[0],
              insertData: this.tableData,
              headData: childTableData,
              IdentityColumn: this.fTableViewItem[1]
            },
            {
              TableName: "t_JobProduct_Item",
              insertData: this.selItemList,
              headData: this.selItemHead,
              IdentityColumn: "fMstID"
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
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
      this.dialogFormVisible = true;
    },
    openEditDrawer(row) {
      this.ItmeOrderNO = row.fOrderNo;
      this.drawer = true;
    },
    closeDrawer() {
      this.selItemList = this.$refs.ItemData.BatchList;
      this.selItemHead = this.$refs.ItemData.tableHeadData;
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.selItemList = this.$refs.ItemData.BatchList;
      this.selItemHead = this.$refs.ItemData.tableHeadData;
      this.drawer = false;
    },
    //关闭子表新增弹窗
    closeItemBox(value) {
      if (value) {
        value.forEach(item => {
          this.$set(item, "fStockID", item.fID);
        });
        this.tableData = [...this.tableData, ...value];
      }
      this.dialogFormVisible = false;
    }
  },

  watch: {
    drawer: function(val, old) {
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
    }
  }
};
</script>

<style></style>
