<template>
  <div>
    <TableList
      :fTableView="fTableView"
      :tableName="'t_Storage_Item'"
      :isSaveSuccess="isSaveSuccess"
    ></TableList>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import TableList from "./TableList";
export default {
  components: {
    TableList
  },
  data() {
    return {
      //表格列头数据
      tableHeadData: [],
      //表格内容
      tableData: [],
      fTableView: "t_Storage_Item",
      //是否新增成功
      isSaveSuccess: false,
      userDes: this.$store.state.user.userInfo.userDes
    };
  }
};
</script>
<style lang="scss"></style>
