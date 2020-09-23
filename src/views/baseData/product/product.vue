<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Product'"
      :isSaveSuccess="isSaveSuccess"
      :product="true"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      @openBarCode="openBarCode"
      @openCarton="openCarton"
      @openSeq="openSeq"
      :strType="'Goods'"
      :isDownLoad='true'
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
    <el-drawer
      v-if="newisDestory"
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="'t_Product'"
        :showfColumn="showfColumn"
        :selectArr="selectArr"
      ></CreatFrom>
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
        :tableName="'t_Product'"
        :rowData="editForm"
        :selectArr="selectArr"
        :showfColumn="showfColumn"
      ></editCreatFrom>
    </el-drawer>
    <!-- 条码绑定 -->
    <el-drawer
      :modal-append-to-body="true"
      :visible.sync="drawerCode"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <ProductBarCode></ProductBarCode>
    </el-drawer>
    <!--装箱信息 -->
    <el-drawer
      :modal-append-to-body="true"
      :visible.sync="drawerCarton"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <Carton></Carton>
    </el-drawer>
    <!--上架拣货设置  -->
    <el-drawer
      :modal-append-to-body="true"
      :visible.sync="drawerSeq"
      :direction="direction"
      :before-close="handleEditClose"
    >
      <StorageSeqSet></StorageSeqSet>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "@/components/HomeTable";
import CreatFrom from "@/components/CreatFrom";
import editCreatFrom from "@/components/editCreatFrom";
import ProductBarCode from "./components/ProductBarCode";
import Carton from "./components/Carton";
import StorageSeqSet from "./components/StorageSeqSet";
export default {
  components: {
    CreatFrom,
    editCreatFrom,
    HomeTable,
    ProductBarCode,
    Carton,
    StorageSeqSet
  },
  data() {
    return {
      drawer: false,
      drawerValue: false,
      drawerCode: false,
      drawerCarton: false,
      drawerSeq: false,
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
      fTableView: "t_Product",
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes,
      //新增 /修改 控制显示隐藏的字段
      showfColumn: [
        {
          name: "fIsShelfLife",
          hidden: [
            "fShelfLifeNum",
            "fShelfLifeUnit",
            "fShelfLifeMinDays",
            "fShelfLifeMaxDays",
            "fShelfLifeOutboundDa",
            "fShelfLifeAlertDays"
          ]
        }
      ],
      selectArr: [
        {
          fName: "fShelfLifeUnitName",
          fUrl: "v_Type_ShelfLife",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fShelfLifeUnit"],
          fAutoID: ["fShelfLifeUnit"]
        },
        {
          fName: "fCustomerName",
          fUrl: "v_Consignor",
          fDes: "fConsignorName",
          fID: "fID",
          fAuto: ["fCustomerID"],
          fAutoID: ["fCustomerID"]
        },
        {
          fName: "fPickingPlace",
          fUrl: "v_Storage_Item",
          fDes: "fStorageCode",
          fID: "fID",
          // fAuto: ["fID"],
          // fAutoID: ["fID"],
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fStorageType",
              Value: 3
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
    //条码绑定弹框
    openBarCode() {
      this.drawerCode = true;
    },
    //装箱信息弹框
    openCarton() {
      this.drawerCarton = true;
    },
    //上架拣货设置弹窗
    openSeq() {
      this.drawerSeq = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //点击x关闭弹窗
    handleEditClose(done) {
      this.drawerValue = false;
      this.drawerCode = false;
      this.drawerCarton = false;
      this.drawerSeq = false;
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
