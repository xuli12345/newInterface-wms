<template>
  <div>
    <!-- :isPrint="true" -->
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_CheckOrder_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      :isCheck="checkData"
      :isClose="closeData"
    ></HomeTable>

    <!-- 新增侧滑框  v-if="newisDestory" -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <!-- addItem 是否需要新增字表的数据 布尔值 true或false-->
      <!-- fTableViewHead 表单的fTableView字段 -->
      <!-- fTableViewItem 表格的fTableView字段 -->
      <!-- selectArr 头部表单需要做下拉选择的表单字段数组 -->
      <!-- selectArr2 新增字表表单需要做下拉选择的表单字段数组 -->
      <CreatFrom
        @closeBox="closeBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :fTableViewAlert="fTableViewAlert"
        :addItem="true"
        :selectArr="selectArr"
        :searchData="searchData"
        :alertArr="alertArr"
        
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <!-- rowData 当前行的数据  editFormTable edit-->
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :fTableViewAlert="fTableViewAlert"
        :searchData="searchData"
        :addItem="true"
        :selectArr="selectArr"
        
        :rowData="editForm"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "@/components/HomeTable";
import CreatFrom from "./component/add";
import EditFormTable from "./component/edit";
export default {
  components: {
    CreatFrom,
    EditFormTable,
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
      isDestory: false,
      newisDestory: false,
      fTableView: "t_CheckOrder_Mst",
      //审核的数据
      checkData: [true, 7],
      //单据关闭的数据
      closeData: [true, 6],
      //是否新增成功
      isSaveSuccess: false,
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_CheckOrder_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_CheckOrder_Item", "fMstID"],
      // 弹出框的ftableview
      fTableViewAlert: ["t_Stock"],
      //表单需要下拉选择的数据
      //fName 需要做下拉的字段，fUrl 下拉选择的数据的接口，fDes 下拉选择的label值 ,fID选择绑定的值
      //fAuto 需要自动带出的值
      //fAutoID 自动带出的值需要转换使用fID的值
      selectArr: [
        {
          fName: "fMstStateName",
          fUrl: "v_Type_CheckOrderState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fMstState"],
          fAutoID: ["fMstState"]
        },
        {
          fName: "fCustomerName",
          fUrl: "v_Customer",
          fDes: "fCustomerName",
          fID: "fID",
          fAuto: ["fCustomerID"],
          fAutoID: ["fCustomerID"]
        },
        {
          fName: "fWarehouseName",
          fUrl: "v_Warehouse_Mst",
          fDes: "fWarehouseName",
          fID: "fID",
          fAuto: ["fWarehouseID"],
          fAutoID: ["fWarehouseID"]
        }
      ],
      //新增字表需要下拉选择的数据
      // selectArr2: [
      //   {
      //     fName: "fProductID",
      //     fUrl: "v_Product",
      //     fDes: "fProductName",
      //     fID: "fID",
      //     fAuto: [
      //       "fProductCode",
      //       "fProductBarCode",
      //       "fStorageCode",
      //       "fProductName"
      //     ]
      //   },
      //   {
      //     fName: "fCheckUnit",
      //     fUrl: "v_Unit",
      //     fDes: "fUnitName",
      //     fID: "fID",
          
      //   },
      //   {
      //     fName: "fStorageID",
      //     fUrl: "v_Storage_Item",
      //     fDes: "fStorageID",
      //     fID: "fID",
      //     fAuto: ["fStorageCode"]
      //   }
      // ],
      batchDelTableName: [
        {
          Key: "t_CheckOrder_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      alertArr: [
        // { fName: "fProductID", fUrl: "v_Product" },
        // { fName: "fCheckUnit", fUrl: "v_Unit" }
      ],
      //弹框查询的条件
      searchData: [
        { fColumnDes: "货品名称", fColumn: "fProductName" },
        { fColumnDes: "货品批次", fColumn: "fBatchNo" },
        { fColumnDes: "货品代码", fColumn: "fProductCode" }
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
  },
  watch: {
    drawerValue: function(val, old) {
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
    },
    drawer: function(val, old) {
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
    }
  }
};
</script>
<style lang="scss"></style>
