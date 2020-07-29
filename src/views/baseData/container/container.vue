<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Container'"
      :isSaveSuccess="isSaveSuccess"
      :containerNum="true"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      @openContainer="openContainer"
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
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
        :tableName="'t_Container'"
        :selectArr="selectArr"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Container'"
        :rowData="editForm"
        :selectArr="selectArr"
      ></editCreatFrom>
    </el-drawer>
    <!-- 生成容器号 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerContainer"
      :direction="direction"
      :before-close="handleClose"
    >
      <ContainerFrom
        @closeBox="closeContainerBox"
        :tableHead="containerData"
        :tableName="'t_ContainerCode_Mst'"
        :selectArr="selectArr"
      ></ContainerFrom>
    </el-drawer>
    <!-- 容器弹窗 -->
    <el-dialog
      :title="openTitle"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="true"
    >
      <dialog-table
        @closeBox="closeItemBox"
        :fTableView="fTableViewAlert[0]"
        :tableData="fTableData"
      ></dialog-table>
    </el-dialog>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import HomeTable from "@/components/HomeTable";
import CreatFrom from "@/components/CreatFrom";
import ContainerFrom from "./components/CreatFrom";
import editCreatFrom from "@/components/editCreatFrom";
import { getTableBodyData, getTableHeadData } from "@/api/index";
import DialogTable from "./components/DialogTable";
import { compare } from "@/utils/common";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable,
    DialogTable,
    ContainerFrom
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      drawerContainer: false,
      direction: "rtl",
      //新增销毁创建
      newisDestory: false,
      //修改销毁创建
      isDestory: false,
      openTitle: "",
      dialogFormVisible: false,
      // 弹出框的ftableview
      fTableViewAlert: ["t_ContainerCode_Item"],
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //生成容器号数据
      containerData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_Container",
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      //弹窗的表格数据
      fTableData: [],
      selectArr: [
        {
          fName: "fTypeOneName",
          fUrl: "v_Type_Container",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fContainerTypeOne"],
          fAutoID: ["fContainerTypeOne"]
        },
        {
          fName: "fTypeTwoName",
          fUrl: "v_Type_Container",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fContainerTypeTwo"],
          fAutoID: ["fContainerTypeTwo"]
        },
        {
          fName: "fUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fContainerUnit"],
          fAutoID: ["fContainerUnit"],
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fUnitType",
              Value: 5
            }
           ]
        },
        {
          fName: "fVolumetUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fVolumetUnit"],
          fAutoID: ["fVolumetUnit"],
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fUnitType",
              Value: 7
            }
           ]
        },
        {
          fName: "fWeightUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fWeightUnit"],
          fAutoID: ["fWeightUnit"],
           searchWhere: [
            {
              Computer: "=",
              DataFile: "fUnitType",
              Value: 9
            }
           ]
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
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData("t_ContainerCode_Mst");
      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );
      if (res.State) {
        this.containerData = res.lstRet.sort(compare);
        // console.log(this.containerData, "表头");
      } else {
        this.$message.error(res.Message);
      }
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      this.dialogFormVisible = false;
      if (value) {
        // this.tableData.unshift(value);
        // console.log('保存')
        // this.tableData.concat(value);
      }
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

    openContainer() {
      this.drawerContainer = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
      this.drawerContainer = false;
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
    //关闭生成容器号弹窗
    closeContainerBox(value, tableData) {
      if ((value, tableData)) {
        this.fTableData = tableData;
        this.dialogFormVisible = true;
      } else {
        this.drawerContainer = false;
      }
    }
  },
  created() {
    this.getTableHeadData();
  }
};
</script>
<style lang="scss">
.el-dialog__body {
  padding-top: 0 !important;
}
</style>
