<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Vehicle_Cost'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Vehicle_Cost'"
        :selectArr="selectArr"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Vehicle_Cost'"
        :rowData="editForm"
        :selectArr="selectArr"
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
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_Vehicle_Cost",
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      selectArr: [
        {
          fName: "fVehicleNo",
          fUrl: "v_Vehcile_Driver",
          fDes: "fVehicleNo",
          fID: "fID",
          fAuto: ["fVehicleID"],
          fAutoID: ["fVehicleID"]
        },
        {
          fName: "fLicenseNo",
          fUrl: "v_Vehcile_Driver",
          fDes: "fLicenseNo",
          fID: "fID",
          fAuto: ["fVehicleID"],
          fAutoID: ["fVehicleID"]
        },
        {
          fName: "fSubjectCode",
          fUrl: "v_CostSubject",
          fDes: "fSubjectName",
          fID: "fID",
          fAuto: ["fCostSubjectID"],
          fAutoID: ["fCostSubjectID"]
        },
        {
          fName: "fSubjectName",
          fUrl: "v_CostSubject",
          fDes: "fSubjectName",
          fID: "fID",
          fAuto: ["fCostSubjectID"],
          fAutoID: ["fCostSubjectID"]
        }
      ]
    };
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
    }
  }
};
</script>
<style lang="scss"></style>
