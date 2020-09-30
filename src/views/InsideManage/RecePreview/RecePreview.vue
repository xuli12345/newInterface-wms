<template>
  <div>
    <!-- :strType="'PGAlcntc'" -->
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_RGPreExam_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      :isCheck="checkData"
      :importExcel="true"
      :Invalid="true"
    ></HomeTable>

    <!-- 新增侧滑框   -->
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <CreatFrom
        @closeBox="closeBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="false"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :StateObj="StateObj"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="false"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :rowData="editForm"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "@/components/HomeTable";
import CreatFrom from "./components/FormTable";
import EditFormTable from "./components/EditFormTable";
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
      fTableView: "t_RGPreExam_Mst",
      //审核的数据 3审核 5作废
      checkData: [true, 3, 5],
      //是否新增成功
      isSaveSuccess: false,
            //主表状态
      StateObj: [
        { key: "fState", val: 1 },
        { key: "fStateName", val: "初始" }
      ],
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_RGPreExam_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_RGPreExam_Item", "fMstID"],
      selectArr: [
        {
          fName: "fOrdeTypeName",
          fUrl: "v_Type_InboundOrder",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fInboundOrdeType"],
          fAutoID: ["fInboundOrdeType"]
        },
        {
          fName: "fSourceOrderNo",
          fUrl: "v_InboundOrder_Mst",
          fDes: "fRelatedOrderNo",
          fID: "fID",
          fAuto: ["fSupplierID", "fSupplierName", "fOrdID","fInboundOrderNo"],
          fAutoID: ["fSupplierID", "fOrdID"],
          searchWhere: [
            //已预约
            {
              Computer: "=",
              DataFile: "fMstState",
              Value: 12
            }
          ]
        },
     
        {
          fName: "fDockName",
          fUrl: "v_Dock",
          fDes: "fDockCode",
          fID: "fID",
          fAuto: ["fDockID"],
          fAutoID: ["fDockID"]
        },
 
        {
          fName: "fPalletTypeName",
          fUrl: "v_Container",
          fDes: "fContainerCode",
          fID: "fID",
          fAuto: ["fPalletType"],
          fAutoID: ["fPalletType"]
        },

        {
          fName: "fStateName",
          fUrl: "v_Type_RGPreExamState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fState"],
          fAutoID: ["fState"]
        }
      ],
      //新增字表需要下拉选择的数据
      selectArr2: [
        {
          fName: "fProductName",
          fUrl: "v_Product",
          fDes: "fProductName",
          fID: "fID",
          fAuto: ["fProductCode", "fProductID"],
          fAutoID: ["fProductID"]
        },
        {
          fName: "fProductCode",
          fUrl: "v_Product",
          fDes: "fProductCode",
          fID: "fID",
          fAuto: ["fProductName", "fProductID"],
          fAutoID: ["fProductID"]
        },
        {
          fName: "fUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fUnitID"],
          fAutoID: ["fUnitID"],
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fUnitType",
              Value: 10
            }
          ]
        }
      ],
      batchDelTableName: [
        {
          Key: "t_DistributeNotice_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
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
      this.drawerExcel = false;
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
      // console.log(val)
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
    },
    drawer: function(val, old) {
      // console.log(val)
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
