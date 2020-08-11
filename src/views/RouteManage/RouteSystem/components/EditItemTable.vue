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
    <EditChildFormHead
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :rowData="rowData"
      :selectArr="selectArr"
    ></EditChildFormHead>
    <!-- 表格 -->
    <EditChildTable
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fID"
    ></EditChildTable>
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
import EditChildFormHead from "@/components/EditChildFormHead";
import EditChildTable from "@/components/EditChildTable";
import AlertTable from "./AlertTable";
export default {
  props: ["fTableViewHead", "fTableViewItem", "selectArr", "rowData"],
  components: {
    EditChildFormHead,
    EditChildTable,
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
      //表格添加的数据
      insertData: [],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    submitForm(formName) {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      this.fID = this.$refs.ruleForm.ruleForm.fID; //字表添加数据时,需要手动添加的键
      let wantData = this.handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      if (insertArr && insertArr.length > 0) {
        insertArr.forEach(element => {
          // console.log(element,11)
          element.fSystemItemID = this.fID;
        });
      }

      let deletedArr = wantData[2];
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          // //权限表
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: this.tableHeadData
            }
          ]);
          let res2 = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res2.State) {
            let res = await collectionData([
              {
                TableName: this.fTableViewItem[0],
                updateData: updateArr,
                insertData: insertArr,
                deleteData: deletedArr,
                headData: this.tableHead
              }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("修改成功!");
              this.$emit("closeBox", res.State);
              this.$refs.ruleForm.$refs.ruleForm.resetFields();
            } else {
              this.$message.error(res.Message);
            }
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
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
    //获取表格的表头
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
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
        // console.log(value)
        value.forEach(item => {
          this.$set(item, "fShopID", item.fID);
        });

        this.insertData = value;
      }
      this.dialogFormVisible = false;
    },
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
          if (item.fID == child.fID) {
            common.push(child);
          }
        });
      });
      //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
      common.forEach(item1 => {
        // console.log(item1);
        Now.forEach((item2, idx2) => {
          if (item1.fID == item2.fID) {
            Now.splice(idx2, 1);
          }
        });
      });
      //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
      common.forEach(child1 => {
        Back.forEach((child2, idx2) => {
          if (child1.fID == child2.fID) {
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
    }
  },
  created() {
    this.getTableHeadData();
    this.getTableHead();
    
  }
};
</script>
<style lang="scss" scoped></style>
