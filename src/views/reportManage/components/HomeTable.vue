<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        <p style="min-width:90px">{{ item.fColumnDes }}:</p>
        <el-input
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
          icon="el-icon-setting"
          @click="addPopRight"
          :disabled="userLimit('fAdd')"
          v-if="stock"
          >设置在库数量</el-button
        >
        <el-button
          type="primary"
          size="mini"
          class="el-icon-s-opportunity"
          @click="propsAdjust"
          v-if="stock"
        >
          属性调整</el-button
        >
      </div>
    </div>

    <el-table
      class="table-wrapper"
      ref="singleTable"
      border
      style="width: 100%"
      :data="tableData | pagination(pageNum, pageSize)"
      highlight-current-row
      @current-change="handleCurrentRow"
      @filter-change="filterTagTable"
    >
      >
      <el-table-column type="index" width="50"></el-table-column>

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
        ></el-table-column>
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
import { userLimit, compare } from "@/utils/common";
import { tableBodyData, getTableHeadData, getTableBodyData } from "@/api/index";
import Sortable from "sortablejs";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功 stock:库存查询显示的按钮
  props: ["fTableView", "tableName", "isSaveSuccess", "searchParams", "stock"],
  data() {
    return {
      //查询的数据
      searchData: [],
      tableHeadData: [], //表头数据
      //搜索条件
      searchWhere: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      //当前行
      currentRow: null,
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
      //表格拖拽字段
      sortable: null,
      oldList: [],
      newArr: []
    };
  },

  methods: {
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
      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );
      // console.log(res);
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        this.tableData.forEach(element => {
          for (const key in element) {
            if (JSON.stringify(element[key]).indexOf("/Date") != -1) {
              element[key] = timeCycle(element[key]);
            }
          }
        });
        console.log(this.tableData, "表体内容");
      }
    },

    //用户表格列头
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );

      if (res.State) {
        this.fTableViewData = res.fTableViewData;
        this.tableHeadData = res.lstRet.sort(compare);
        console.log(this.tableHeadData, "列头");

        //过滤搜索的字段
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
            if (item.fColumn.includes(element)) {
              let obj = {
                fColumnDes: item.fColumnDes,
                fColumn: item.fColumn,
                fComputer: item.fComputer
              };
              arr.push(obj);
            }
          });
        });
        //搜索的数据
        this.searchData = arr;
      } else {
        this.$message.error(res.Message);
      }
    },

    //筛选的条件数组
    screenFuction(val) {
      // console.log(val,"val")
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
      // console.log(newData,"筛选")
      return newData;
    },
    handleCurrentRow(val) {
      // console.log(val);
      this.currentRow = val;
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
            let obj = {
              Computer: element.fComputer,
              DataFile: element.fColumn,
              Value: this.asData[element.fColumn]
            };
            this.searchWhere.push(obj);
          }
        });
      }

      let res = await tableBodyData([
        {
          Columns: "",
          OrderBy: "",
          SqlConn: this.sqlConn,
          TableView: this.fTableViewData,
          Where: this.searchWhere
        },
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );

      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        // console.log(this.tableData, "表体内容");
        this.oldList = this.tableData.map(v => v.fID);
        this.newList = this.oldList.slice();
        this.$nextTick(() => {
          //this.setSort();
        });
        this.tableData.forEach(element => {
          for (const key in element) {
            if (JSON.stringify(element[key]).indexOf("/Date") != -1) {
              element[key] = timeCycle(element[key]);
            }
          }
        });
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

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0];
          this.newList.splice(evt.newIndex, 0, tempIndex);
        }
      });
    },
    //属性调整
    propsAdjust() {
      if (this.currentRow == null) {
        this.$message.warning("请选择一行数据!");
      } else {
        this.$emit("openEditDrawer", this.currentRow, this.tableHeadData);
      }
    },
    //新增
    addPopRight() {
      if (this.currentRow == null) {
        this.$message.warning("请选择一行数据!");
      } else {
        this.$emit("openDrawer", this.currentRow);
      }
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
      let a = userLimit(val);
      return a;
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
  },
  computed: {
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
