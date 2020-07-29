<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Carton_Item'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
    <el-drawer
        :modal="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Carton_Item'"
        :fColumn="fColumn"
        :selData="selData"
        :switchArr="switchArr"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
        :modal="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Carton_Item'"
        :rowData="editForm"
        :fColumn="fColumn"
        :selData="selData"
        :switchArr="switchArr"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "@/components/HomeTable";
import CreatFrom from "@/components/CreatFrom";
import editCreatFrom from "@/components/editCreatFrom";
import { getTableBodyData } from "@/api/index";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
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
      fTableView: "t_Carton_Item",
      // searchParams: ["fProductCode"],

      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      fColumn: ["fProductCode", "fProductName","fContainerTypeName"],
      selData: [],
      switchArr: [
        { fColumn: "fProductCode", sfColumn: "fProductID" },
        { fColumn: "fProductName", sfColumn: "fProductID" },
        { fColumn: "fContainerTypeName", sfColumn: "fContainerType" }
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
    //获取区域类型
    async getType() {
      let res = await getTableBodyData("v_Type_Container");
      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );

      if (res.State) {
        let result = JSON.parse(res.Data);
        let data = [];
        let arr = [];
        result.forEach(element => {
          let obj = {
            fType: element.fID,
            fColumnDes: element.fTypeName
          };
          arr.push(obj);
        });
        let object = {
          name: "fContainerTypeName",
          data: arr
        };
        data.push(object);
        this.selData = [...this.selData, ...data];
      }
    },
    //获取货品编码类型
    async getProductCodeType(fTableView, fColumnType) {
      let res = await getTableBodyData(fTableView);

      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );
      if (res.State) {
        let result = JSON.parse(res.Data);
        let arr = [];
        let asData = [];
        result.forEach(element => {
          let obj = {
            fType: element.fID,
            fColumnDes: element[fColumnType],
            // fColumnName: element.fProductName,
            // fProductCode: element.fProductCode
          };
          arr.push(obj);
        });
        let object = {
          name: fColumnType,
          data: arr
        };
        asData.push(object);
        this.selData = [...this.selData, ...asData];
        //  console.log(this.selData);
      }
    }
  },
  created() {
    this.getProductCodeType("v_Product", "fProductCode");
    this.getProductCodeType("v_Product", "fProductName");
  },
  mounted() {
    this.getType();
  }
};
</script>
<style lang="scss"></style>
