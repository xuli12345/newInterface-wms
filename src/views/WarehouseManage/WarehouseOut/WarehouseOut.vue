<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_OutboundOrder_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :isItem="true"
      :batchDelTableName="batchDelTableName"
      :isPrint="true"
      :printView="printView"
      :title="title"
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
        :addItem="true"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :strType="'Outbound'"
      ></CreatFrom>
    </el-drawer>
    <el-drawer
      :modal-append-to-body="false"
      :visible.sync="drawerValue"
      :direction="direction"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <!-- rowData 当前行的数据 -->
      <edit-form-table
        @closeBox="closeEditBox"
        :fTableViewHead="fTableViewHead"
        :fTableViewItem="fTableViewItem"
        :addItem="true"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :rowData="editForm"
        :changeData="changeData"
        :strType="'Outbound'"
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
      fTableView: "t_OutboundOrder_Mst",
        //审核的数据
      checkData:[true,3],
        //单据关闭的数据
      closeData:[true,4],
      printView: [
        "t_OutboundOrderData",
        "v_OutboundOrderData",
        "v_OutboundOrder_Item",
        "t_OutboundOrder_Item"
      ],
      title: [],
      //是否新增成功
      isSaveSuccess: false,
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_OutboundOrder_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_OutboundOrder_Item", "fMstID"],
      //表单需要下拉选择的数据
      //fName 需要做下拉的字段，fUrl 下拉选择的数据的接口，fDes 下拉选择的label值 ,fID选择绑定的值
      //fAuto 需要自动带出的值
      //fAutoID 需要转换使用fID的值
      selectArr: [
        {
          fName: "fMstStateName",
          fUrl: "v_Type_OutboundState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fMstState"],
          fAutoID: ["fMstState"],
          fEdit: [{ key: "fMstStateName", value: "TypeName" }]
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
          fName: "fTypeName",
          fUrl: "v_Type_OutboundOrder",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fOutboundOrdeType"],
          fAutoID: ["fOutboundOrdeType"]
        }
      ],
      //新增字表需要下拉选择的数据
      selectArr2: [
        {
          fName: "fProductName",
          fUrl: "v_Stock",
          fDes: "fProductName",
          fID: "fID",
          fAuto: [
            "fProductCode",
            "fProductBarCode",
            "fStorageCode",
            "fProductID",
            "fBatchNo",
            "fStorageID"
          ]
        },
        {
          fName: "fProductCode",
          fUrl: "v_Stock",
          fDes: "fProductCode",
          fID: "fID",
          fAuto: [
            "fProductName",
            "fProductBarCode",
            "fStorageCode",
            "fProductID",
            "fBatchNo",
            "fStorageID"
          ]
        },
        {
          fName: "fNumUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fOutboundNumUnit"],
          fAutoID: ["fOutboundNumUnit"],
           searchWhere: [
            {
              Computer: "=",
              DataFile: "fUnitType",
              Value: 10
            }
           ]
        },
        {
          fName: "fBoxNumUniName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fOutboundBoxNumUnit"],
          fAutoID: ["fOutboundBoxNumUnit"],
           searchWhere: [
            {
              Computer: "=",
              DataFile: "fUnitType",
              Value: 10
            }
           ]
        },
        {
          fName: "fItemStateName",
          fUrl: "v_Type_OutboundItemState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fItemState"],
          fAutoID: ["fItemState"]
        }
      ],
      batchDelTableName: [
        {
          Key: "t_OutboundOrder_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      //字表表格需要做下拉框的字段 及需要转换的id值
      // key:需要做下拉框的字段名  fKey:需要装换的id值
      changeData: [
        { key: "fNumUnitName", fKey: "fOutboundNumUnit" },
        { key: "fBoxNumUniName", fKey: "fOutboundBoxNumUnit" }
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
  },
   created() {
    console.log(process.env.BASE_API);
    if (
      process.env.BASE_API &&
      process.env.BASE_API == "http://39.99.185.176:8001/Service.svc"
    ) {
      this.title = ["山东齐畅冷链物流股份有限公司", "商品出仓单"];
    } else if (
      process.env.BASE_API &&
      process.env.BASE_API == "http://192.168.137.1:8001/Service.svc"
    ) {
      this.title = ["广州恒嘉电子科技有限公司", "商品出仓单"];
    } else if (
      process.env.BASE_API &&
      process.env.BASE_API == "http://8.129.208.95:8001/Service.svc"
    ) {
      this.title = ["知行易通(厦门)信息科技有限公司", "商品出仓单"];
    }else{

    }
  }
};
</script>
<style lang="scss"></style>
