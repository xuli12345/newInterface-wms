<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Stock'"
      :isSaveSuccess="isSaveSuccess"
      :stock="true"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
    ></HomeTable>

    <!-- 设置在库数量  -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <StockAdjust
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Stock_Adjust'"
        :rowData="editForm"
      ></StockAdjust>
    </el-drawer>

    <el-drawer
      v-if="isDestory"
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Stock'"
        :rowData="editForm"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import HomeTable from "./components/HomeTable";
import editCreatFrom from "@/components/editCreatFrom";
import CreatFrom from "@/components/CreatFrom";
import StockAdjust from "./components/StockAdjust";
import {  getTableHeadData } from "@/api/index";
import { compare } from "@/utils/common";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable,
    StockAdjust
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      direction: "rtl",
      //新增销毁创建
      newisDestory: false,
      //修改销毁创建
      isDestory: false,
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_Stock",
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      //修改要隐藏的字段
      fVisibleColumn: [
        "fContainerCode",
        "fUnit",
        "fProductBarCode",
        "fStorageCode",
        "fStorageBarCode",
        "fUnitName"
      ],
      //只读字段
      fReadOnlyColumn: [
        "fStockNum",
        "fCustomerName",
        "fProductCode",
        "fProductName"
      ]
    };
  },
  watch: {
    drawerValue(newval, oldval) {
      setTimeout(() => {
        this.isDestory = newval;
      }, 10);
    },
    drawer(newval, oldval) {
      setTimeout(() => {
        this.newisDestory = newval;
      }, 10);
    }
  },
  methods: {
    //设置在库数量
    async openDrawer(row) {
      this.editForm = row;
      let res = await getTableHeadData("t_Stock_Adjust");

      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "表头");
      }
      this.drawer = true;
      this.isSaveSuccess = false;
    },
    //属性调整
    openEditDrawer(row, headData) {
      headData.forEach(item => {
        this.fVisibleColumn.forEach(element => {
          if (item.fColumn == element) {
            this.$set(item, "fVisible", 0);
          }
        });
      });
      headData.forEach(item => {
        this.fReadOnlyColumn.forEach(element => {
          if (item.fColumn == element) {
            this.$set(item, "fReadOnly", 1);
          }
        });
      });
      this.tableHeadData = headData;
      this.editForm = row;
      this.drawerValue = true;
      this.isSaveSuccess = false;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
    },
    //关闭修改弹窗
    closeEditBox(val) {
      if (val) {
        this.isSaveSuccess = true;
      }
      this.drawerValue = false;
    },

    //关闭新增弹窗
    closeBox(value) {
      if (value) {
        this.isSaveSuccess = true;
      }
      this.drawer = false;
    }
  }
};
</script>
<style lang="scss"></style>
