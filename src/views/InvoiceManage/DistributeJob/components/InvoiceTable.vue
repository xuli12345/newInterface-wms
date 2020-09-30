<template>
  <div>
    
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData"
      class="table-wrapper"
      ref="singleTable"
       :max-height="tableHeight"
      border
      :row-key="getRowKeys"
      style="width: 100%;"
      @selection-change="handleSelectionChange"
      @filter-change="filterTagTable"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <!-- :filter-method="filtersF" -->
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1 ? true : false"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          sortable
          min-width="120px"
          :filters="screenFuction(item.fColumn)"
          :column-key="item.fColumn"
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
    </el-table>
    <!-- 分页 -->
    <!-- <div class="page flex-justify-end">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 50, 100, 400]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div> -->
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import { getTableHeadData, getTableBodyData } from "@/api/index";
export default {
  props: ["fTableView", "searchData"],
  data() {
    return {
       tableHeight:document.body.clientHeight,
      tableHeadData: [], //表头数据
      getRowKeys(row) {
        return row.fID;
      },
      //表格数据
      tableData: [],
      // 当前页数
      pageNum: 1,
      // 每页条数
      pageSize: 10,
      // 总条数
      total: 0,
      //权限表修改的数据
      userDes: this.$store.state.user.userInfo.userDes,
      //   kong
      nullTable: [],
      //获取表格数据的fTableView
      fTableViewll: "",
      asData: {},
      //传递过去的数据
      sendData: [],
      newArr: []
    };
  },
  methods: {
    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },
    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        item[val] = 0;
        this.$set(item, val, 0);
      }
    },
    //表格筛选
    async filterTagTable(filters) {
      // console.log(filters);
      this.pageNum=1;
      let column, value, arrLength;
      let obj = {};
      for (const key in filters) {
        column = key;
        value = filters[key][0];
        arrLength = filters[key].length;
        //判断是否有值 有值才添加
        if (value != undefined) {
          obj[key] = value;
          this.newArr.push(obj);
        }
        //判断是否点击了重置
        this.newArr.forEach((item, index) => {
          if (column in item && arrLength == 0) {
            this.newArr.splice(index, 1);
          }
        });
      }
      let searchData = [];
      let objData;
      this.newArr.forEach(ele => {
        for (const key in ele) {
          objData = {
            Computer: "=",
            DataFile: key,
            Value: ele[key]
          };
        }
        searchData.push(objData);
      });
      let res = await getTableBodyData(this.fTableViewll, searchData);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      // console.log(res);
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
     
        console.log(this.tableData, "筛选表体内容");
      }
    },

    //筛选的条件数组
    screenFuction(val) {
      let copyTable = this.tableData;
      let screenData = [];
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
    //获取表格表头数据
    async getTableHeadData() {
      // this.fTableView
      let res = await getTableHeadData("t_user_mst");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.fTableViewll = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData, "dailog表头数据");
      } else {
        this.$message.error(res.Message);
      }
    },
    search() {
      this.getTableData();
    },
    //获取表格内容数据
    async getTableData() {
      this.pageNum=1;
      let searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        searchWhere = [
          {
            Computer: "=",
            DataFile: "fState",
            Value: 2
          }
        ];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let obj = {
              Computer: "=",
              DataFile: element.fColumn,
              Value: this.asData[element.fColumn]
            };
            searchWhere.push(obj);
          }
        });
      }
      let baseWhere = {
        Computer: "=",
        DataFile: "fState",
        Value: 2
      };
      searchWhere.push(baseWhere);
      let res = await getTableBodyData(this.fTableViewll, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        console.log(this.tableData);
        this.tableData.forEach(element => {
          for (const key in element) {
            if (JSON.stringify(element[key]).indexOf("/Date") != -1) {
              element[key] = timeCycle(element[key]);
            }
          }
        });
      } else {
        this.$message.error(res.Message);
      }
    },

    handleDelete(val, index) {
      this.tableData.splice(index, 1);
    },
    submitForm() {
      // console.log(this.sendData)
      this.$emit("closeBox", JSON.parse(JSON.stringify(this.sendData)));
    },
    resetForm() {
      this.$emit("closeBox");
    },
    handleSelectionChange(val) {
      this.sendData = val;
    }
  },
  watch: {
    tableData: function() {
      this.total = this.tableData.length;
    }
  },
  created() {
    this.getTableHeadData();
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
