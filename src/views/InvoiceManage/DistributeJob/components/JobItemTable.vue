<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        {{ item.fColumnDes }}:

        <el-date-picker
          v-if="item.fDataType == 'datetime'"
          v-model.trim="asData[item.fColumn]"
          type="datetime"
          placeholder="选择日期时间"
          min-width="300"
        ></el-date-picker>

        <el-input
          v-else
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
        ></el-input>
      </div>
      <div style="margin-top:10px">
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-A"
          @click="search"
          :disabled="userLimit('fQurey')"
          >查询</el-button
        >
      </div>
    </div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      class="table-wrapper"
      ref="singleTable"
      border
      style="width: 100%"
      :row-key="getRowKeys"
      :data="tableData | pagination(pageNum, pageSize)"
      @selection-change="handleSelectionChange"
      @filter-change="filterTagTable"
    >
      <el-table-column type="selection" width="50"></el-table-column>

      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
          sortable
          :column-key="item.fColumn"
          :filters="userLimit('fFiler') ? null : screenFuction(item.fColumn)"
        >
          <template slot-scope="scope">
            <el-checkbox
              @change="changeA(scope.row, item.fColumn)"
              v-if="item.fDataType == 'bit'"
              :value="scope.row[item.fColumn] == 1 ? true : false"
              disabled
            ></el-checkbox>

            <div v-else>{{ scope.row[item.fColumn] }}</div>
          </template>
        </el-table-column>
      </template>
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
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit } from "@/utils/common";
import { compare } from "@/utils/common";
import {
  addformSaveData,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
export default {
  props: ["fTableView", "isSaveSuccess", "ItmeOrderNO"],
  data() {
    return {
      //查询的数据
      searchData: [],
      tableHeadData: [], //表头数据
      //搜索条件
      searchWhere: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      //批量
      BatchList: [],
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
      asData: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      newArr: []
    };
  },
  methods: {
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData, "表头1");
        let searchArr = [];
        searchArr = this.tableHeadData.filter(element => {
          return element.fQureyCol == 1;
        });
        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        // console.log(ColumnArr, "搜索的字段");
        let arr = [];
        ColumnArr.forEach((element, index) => {
          this.tableHeadData.forEach((item, index) => {
            // if (item.fColumn.includes(element)) {
            //这里用相等 当勾选的字段名相近时就会把没勾选的值给添加进来
            if (item.fColumn == element) {
              let obj = {
                fColumnDes: item.fColumnDes,
                fColumn: item.fColumn,
                fComputer: item.fComputer,
                fDataType: item.fDataType
              };
              arr.push(obj);
            }
          });
        });
        this.searchData = arr;
      } else {
        this.$message.error(res.Message);
      }
    },

    changeA(item, val) {
      if (item[val] == 0) {
        item[val] = 1;
      } else if (item[val] == 1) {
        item[val] = 0;
      }
    },
    //表格筛选

    async filterTagTable(filters) {
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

      let res = await getTableBodyData(this.fTableViewData, searchData);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        this.tableData.forEach(element => {
          for (const key in element) {
            if (
              (key.indexOf("Date") != -1 ||
                key.indexOf("time") != -1 ||
                key.indexOf("LifeDays") != -1) &&
              element[key] != null
            ) {
              element[key] = element[key].replace(/T/, " ");
            }
          }
        });

        console.log(this.tableData, "过滤表体内容");
      }
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
    //查询
    search() {
      this.getTableData();
    },
    //获取table表格内容数据
    async getTableData() {
      let searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        searchWhere = [
          {
            Computer: "=",
            DataFile: "fOrderNo",
            Value: this.ItmeOrderNO
          }
        ];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];
            if (result instanceof Date) {
              result = timeCycle(result);
            }
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: result
            };
            searchWhere.push(obj);
          }
        });
        let baseWhere = {
          Computer: "=",
          DataFile: "fOrderNo",
          Value: this.ItmeOrderNO
        };
        searchWhere.push(baseWhere);
      }

      // this.fTableViewData
      let res = await getTableBodyData("v_DistributeNotice_Item", searchWhere);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        result.forEach((item,index)=>{
            this.$set(item,"fSort",index+1);
            this.$set(item,"fAlcntcNo",item.fOrderNo)
        })
        this.tableData=result;
        this.total = this.tableData.length;
       
        console.log(this.tableData, "表体内容");
      }
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
     
    },

    // 页容量
    handleSizeChange(val) {
      this.pageSize = val;
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageNum = val;
    },

    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    }
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.getTableData();
      }
    },
  
  },
  created() {
    this.getTableHeadData();
    this.getTableData();
    console.log(this.ItmeOrderNO);
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
