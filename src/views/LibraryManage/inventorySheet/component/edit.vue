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
        size="mini"
        class="iconfont icon-gengxin "
        @click="updateKucun"
        >盘点更新库存</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >保存</el-button
      >
      <el-button class="iconfont icon-quxiao"   size="mini" @click="resetForm()"
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
      :fID="rowData.fID"
    ></child-table>
    <!-- 新增字表数据 -->
    <!-- <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="addItem"
    >
      <child-form-head
        @closeBox="closeItemBox"
        :fTableViewHead="fTableViewItem[0]"
        ref="ItemRuleForm"
        :addItem="addItem"
        :selectArr="selectArr2"
      ></child-form-head>
    </el-drawer>-->
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
import { compare, batchDelete } from "@/utils/common";
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
      tableHeadData: [],
      kucHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      userId: JSON.parse(sessionStorage.getItem("user")).userId,
      drawer: false,
      //表格添加的数据
      insertData: {},
      //表格数据表头
      tableHead: [],
      dialogFormVisible: false,
      openTitle: "选择货品",
      fMstID: ""
    };
  },
  methods: {
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );
      //   console.log(res)
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表格的表头，保存的时候需要用到
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );
      //   console.log(res);
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
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
        console.log(item1);
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
          // if ("fMstID" in element) {
          // } else {
          //   this.$set(element, "fMstID", 0);
          // }
        }
      });

      let wantData = this.handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据

      let updateArr = wantData[0];
      let insertArr = wantData[1];
      if (insertArr && insertArr.length > 0) {
        insertArr.forEach(element => {
          // this.$set(element, "fMstID", this.fMstID);
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
          //   console.log(res)
          res = JSON.parse(
            decryptDesCbc(res.saveDataResult, String(this.userDes))
          );
          console.log(res);
          if (res.state === true) {
            this.$message.success("修改成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.errstr);
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

      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );
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
      // console.log(result);
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
            }
          ]
        },
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(
        decryptDesCbc(res.saveStockAdjustDataResult, String(this.userDes))
      );
      console.log(res);
      if (res.state === true) {
        this.$message.success("更新库存成功!");
      } else {
        this.$message.error(res.errstr);
      }
    }
  },
  created() {
    this.getTableHeadData();
    this.getTableHead();
    this.kucunHeadData();
  },
   computed: {
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      }
    }
  },
};
</script>

<style></style>
