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
              v-else-if="item.fColumn === 'fSort'"
              v-model="scope.row[item.fColumn]"
              @change="ruleContent(scope.row[item.fColumn])"
              :disabled="item.fReadOnly == 0 ? false : true"
            ></el-input>
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
import { getTableHeadData, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { compare } from "@/utils/common";
import { timeCycle, updateTime } from "@/utils/updateTime";
export default {
  props: {
    apiUrl: {
      type: String,
      default: () => ""
    },
    IdentityColumn: {
      type: String,
      default: () => ""
    },
    fID: {
      type: Number,
      default: () => -1
    }
  },
  data() {
    return {
       tableHeight:document.body.clientHeight,
      tableHeadData: [],
      OriginTableData: [],
      tableData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //   获取字表数据
      fTableViewData: ""
    };
  },
  methods: {
    //   获取表格头部
    async getTableHead() {
      let res = await getTableHeadData(this.apiUrl);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        this.fTableViewData = res.fTableViewData;
      } else {
        this.$message.error(res.Message);
      }
    },
    async getTableBodyData() {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: this.IdentityColumn,
          Value: this.fID
        }
      ];
      let res = await getTableBodyData(this.fTableViewData, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
         this.tableData.forEach(element => {
          for (const key in element) {
            if (
              (key.indexOf("Date") != -1 || key.indexOf("time") != -1) &&
              element[key] != null
            ) {
              element[key] = element[key].replace(/T/, " ");
            }
          }
        });
        this.total = this.tableData.length;
        this.OriginTableData = JSON.parse(JSON.stringify(this.tableData));
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
        // this.$set(item, val, 1);
      } else if (item[val] == 1) {
        item[val] = 0;
        // this.$set(item, val, 0);
      }
    },
    //验证表格内容不能为空
    ruleContent(val) {
      var reg = /^[1-9]\d*$|^0$/;
      if (val.length > 0) {
        if (!reg.test(val)) {
          this.$message.warning("请在排序中输入数字!");
        }
      } else {
        this.$message.warning("请在排序中输入数字!");
      }
    }
  },
  created() {
    this.getTableHead();
  },
  mounted() {
    setTimeout(() => {
      this.getTableBodyData();
    }, 100);
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
