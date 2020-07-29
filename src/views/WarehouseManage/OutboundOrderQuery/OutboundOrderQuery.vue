<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_OutboundOrdersQuery'"
      :isSaveSuccess="isSaveSuccess"
    ></HomeTable>
  </div>
</template>
<script>
import HomeTable from "@/views/LibraryManage/Stock/components/HomeTable";
export default {
  components: {
    HomeTable
  },
  data() {
    return {
      fTableView: "t_OutboundOrdersQuery",
      //是否新增成功
      isSaveSuccess: false
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
