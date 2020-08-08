<template>
  <div>
    <!--
      :tableName="'t_Route_System_Mst'"
    :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :batchDelTableName="batchDelTableName" -->
    <HomeRoute :selectArr="selectArr" :fTableView="fTableView" @input="$emit('input', event.target.value)"></HomeRoute>

    <!-- <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
    </el-drawer> -->
  </div>
</template>
<script>
import HomeRoute from "./components/RouteHome";
export default {
  components: {
    HomeRoute
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
      fTableView: "t_Route_System_Mst",
      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_CodeRules_Template_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      userDes: this.$store.state.user.userInfo.userDes,
      selectArr: [
        {
          fName: "fCustomerName",
          fUrl: "v_Customer",
          fDes: "fCustomerName",
          fID: "fID",
          fAuto: ["fCustomerID"],
          fAutoID: ["fCustomerID"]
        },

        {
          fName: "fLoadGradeName",
          fUrl: "v_Type_LoadGrade",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fLoadGradeID"],
          fAutoID: ["fLoadGradeID"]
        },
        {
          fName: "fRouteTypeName",
          fUrl: "v_Type_Route_System",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fRouteType"],
          fAutoID: ["fRouteType"]
        }
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
    input(e){
      console.log(e,"e")
    },
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
    }
  }
};
</script>
<style lang="scss"></style>
