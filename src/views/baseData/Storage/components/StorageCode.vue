<template>
  <div>
    <TableList
      :fTableView="fTableView"
      :tableName="'t_Storage_Item'"
      :isSaveSuccess="isSaveSuccess"
      @openEditDrawer="openEditDrawer"
    ></TableList>
    <el-drawer
      :modal="false"
      :visible.sync="drawerValue"
      direction="rtl"
      :before-close="handleEditClose"
      v-if="isDestory"
    >
      <editCreatFrom
        @closeBox="closeEditBox"
        :tableHead="tableHeadData"
        :tableName="'t_Storage_Item'"
        :rowData="editForm"
        :selectArr="selectArr"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import TableList from "./TableList";
import editCreatFrom from "@/components/editCreatFrom";
export default {
  components: {
    TableList,
    editCreatFrom
  },
  data() {
    return {
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      fTableView: "t_Storage_Item",
      //当前行的数据
      editForm: {},
      //是否新增成功
      isSaveSuccess: false,
      drawerValue: false,
      isDestory: false,
      selectArr: [
        {
          fName: "fStorageTypeName",
          fUrl: "v_Type_Storage",
          fDes: "fTypeName",
          fID: "fID",
          fAuto: ["fStorageType"],
          fAutoID: ["fStorageType"]
        }
      ],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    //双击修改弹框
    openEditDrawer(row, headData) {
      // console.log(headData)
      this.tableHeadData = headData;
      this.editForm = row;
      this.drawerValue = true;
      this.isSaveSuccess = false;
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
    }
  },
  watch: {
    drawerValue(newval, oldval) {
      setTimeout(() => {
        this.isDestory = newval;
      }, 10);
    }
  }
};
</script>
<style lang="scss"></style>
