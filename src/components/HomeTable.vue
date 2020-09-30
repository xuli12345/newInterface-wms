<template>
  <div>
    <div class="page flex-wrap">
      <div
        class="search-title flex-align-center"
        v-for="(item, index) in searchData"
        :key="index"
      >
        <p>{{ item.fColumnDes }}:</p>

        <el-checkbox
          v-if="item.fDataType == 'bit'"
          v-model="asData[item.fColumn]"
        ></el-checkbox>
        <el-date-picker
          v-else-if="item.fDataType == 'datetime'"
          v-model.trim="asData[item.fColumn]"
          type="date"
          placeholder="选择日期时间"
          min-width="300"
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
              style="margin-left: 0px"
              v-model.trim="endData[item.fColumn]"
              placeholder="请输入范围值"
            ></el-input>
          </el-col>
        </el-row>
        <!-- 需要使用下拉选择框的 -->
        <!-- <template
          v-else-if="
            homeSelArr && homeSelArr.length > 0 && selectFunction(item.fColumn)
          "
        >
          <el-select
            filterable
            v-model="asData[item.fColumn]"
            @change="getVal(asData[item.fColumn], item.fColumn)"
          >
            <el-option
              :value="i[selectStr(item.fColumn)]"
              v-for="i in selectData(item.fColumn)"
              :key="i[selectVal(item.fColumn)]"
              :label="i[selectStr(item.fColumn)]"
            ></el-option>
          </el-select>
        </template> -->
        <el-input
          v-else
          v-model.trim="asData[item.fColumn]"
          :placeholder="`请输入${item.fColumnDes}`"
        ></el-input>
      </div>
      <div style="margin-top: 10px">
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
          class="iconfont icon-xinzeng"
          @click="addPopRight"
          :disabled="userLimit('fAdd')"
          >新增</el-button
        >
        <el-button
          v-if="!isItem"
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        >
        <el-button
          v-if="isItem"
          type="primary"
          size="mini"
          class="iconfont icon-shanchu"
          @click="BatchFormsDelete"
          :disabled="userLimit('fDel')"
          >批量删除</el-button
        >

        <el-button
          v-if="containerNum"
          type="primary"
          size="mini"
          icon="el-icon-suitcase-1"
          @click="handleContainer"
          >生成容器号</el-button
        >
        <el-button
          v-if="storage"
          type="primary"
          size="mini"
          class="iconfont icon-A"
          :disabled="userLimit('fExport')"
          @click="handleStorage"
          >查询导出库位条码</el-button
        >
        <el-button
          v-if="isCheck"
          type="primary"
          size="mini"
          class="iconfont icon-yishenhe"
          @click="handleCheck"
          :disabled="userLimit('fApp')"
          >审核</el-button
        >
        <el-button
          v-if="isClose"
          type="primary"
          size="mini"
          class="el-icon-circle-close"
          @click="colseOrder"
          :disabled="userLimit('fClose')"
          >关闭</el-button
        >

        <el-button
          v-if="importExcel"
          type="primary"
          size="mini"
          class="iconfont icon-export"
          @click="handerExport"
          :disabled="userLimit('fExport')"
          >导出</el-button
        >
        <el-button
          v-if="Invalid"
          type="primary"
          size="mini"
          class="iconfont icon-jurassic_cancle-pandian"
          @click="handerInvalid"
          >作废</el-button
        >
        <el-button
          v-if="isDownLoad"
          type="primary"
          class="el-icon-bottom"
          @click="downloadTemp"
          size="mini"
          >下载模板</el-button
        >
        <el-upload
          v-if="isDownLoad"
          style="margin-left: 15px; float: right"
          ref="upload"
          class="upload"
          action=""
          :on-change="handleChange"
          :on-remove="handleRemove"
          :auto-upload="false"
          :show-file-list="false"
          accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        >
          <el-button
            type="primary"
            class="iconfont icon-excel"
            size="mini"
            :disabled="userLimit('fInport')"
            >导入excel</el-button
          >
        </el-upload>
      </div>
    </div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      class="table-wrapper"
      ref="singleTable"
      border
      :max-height="tableHeight"
      style="width: 100%"
      :row-key="getRowKeys"
      :data="tableData | pagination(pageNum, pageSize)"
      @selection-change="handleSelectionChange"
      @row-dblclick="dblclick"
      @filter-change="filterTagTable"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <template v-if="!isHave">
        <template v-for="(item, index) in tableHeadData">
          <el-table-column
            v-if="item.fVisible == 1"
            :key="index"
            :label="item.fColumnDes"
            :prop="item.fColum"
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
      <template v-if="isHave">
        <template v-for="(item, index) in tableHeadData">
          <el-table-column
            v-if="item.fVisible == 1"
            :key="index"
            :label="item.fColumnDes"
            :prop="item.fColumn"
            min-width="160px"
            sortable
            :column-key="item.fColumn"
            :filters="screenFuction(item.fColumn)"
          >
            <template slot-scope="scope">
              <form v-if="item.fColumn === 'fPassWord'">
                <el-input
                  v-model="scope.row[item.fColumn]"
                  type="password"
                  disabled
                ></el-input>
              </form>

              <el-checkbox
                @change="changeA(scope.row, item.fColumn)"
                v-else-if="item.fDataType == 'bit'"
                :value="scope.row[item.fColumn] == 1 ? true : false"
                disabled
              ></el-checkbox>
              <div v-else>{{ scope.row[item.fColumn] }}</div>
            </template>
          </el-table-column>
        </template>
      </template>

      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div class="operation">
            <el-button
              v-if="!isItem"
              type="text"
              size="small"
              @click.stop="handleDelete(scope.row, scope.$index)"
              :disabled="userLimit('fDel')"
              >删除</el-button
            >
            <el-button
              v-if="isItem"
              type="text"
              size="small"
              @click.stop="haveItemDelete(scope.row, scope.$index)"
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
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import {
  addformSaveData,
  getHomeTableBody,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData,
  imPortExcel,
  exportData,
} from "@/api/index";
export default {
  //fTableView:请求列头 tableName:保存  isSaveSuccess:是否保存成功  containnerNum生成容器号,
  // storage:库位管理新增查询导出库位条码按钮 isCheck:已审核  strType:导入excel类型字段
  // isClose:单据关闭(入库,盘点,出库)  importExcel:excel导出    Invalid:作废  isDownLoad:是否下载 homeSelArr:搜索框需要做下拉框的字段
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isItem",
    "batchDelTableName",
    "isHave",
    "containerNum",
    "storage",
    "isCheck",
    "strType",
    "isClose",
    "importExcel",
    "Invalid",
    "isDownLoad",
    "homeSelArr",
  ],

  data() {
    return {
      tableHeight: document.body.clientHeight,
      //查询的数据
      searchData: [],
      //表头数据
      tableHeadData: [],
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
      endData: {},
      startData: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      newArr: [],
      //excel
      fileTemp: null,
      selectAllData: [],
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
        searchArr = this.tableHeadData.filter((element) => {
          return element.fQureyCol == 1;
        });
        let ColumnArr = [];
        searchArr.forEach((item) => {
          ColumnArr.push(item.fColumn);
        });
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
                fDataType: item.fDataType,
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
      this.pageNum = 1;
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
      this.newArr.forEach((ele) => {
        for (const key in ele) {
          objData = {
            Computer: "=",
            DataFile: key,
            Value: ele[key],
          };
        }

        searchData.push(objData);
      });

      let res = await getHomeTableBody(this.fTableViewData, searchData);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
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
          value: item[val],
        };
        screenData.push(JSON.stringify(obj));
      });
      let screenArr = Array.from(new Set(screenData));
      var newData = screenArr.map(function (item) {
        return JSON.parse(item);
      });
      return newData;
    },
    //查询
    search() {
      this.getTableData();
    },
    searchCommon() {
      this.pageNum = 1;
      this.searchWhere = [];
      if (JSON.stringify(this.asData) == "{}") {
        this.searchWhere = [];
      } else {
        this.searchData.forEach((element) => {
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
              Value: result,
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
              Value: this.startData[key],
            };
            endobj = {
              Computer: "<=",
              DataFile: key,
              Value: this.endData[Ikey],
            };

            arr.push(startobj);
            arr.push(endobj);
          }
        }
      }
      if (arr.length >= 1) {
        this.searchWhere.push(...arr);
      }
    },
    //获取table表格内容数据
    async getTableData() {
      this.searchCommon();
      let res = await getHomeTableBody(this.fTableViewData, this.searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.total = this.tableData.length;
        console.log(this.tableData, "表体内容");
      }
    },
    //新增
    addPopRight() {
      this.$emit("openDrawer", this.tableHeadData);
    },
    //双击表格弹框
    dblclick(row) {
      if (this.userLimit("fEdit") == false) {
        this.$emit("openEditDrawer", row, this.tableHeadData);
      }
    },

    //生成容器号
    handleContainer() {
      this.$emit("openContainer");
    },
  //查询导出库位条码
    handleStorage() {
      this.$emit("openStorageCode");
    },

    //已审查,单据关闭,入库完成共用方法
    async billsFn(status, msg) {
      if (this.BatchList.length == 0) {
        this.$message.warning(`请选择要${msg}的数据!`);
      } else {
        this.BatchList.forEach((item) => {
          this.$set(item, "fMstState", status);
          this.$set(item, "fState", status);
        });
        let result = batchDelete(this.tableHeadData, this.BatchList);
        let res = await addformSaveData([
          {
            lstSaveData: [
              {
                TableName: this.tableName,
                IdentityColumn: null,
                InsertRow: null,
                UpdateRow: result.arr,
                DeleteRow: null,
                Columns: result.columns,
              },
            ],
          },
          { userDes: this.userDes, userId: this.userId },
        ]);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          this.$message.success(`${msg}成功!`);
          this.getTableData();
        } else {
          this.$message.error(res.Message);
        }
      }
    },
    //已审查,
    handleCheck() {
      this.billsFn(this.isCheck[1], "审核");
    },
    //单据关闭
    colseOrder() {
      this.billsFn(this.isClose[1], "关闭");
    },

    //作废
    handerInvalid() {
      this.billsFn(this.isCheck[2], "作废");
    },
    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;
    },
    //批量删除
    BatchDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        let result = batchDelete(this.tableHeadData, this.BatchList);
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let res = await addformSaveData([
              {
                lstSaveData: [
                  {
                    TableName: this.tableName,
                    IdentityColumn: null,
                    InsertRow: null,
                    UpdateRow: null,
                    DeleteRow: result.arr,
                    Columns: result.columns,
                  },
                ],
              },
              { userDes: this.userDes, userId: this.userId },
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("删除成功!");
              this.getTableData();
            } else {
              this.$message.error(res.errstr);
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      }
    },
    //删除从表
    BatchFormsDelete() {
      if (this.BatchList.length == 0) {
        this.$message.warning("请选择要删除的数据!");
      } else {
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let objectArr = [];
            this.BatchList.forEach((item) => {
              let obj = [
                {
                  Key: "fID",
                  Value: item.fID,
                },
              ];
              objectArr.push(obj);
            });

            let res = await BathcDeleteData([
              {
                MstItemKey: this.batchDelTableName,
                MstKeyValue: objectArr,
                MstTableView: this.fTableView,
              },
              { userDes: this.userDes, userId: this.userId },
            ]);

            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("删除成功!");
              this.getTableData();
            } else {
              this.$message.error(res.errstr);
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      }
    },
    //修改
    handleEdit(row, index) {
      this.$emit("openEditDrawer", row, this.tableHeadData);
    },
    //删除
    handleDelete(row, index) {
      let currentRow = JSON.parse(JSON.stringify(row));
      let resultData = addParams(this.tableHeadData, row);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await addformSaveData([
            {
              lstSaveData: [
                {
                  TableName: this.tableName,
                  IdentityColumn: null,
                  InsertRow: null,
                  UpdateRow: null,
                  DeleteRow: [resultData.arr],
                  Columns: resultData.columns,
                },
              ],
            },
            { userDes: this.userDes, userId: this.userId },
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
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
            message: "已取消删除",
          });
        });
    },
    //有从表数据的删除
    haveItemDelete(row, index) {
      let RowData = JSON.parse(JSON.stringify(row));
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let objectArr = [];
          let obj = [
            {
              Key: "fID",
              Value: RowData.fID,
            },
          ];
          objectArr.push(obj);

          let res = await BathcDeleteData([
            {
              MstItemKey: this.batchDelTableName,
              MstKeyValue: objectArr,
              MstTableView: this.fTableView,
            },
            { userDes: this.userDes, userId: this.userId },
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("删除成功!");
            this.getTableData();
          } else {
            this.$message.error(res.errstr);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
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
    },
    // excel导入
    handleChange(file, fileList) {
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        if (
          this.fileTemp.type ==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          this.fileTemp.type == "application/vnd.ms-excel"
        ) {
          this.importFile(this.strType, this.fileTemp);
        } else {
          this.$message({
            type: "warning",
            message: "附件格式错误，请删除后重新上传！",
          });
        }
      } else {
        this.$message({
          type: "warning",
          message: "请上传附件！",
        });
      }
    },

    handleRemove(file, fileList) {
      this.fileTemp = null;
    },
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Goods")) {
        window.location.href = `${tempUrl}/ImportTempModFile/货品导入模板.xlsx`;
      } else if (this.strType.includes("PGAlcntc")) {
        window.location.href = `${tempUrl}/ImportTempModFile/配货通知单导入模板.xlsx`;
      }
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file,
      });

      if (res.state) {
        this.$message.success("导入成功!");
        this.getTableData();
      } else {
        this.$message.error(res.message);
      }
    },
    //EXCEL导出
    async handerExport() {
      this.searchCommon();
      let res = await exportData(
        this.fTableViewData,
        this.searchWhere,
        this.tableName
      );
      if (!res) return;
      var blob = new Blob([res], {
        type: "application/vnd.ms-excel;charset=utf-8",
        //  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
      });
      var downloadElement = document.createElement("a");
      var href = window.URL.createObjectURL(blob); //创建下载的链接
      downloadElement.href = href;
      downloadElement.download = `${this.$route.meta.title}-详情.xlsx`; //下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); //点击下载
      document.body.removeChild(downloadElement); //下载完成移除元素
      window.URL.revokeObjectURL(href); //释放掉blob
    },
    //判断当前字段是否需要做下拉框 v表头所有的字段
    selectFunction(v) {
      // console.log(v);
      let cc = false;
      this.homeSelArr.forEach((element) => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
    },
    // 获取所有需要下拉选择的内容
    async getSelectData() {
      let arr = [];

      let searchWhere = [];
      for (let i = 0; i < this.homeSelArr.length; i++) {
        let res;
        if (this.homeSelArr[i].searchWhere) {
          searchWhere = this.homeSelArr[i].searchWhere;
          res = await getTableBodyData(this.homeSelArr[i].fUrl, searchWhere);
        } else {
          searchWhere = [];
          res = await getTableBodyData(this.homeSelArr[i].fUrl, searchWhere);
        }
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          let obj = {
            fName: this.homeSelArr[i].fName, //当前字段
            data: JSON.parse(res.Data), //当前字段下拉框的值
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }

      this.selectAllData = arr;
    },
    // 下拉选择框选中值后，带出其他需要带出的值
    getVal(val, n) {
      console.log(val, n);
      //当前选择框对应的数据
      let arr = [];
      this.selectAllData.forEach((ele) => {
        if (ele.fName == n) {
          arr = ele.data;
        }
      });
      //选中值后对应的单条数据
      let data = {};
      arr.forEach((el) => {
        if (el.fID == val) {
          data = el;
        }
      });
    },
    // options下拉选择框的内容
    selectData(v) {
      let arr = [];
      this.selectAllData.forEach((ele) => {
        if (ele.fName == v) {
          arr = ele.data;
        }
      });

      return arr;
    },
    //下拉选择框需要显示的label字段
    selectStr(v) {
      let str = "";
      this.homeSelArr.forEach((element) => {
        if (element.fName == v) {
          str = element.fDes;
        }
      });
      return str;
    },
    //下拉选择框选择的值
    selectVal(v) {
      let str = "";
      this.homeSelArr.forEach((element) => {
        if (element.fName == v) {
          str = element.fID;
        }
      });
      return str;
    },
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
    // if (this.homeSelArr && this.homeSelArr.length > 0) {
    //   this.getSelectData();
    // }
  },
   //缓存组件 钩子被激活
  activated() {
    this.getTableData();
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
