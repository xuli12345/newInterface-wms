<template>
  <div>
    <!--
      :tableName="'t_Route_System_Mst'"
    :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :batchDelTableName="batchDelTableName" -->
    <HomeRoute
      :selectArr="selectArr"
      :fTableView="fTableView"
      v-model="changValue"
    ></HomeRoute>
    <el-button
      type="primary"
      style="margin-left:10px;margin-bottom:5px"
      circle
      size="mini"
      @click="addPop"
      >新增</el-button
    >

    <ItemHome
      :fTableView="'t_Route_System_Item'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :tableData="tableData"
    ></ItemHome>
    <!-- 新增 -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatItemTable
        @closeBox="closeBox"
        :selectArr="selectArr"
        :fTableViewItem="fTableViewItem"
        :fTableViewHead="fTableViewHead"
      ></CreatItemTable>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <EditItemTable
        @closeBox="closeEditBox"
        :selectArr="selectArr"
        :fTableViewItem="fTableViewItem"
        :fTableViewHead="fTableViewHead"
        :rowData="editForm"
      ></EditItemTable>
    </el-drawer>
  </div>
</template>
<script>
import HomeRoute from "./components/RouteHome";
import ItemHome from "./components/ItemHome";
import CreatItemTable from "./components/CreatItemTable";
import EditItemTable from "./components/EditItemTable";
import { getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
export default {
  components: {
    HomeRoute,
    ItemHome,
    CreatItemTable,
    EditItemTable
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
      changValue: "",
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_Route_System_Item", "fMstID"],
      fTableViewItem: ["t_Route_System_ShopItem", "fSystemItemID"],
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
        },
        {
          fName: "fPickSort",
          fUrl: "v_Type_PickSort",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fPickSortID"],
          fAutoID: ["fPickSortID"]
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
    },

    changValue(val) {
      console.log(val, "val");
      this.getTableData();
    }
  },
  methods: {
    async getTableData() {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: this.$store.state.common.changeValue
        }
      ];
      let res = await getTableBodyData("v_Route_System_Item", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;

        this.tableData.forEach(element => {
          for (const key in element) {
            if (
              (key.indexOf("Date") != -1 ||
                key.indexOf("time") != -1 ||
                key.indexOf("Time") != -1) &&
              element[key] != null
            ) {
              element[key] = element[key].replace(/T/, " ");
            }
          }
        });
        console.log(this.tableData, "表体内容");
      }
    },
    addPop() {
      this.drawer = true;
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
  },
  created() {
    this.getTableData();
  }
};
</script>
<style lang="scss" scoped></style>
