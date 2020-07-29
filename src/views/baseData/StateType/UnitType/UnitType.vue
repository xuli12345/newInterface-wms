<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Type_Unit'"
      :isSaveSuccess="isSaveSuccess"
      @openDrawer="openDrawer"
      @openEditDrawer="openEditDrawer"
    ></HomeTable>
  </div>
</template>
<script>
import HomeTable from "@/views/reportManage/components/HomeTable";

export default {
  components: {
    HomeTable
  },
  data() {
    return {
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      //当前行的数据
      editForm: {},
      fTableView: "t_Type_Unit",
      //是否新增成功
      isSaveSuccess: false
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
    }
  }
};
</script>
<style lang="scss"></style>
