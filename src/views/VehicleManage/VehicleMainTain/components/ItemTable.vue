<template>
  <div>
    <el-table
    :header-cell-style="{ background: '#eef1f6'}"
      :data="tableData | pagination(pageNum, pageSize)"
      class="table-wrapper"
      ref="singleTable"
      border
      style="width: 100%;"
    >
      <template>
        <el-table-column type="index" width="50"></el-table-column>
        <template v-for="(item, index) in tableHeadData">
          <el-table-column
            v-if="item.fVisible == 1 ? true : false"
            :key="index"
            :label="item.fColumnDes"
            :prop="item.fColumn"
            sortable
            min-width="120px"
            :filters="screenFuction(item.fColumn)"
            :filter-method="filtersF"
          ></el-table-column>
        </template>
      </template>
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click.stop="handleDelete(scope.row, scope.$index)"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="page flex-justify-end">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 50, 100, 400]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { tableBodyData, getTableHeadData } from "@/api/index";
export default {
  props: ["tableHeadData", "ItemTableData"],
  data() {
    return {
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn")
    };
  },
  watch: {
    ItemTableData(newVal, oldVal) {
      //   console.log(oldVal, newVal);
      this.tableData = newVal;
      this.total = this.tableData.length;
    }
  },
  methods: {
    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },

    //表格筛选
    filtersF(val, row, column) {
      // console.log(val)
      const property = column["property"];
      return row[property] === val;
    },
    //筛选的条件数组
    screenFuction(val) {
      let copyTable = this.tableData;
      var screenData = [];
      copyTable.forEach((item, idx) => {
        let obj = {
          text: item[val],
          value: item[val]
        };
        screenData.push(JSON.stringify(obj));
      });
      let screenArr = Array.from(new Set(screenData));
      var newData = screenArr.map(function(item) {
        return JSON.parse(item);
      });
      return newData;
    }
  }
};
</script>
<style lang="scss" scoped></style>
