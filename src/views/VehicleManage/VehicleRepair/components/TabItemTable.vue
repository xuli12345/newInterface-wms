<template>
  <div>
    <el-table
    :header-cell-style="{ background: '#eef1f6'}"
      :data="tableData | pagination(pageNum, pageSize)"
      class="table-wrapper"
      ref="singleTable"
       :max-height="tableHeight"
      border
      style="width: 100%;"
    >
      <el-table-column type="selection" width="50"></el-table-column>
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
        >
          <template slot-scope="scope">
            <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 0 ? false : true"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-checkbox>

            <el-input
              v-else
              v-model="scope.row[item.fColumn]"
              :maxlength="scope.row[item.fLength]"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input>
          </template>
        </el-table-column>
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
import { getTableHeadData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { compare } from "@/utils/common";
export default {
  props: {
    apiUrl: {
      type: String,
      default: () => ""
    }
  },
  data() {
    return {
       tableHeight:document.body.clientHeight,
      tableHeadData: [],
      tableData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0
    };
  },
  methods: {
    //   获取表格头部
    async getTableHead() {
      let res = await getTableHeadData(this.apiUrl);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //表格筛选
    filtersF(val, row, column) {
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
    },
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    },
    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
      } else if (item[val] == 1) {
        item[val] = 0;
      }
    }
  },
  created() {
    this.getTableHead();
  },
  watch: {
    tableData() {
      this.total = this.tableData.length;
    }
  }
};
</script>

<style lang="scss" scoped>
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
</style>
