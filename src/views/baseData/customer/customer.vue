<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Customer'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
    ></HomeTable>

    <!-- 新增侧滑框  -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Customer'"
        :fColumn="fColumn"
        :selData="selData"
        :switchArr="switchArr"
        :fVisibleColumn="fVisibleColumn"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      v-if="isDestory"
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <EditCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Customer'"
        :rowData="editForm"
        :fColumn="fColumn"
        :selData="selData"
        :switchArr="switchArr"
        :fVisibleColumn="fVisibleColumn"
        :selectParams="selectParams"
      ></EditCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "@/components/HomeTable";
import CreatFrom from "./components/CreatFrom";
import EditCreatFrom from "./components/EditCreatFrom";
import { getTableBodyData } from "@/api/index";
export default {
  components: {
    CreatFrom,
    EditCreatFrom,
    HomeTable
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
      fTableView: "t_Customer",
      // searchParams: ["fCustomerCode", "fCustomerName"],
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      fColumn: ["fCustomeTypeName", "fPaymentModeName", "fInvoiceTypeName"],
      switchArr: [
        { fColumn: "fCustomeTypeName", sfColumn: "fCustomeType" },
        { fColumn: "fPaymentModeName", sfColumn: "fPaymentMode" },
        { fColumn: "fInvoiceTypeName", sfColumn: "fInvoiceType" }
      ],
      selData: [],
      fVisibleColumn: ["fProvince", "fCity", "fDistrict"],
      selectParams: ["fProvince", "fCity", "fDistrict"]
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
    //新增
    openDrawer(headData) {
      this.tableHeadData = headData;
      this.drawer = true;
      this.isSaveSuccess = false;
    },
    //双击修改弹框
    openEditDrawer(row, headData) {
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
    },
    //获取客户类型名称
    async getCustomerType() {
      let res = await getTableBodyData("v_Type_Customer");

      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );

      if (res.State) {
        let result = JSON.parse(res.Data);
        let CustomerType = [];
        let data = [];
        result.forEach(element => {
          // console.log(element)
          let parmsObj = {
            fType: element.fID,
            fColumnDes: element.fTypeName
          };
          data.push(parmsObj);
        });
        let object = {
          name: "fCustomeTypeName",
          data: data
        };
        CustomerType.push(object);
        this.selData = [...this.selData, ...CustomerType];
        // console.log(this.selData);
      }
    },
    //获取发票类型
    async getInvoiceType() {
      let res = await getTableBodyData("v_Type_CustomerInvoice");

      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );

      if (res.State) {
        let result = JSON.parse(res.Data);
        // console.log(result, "原数据");
        let InvoiceType = [];
        let data = [];
        result.forEach(element => {
          let obj = {
            fType: element.fID,
            fColumnDes: element.fTypeName
          };
          data.push(obj);
        });
        let object = {
          name: "fInvoiceTypeName",
          data: data
        };
        InvoiceType.push(object);
        this.selData = [...this.selData, ...InvoiceType];
      }
    },
    //获取结算方式类型
    async CustomerPayment() {
      let res = await getTableBodyData("v_Type_CustomerPayment");

      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );

      if (res.State) {
        let result = JSON.parse(res.Data);
        // console.log(result, "原数据");
        let CustomerPayment = [];
        let data = [];
        result.forEach(element => {
          let obj = {
            fType: element.fID,
            fColumnDes: element.fTypeName
          };
          data.push(obj);
        });
        let object = {
          name: "fPaymentModeName",
          data: data
        };
        CustomerPayment.push(object);
        this.selData = [...this.selData, ...CustomerPayment];
        console.log(this.selData);
      }
    }
  },
  created() {
    this.getCustomerType();
  },
  mounted() {
    this.getInvoiceType();
    this.CustomerPayment();
  }
};
</script>
<style lang="scss"></style>
