<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        {{ item.fColumnDes }}:

        <el-checkbox
          v-if="item.fDataType == 'bit'"
          v-model.trim="asData[item.fColumn]"
        ></el-checkbox>
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model="asData[item.fColumn]"
          type="datetime"
          placeholder="选择日期时间"
        ></el-date-picker>
        <el-row v-else-if="item.fComputer == 'between'">
          <el-col :span="11">
            <el-input
              v-model.trim="startData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
          <el-col :span="2">——</el-col>
          <el-col :span="11">
            <el-input
              style="margin-left:0px"
              v-model.trim="endData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
        </el-row>
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
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-dayin1"
          @click="printCon()"
          :disabled="userLimit('fPrint')"
          >打印</el-button
        >
      </div>
    </div>
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
      <template>
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
    <!-- 打印格式内容 -->
    <div style="width:0;height:0;overflow:hidden">
      <PrintTable
        v-if="isRender"
        ref="print"
        id="toPrint"
        :dataCode="dataCode"
      ></PrintTable>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import PrintTable from "./PrintStorage";
import PrintJS from "print-js";
import {
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData
} from "@/api/index";
import Sortable from "sortablejs";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功 "product 货品管理新增的按钮" containnerNum生成容器号,
  //printView:打印请求的字段  title:打印的表题 storage:库位管理新增查询导出库位条码按钮
  props: ["fTableView", "tableName", "isSaveSuccess"],
  components: {
    PrintTable
  },
  data() {
    return {
      //是否临时库位
      fIsTemporaryStorage: false,
      //查询的数据
      searchData: [],
      tableHeadData: [], //表头数据
      printHeadData: [],
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
      endData: {},
      startData: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      dataCode: [],
      isRender: false,
      //表格拖拽字段
      sortable: null,
      oldList: [],
      newList: [],
      newArr: []
    };
  },
  methods: {
    async printCon() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请勾选您要打印的数据!");
      } else {
        this.dataCode = this.BatchList;
        this.isRender = true;
        setTimeout(() => {
          PrintJS({
            printable: "toPrint",
            type: "html",
            scanStyles: false,
            css: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
          });
        }, 500);
        setTimeout(() => {
          this.isRender = false;
        }, 600);
      }
    },
    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);

        let newArr = [];
        newArr = this.tableHeadData.filter(element => {
          return element.fKey == 1;
        });
        let obj = {};
        newArr.forEach(item => {
          obj = {
            ColumnName: item.fColumn,
            ColumnType: item.fDataType
          };
        });
        let searchArr = [];
        searchArr = this.tableHeadData.filter(element => {
          return element.fQureyCol == 1;
        });

        let ColumnArr = [];
        searchArr.forEach(item => {
          ColumnArr.push(item.fColumn);
        });
        let arr = [];
        ColumnArr.forEach((element, index) => {
          this.tableHeadData.forEach((item, index) => {
            if (item.fColumn.includes(element)) {
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
        // console.log(arr,"搜索字段数据");
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
      // console.log(filters);
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
      // console.log(res);
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
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
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach(element => {
          if (this.asData[element.fColumn]) {
            let result = this.asData[element.fColumn];

            if (result instanceof Date) {
              result = timeCycle(result);
            }
            if (result.constructor == Boolean && result == true) {
              result = 1;
            }

            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: result
            };
            this.searchWhere.push(obj);
          }
        });
      }
      let startobj = {};
      let endobj = {};
      let arr = [];
      for (const key in this.startData) {
        for (const Ikey in this.endData) {
          if (Ikey == key) {
            startobj = {
              Computer: ">=",
              DataFile: key,
              Value: this.startData[key]
            };
            endobj = {
              Computer: "<=",
              DataFile: key,
              Value: this.endData[Ikey]
            };

            arr.push(startobj);
            arr.push(endobj);
          }
        }
      }

      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }
      let res = await getTableBodyData(this.fTableViewData, this.searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        this.oldList = this.tableData.map(v => v.fID);
        this.newList = this.oldList.slice();
        this.$nextTick(() => {
          // this.setSort();
        });
        this.tableData.forEach(element => {
          for (const key in element) {
            // if (JSON.stringify(element[key]).indexOf("/Date") != -1) {
            //   element[key] = timeCycle(element[key]);
            // }
            if (
              (key.indexOf("Date") != -1 || key.indexOf("time") != -1) &&
              element[key] != null
            ) {
              element[key] = element[key].replace(/T/, " ");
            }
            if (key === "fIsTemporaryStorage" && element[key] == null) {
              this.$set(element, "fIsTemporaryStorage", 0);
            }
          }
        });
        // console.log(this.tableData, "表体内容");
      }
    },
    //表格拖拽
    setSort() {
      const el = this.$refs.singleTable.$el.querySelectorAll(
        ".el-table__body-wrapper > table > tbody"
      )[0];
      this.sortable = Sortable.create(el, {
        setData: function(dataTransfer) {
          dataTransfer.setData("Text", "");
        },
        onEnd: evt => {
          const targetRow = this.tableData.splice(evt.oldIndex, 1)[0];
          this.tableData.splice(evt.newIndex, 0, targetRow);

          // for show the changes, you can delete in you code
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0];
          this.newList.splice(evt.newIndex, 0, tempIndex);
        }
      });
    },
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
    },
    //获取打印表头的数据
    async getPrintHeadData() {
      let res = await getTableHeadData(this.printView[0]);
      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );
      if (res.State) {
        this.printHeadData = res.lstRet;
        // console.log(this.printHeadData, "打印的表头");
      }
    }
  },
  watch: {
    isSaveSuccess(newVal, oldVal) {
      if (newVal) {
        this.getTableData();
      }
    }
  },
  created() {
    this.getTableHeadData();
    if (this.isPrint) {
      this.getPrintHeadData();
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
