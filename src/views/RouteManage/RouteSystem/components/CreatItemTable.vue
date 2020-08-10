<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="addPopRight"
        >添加线路</el-button
      >
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
    <!-- form表格  -->
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
        :fTableView="'t_ShopItem'"
      ></alert-table>
    </el-dialog>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData, getTableHeadData } from "@/api/index";
import { compare } from "@/utils/common";
import ChildFormHead from "@/components/ChildFormHead";
import ChildTable from "@/components/ChildTable";
import AlertTable from "./AlertTable";
export default {
  props: ["fTableViewHead", "fTableViewItem", "selectArr"],
  components: {
    ChildFormHead,
    ChildTable,
    AlertTable
  },
  data() {
    return {
      tableData: [],
      openTitle: "选择运输线路",
      dialogFormVisible: false,
      //form表单数据
      tableHeadData: [],
      //表格表头
      tableHead: [],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    submitForm(formName) {
      let formData = this.$refs.ruleForm.ruleForm;
      let fMstID = this.$store.state.common.changeValue;
      console.log(fMstID);
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          formData.fMstID = fMstID;

          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: this.tableHeadData
            }
          ]);
          let res2 = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res2.State) {
            this.tableData.forEach(ele => {
              ele.fSystemItemID = res2.Identity;
            });
            let res = await collectionData([
              {
                TableName: this.fTableViewItem[0],
                insertData: this.tableData,
                headData: this.tableHead
              }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("新增成功!");
              this.$emit("closeBox", res.State);
            } else {
              this.$message.error(res.Message);
            }
          } else {
            this.$message.error(res2.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$emit("closeBox");
    },
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log("res1", res);
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表格的表头
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        // console.log(res);
        this.tableHead = res.lstRet.sort(compare);
        console.log(this.tableHead,"表格表头")
      } else {
        this.$message.error(res.Message);
      }
    },
    //新增按钮
    addPopRight() {
      this.dialogFormVisible = true;
    },
    //关闭子表新增弹窗
    closeItemBox(value) {
      if (value) {
        // console.log(value,"value")
   
        value.forEach(item => {
          this.$set(item, "fShopID", item.fID);
          this.$set(item, "fSort", this.tableData.length + 1);
        });

        this.tableData = [...this.tableData, ...value];
        console.log(this.tableData, "22");
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
<style lang="scss" scoped></style>
