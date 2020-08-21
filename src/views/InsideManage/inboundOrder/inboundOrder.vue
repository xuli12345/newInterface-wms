<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_InboundOrder_Mst'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
      :batchDelTableName="batchDelTableName"
      :isItem="true"
      :isPrint="true"
      :printView="printView"
      :title="title"
      :isCheck="checkData"
      :isClose="closeData"
      :putawayData="putawayData"
    ></HomeTable>
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
        :addItem="true"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :strType="'Inbound'"
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
        :addItem="true"
        :selectArr="selectArr"
        :selectArr2="selectArr2"
        :rowData="editForm"
        :changeData="changeData"
        :strType="'Inbound'"
      ></edit-form-table>
    </el-drawer>
  </div>
</template>
<script>
import HomeTable from "@/components/HomeTable";
import CreatFrom from "./components/Add/FormTable";
import EditFormTable from "./components/Edit/EditFormTable";
export default {
  components: {
    CreatFrom,
    HomeTable,
    EditFormTable
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
      fTableView: "t_InboundOrder_Mst",
      //审核数据
      checkData: [true, 7],
      //单据关闭的数据
      closeData: [true, 8],
      //已上架的数据
      putawayData: [true, 6],
      printView: [
        "t_InboundOrderData",
        "v_InboundOrderData",
        "v_InboundOrder_Item",
        "t_InboundOrder_Item"
      ],
      title: ["知行易通(厦门)信息科技有限公司", "商品进仓单"],
      //是否新增成功
      isSaveSuccess: false,
      //批量删除的数据
      batchDelTableName: [
        {
          Key: "t_InboundOrder_Item",
          Value: [{ Key: "fID", Value: "fMstID" }]
        }
      ],
      //表头的字段，以及自增长字段
      fTableViewHead: ["t_InboundOrder_Mst", "fID"],
      //表格的ftableview,自增长字段
      fTableViewItem: ["t_InboundOrder_Item", "fMstID"],
      //表单需要下拉选择的数据
      //fName 需要做下拉的字段，fUrl 下拉选择的数据的接口，
      //fDes 下拉选择的label值 ,fID选择绑定的值
      //fAuto 需要自动带出的值
      //fAutoID 需要转换使用fID的值
      //fEdit  需要转换使用的当前页面显示的字段名fInboundOrdeTypeName fInboundOrdeType
      selectArr: [
        {
          fName: "fMstStateName",
          fUrl: "v_Type_InboundState",
          fDes: "fTypeName",
          fID: "fID",
          fEdit: [{ key: "fMstStateName", value: "TypeName" }],
          fAuto: ["fMstState"],
          fAutoID: ["fMstState"]
        },
        {
          fName: "fInboundOrdeTypeName",
          fUrl: "v_Type_InboundOrder",
          fDes: "fTypeName",
          fID: "fID",
          fEdit: [{ key: "fInboundOrdeTypeName", value: "TypeName" }],
          fAuto: ["fInboundOrdeType"],
          fAutoID: ["fInboundOrdeType"]
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
          fName: "fInboundOrdeTypeName",
          fUrl: "v_Type_InboundOrder",
          fDes: "fTypeName",
          fID: "fID",
          // fEdit:[{key:'fInboundOrdeTypeName',value:'fInboundOrdeType'}],
          fAuto: ["fInboundOrdeType"],
          fAutoID: ["fInboundOrdeType"]
        }
      ],
      //新增字表需要下拉选择的数据
      selectArr2: [
        {
          fName: "fProductCode",
          fUrl: "v_Product",
          fDes: "fProductCode",
          fID: "fID",
          fAuto: ["fProductID", "fProductName", "fProductBarCode"],
          fAutoID: ["fProductID"]
        },
        {
          fName: "fProductName",
          fUrl: "v_Product",
          fDes: "fProductName",
          fID: "fID",
          fAuto: ["fProductID", "fProductCode", "fProductBarCode"],
          fAutoID: ["fProductID"]
        },
        {
          fName: "fNumUnitName",
          fUrl: "v_Unit",
          fDes: "fUnitName",
          fID: "fID",
          fAuto: ["fInboundNumUnit"],
          fAutoID: ["fInboundNumUnit"],
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
          fAuto: ["fInboundBoxNumUnit"],
          fAutoID: ["fInboundBoxNumUnit"],
          searchWhere: [
            {
              Computer: "=",
              DataFile: "fUnitType",
              Value: 10
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
          fName: "fItemStateaName",
          fUrl: "v_Type_InboundItemState",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fItemState"],
          fAutoID: ["fItemState"]
        },
        {
          fName: "fShelfLifeDays",
          fUrl: "v_Type_ShelfLife",
          fDes: "TypeName",
          fID: "fID",
          fAuto: [],
          fAutoID: []
        }
      ],
      //字表表格需要做下拉框的字段 及需要转换的id值
      // key:需要做下拉框的字段名  fKey:需要装换的id值
      changeData: [
        { key: "fNumUnitName", fKey: "fInboundNumUnit" },
        { key: "fBoxNumUniName", fKey: "fInboundBoxNumUnit" },
        { key: "fVolumetUnitName", fKey: "fVolumetUnit" }
      ]
    };
  },
  watch: {
    drawerValue: function(val, old) {
      // console.log(val)
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
    },
    drawer: function(val, old) {
      // console.log(val)
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
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
    }
  }
  //  created() {
  //   console.log(process.env.BASE_API)
  //   if (
  //     process.env.BASE_API &&
  //     process.env.BASE_API == "http://39.99.185.176:8001/Service.svc"
  //   ) {
  //     this.title = ["山东齐畅冷链物流股份有限公司", "商品进仓单"];
  //   } else if(  process.env.BASE_API &&
  //     process.env.BASE_API =="http://8.129.208.95:8004/api") {
  //     this.title = ["知行易通(厦门)信息科技有限公司", "商品进仓单"];
  //   }else{

  //   }
  // }
  
};
</script>
<style lang="scss" scoped></style>
