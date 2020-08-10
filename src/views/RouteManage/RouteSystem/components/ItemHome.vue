<template>
  <div>
    <el-table
      class="table-wrapper"
      ref="singleTable"
      border
      style="width: 100%"
      :row-key="getRowKeys"
      :data="tableData | pagination(pageNum, pageSize)"
      @selection-change="handleSelectionChange"
      @row-dblclick="dblclick"
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

      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              type="text"
              size="small"
              @click.stop="DeleteOne(scope.row, scope.$index)"
              :disabled="userLimit('fDel')"
              >删除</el-button
            >

            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row, scope.$index)"
              :disabled="userLimit('fEdit')"
              >修改</el-button
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
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, userLimit } from "@/utils/common";
import { compare } from "@/utils/common";
import {
  tableBodyData,
  addformSaveData,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
export default {
  //fTableView:请求列头   isSaveSuccess:是否保存成功
  props: ["fTableView", "isSaveSuccess", "batchDelTableName","tableData"],
  data() {
    return {
      tableHeadData: [], //表头数据
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      getRowKeys(row) {
        return row.fID;
      },
      //表格数据
      // tableData: [],
      BatchList: [],
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
  methods: {
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "表头");
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

    // //获取table表格内容数据
    // async getTableData() {
    //   console.log(this.$store.state.common.changeValue);
    //   let searchWhere = [
    //     {
    //       Computer: "=",
    //       DataFile: "fMstID",
    //       Value: this.$store.state.common.changeValue
    //     }
    //   ];
    //   let res = await getTableBodyData("v_Route_System_Item", searchWhere);
    //   res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
    //   if (res.State) {
    //     this.tableData = JSON.parse(res.Data);
    //     this.total = this.tableData.length;

    //     this.tableData.forEach(element => {
    //       for (const key in element) {
    //         if (
    //           (key.indexOf("Date") != -1 ||
    //             key.indexOf("time") != -1 ||
    //             key.indexOf("Time") != -1) &&
    //           element[key] != null
    //         ) {
    //           element[key] = element[key].replace(/T/, " ");
    //         }
    //       }
    //     });
    //     console.log(this.tableData, "表体内容");
    //   }
    // },

    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },

    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },

    //修改
    handleEdit(row, index) {
      this.$emit("openEditDrawer", row, this.tableHeadData);
    },
    //删除
    DeleteOne(row, index) {
      let currentRow = JSON.parse(JSON.stringify(row));
      let resultData = addParams(this.tableHeadData, row);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let res = await addformSaveData([
            {
              lstSaveData: [
                {
                  TableName: this.fTableView,
                  IdentityColumn: null,
                  InsertRow: null,
                  UpdateRow: null,
                  DeleteRow: [resultData.arr],
                  Columns: resultData.columns
                }
              ]
            },
            { userDes: this.userDes, userId: this.userId }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
          if (res.State) {
            this.$message.success("删除成功!");
            this.getTableData();
          } else {
            this.$message.error(res.Message);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
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
        // this.getTableData();
      }
    }
  },

  created() {
    this.getTableHeadData();
    // this.getTableData();
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
