<template>
  <div>
    <HomeTable
      :fTableView="fTableView"
      :tableName="'t_Rpt_DailyOutbound'"
      :isSaveSuccess="isSaveSuccess"
    ></HomeTable>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import HomeTable from "../components/HomeTable";

export default {
  components: {
    HomeTable
  },
  data() {
    return {
      fTableView: "t_Rpt_DailyOutbound",
      //是否新增成功
      isSaveSuccess: false,
      
   
    };
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
