<template>
  <div>
    <el-table
      :data="tableData | pagination(pageNum, pageSize)"
      class="table-wrapper"
      ref="singleTable"
      border
      :row-key="getRowKeys"
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <template>
        <el-table-column type="selection" width="50"></el-table-column>
        <template v-if="!isAuthority">
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
        <template v-if="isAuthority">
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
                <!-- <el-checkbox
                  @change="changeA(scope.row, item.fColumn)"
                  v-if="item.fDataType == 'bit'"
                  :value="scope.row[item.fColumn] == 0 ? false : true"
                  :disabled="item.fReadOnly == 0 ? false : true"
                ></el-checkbox> -->
                <input
                  type="checkbox"
                  @change="changeA(scope.row, item.fColumn)"
                  v-if="item.fDataType == 'bit'"
                  :checked="scope.row[item.fColumn] == 0 ? false : true"
                  :disabled="item.fReadOnly == 0 ? false : true"
                />
                <el-input
                  v-else
                  v-model="scope.row[item.fColumn]"
                  :maxlength="scope.row[item.fLength]"
                ></el-input>
              </template>
            </el-table-column>
          </template>
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
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { compare } from "@/utils/common";
import { tableBodyData, ItemTableHeadData, GroupLimitData } from "@/api/index";
export default {
  props: [
    "fTableView",
    "tableName",
    "isSaveSuccess",
    "isCompany",
    "isAuthority",
    "isAuthorityGroup",
    "value",
    "isHandleMenu",
    "isSave",
    "selBatchList"
  ],
  data() {
    return {
      tableHeadData: [], //表头数据
      //checkbox选中的数据
      BatchList: [],
      //获取表格内容TableView的值,在获取headData中获取
      fTableViewData: "",
      getRowKeys(row) {
        return row.fCompanyID || row.fModName;
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
      editTableData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      sqlConn: sessionStorage.getItem("sqlConn"),
      OrignData: [],
      select: true
    };
  },
  methods: {
    // 手动选中Checkbox
    handleSelectionChange(val) {
      this.BatchList = val;

      if (this.isAuthority) {
        this.editTableData.push(...val);
        this.editTableData = Array.from(new Set(this.editTableData));
        this.$emit("update:selBatchList", this.editTableData);
        // console.log(this.editTableData);
      }
      if (this.isCompany) {
        this.$emit("update:selBatchList", this.BatchList);
      }
      if (this.isAuthorityGroup) {
        this.$emit("update:selBatchList", this.BatchList);
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

    changeA(item, val) {
      if (this.isAuthority) {
        this.editTableData.push(item);
        this.editTableData = Array.from(new Set(this.editTableData));
        this.$emit("update:selBatchList", this.editTableData);
        // console.log(this.editTableData);
      }

      if (item[val] == 0) {
        // item[val] = 1;
        this.$set(item, val, 1);
      } else if (item[val] == 1) {
        // item[val] = 0;
        this.$set(item, val, 0);
      }
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
    },
    async getTableHead() {
      let res = await ItemTableHeadData([
        {
          fTableView: this.fTableView
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData)
        // console.log(this.fTableView)
        this.fTableViewData = res.fTableViewData;
        if (this.isAuthority) {
          this.$emit("update:isSave", this.tableHeadData);
        }
        // console.log(this.tableHeadData, "权限公司表头数据");
        if (this.isCompany) {
          this.$emit("update:isSave", this.tableHeadData);
          this.getModData();
        } else {
          this.$emit("update:isSave", this.tableHeadData);
        }
        if (this.isAuthorityGroup) {
          this.$emit("update:isSave", this.tableHeadData);
          this.getAuthorityGroupData();
        }
      } else {
        this.$message.error(res.Message);
      }
    },
    //权限公司tableData
    async getModData() {
      let res = await tableBodyData([
        {
          Columns: "",
          OrderBy: "",
          SqlConn: this.sqlConn,
          TableView: "v_Company_Mst",
          Where: []
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );

      if (res.State) {
        let resultData = JSON.parse(res.Data);
        // console.log(resultData,'123')
        this.tableData = resultData.map((item, index) => {
          return {
            fGroupID: 0, //用户组ID
            fCompanyID: item.fID, //公司ID
            fCompanyCode: item.fCompanyCode,
            fCompanyName: item.fCompanyName,
            fLimitID: 0
          };
        });
        this.total = this.tableData.length;
      }
    },
    //获取权限组tabledata
    async getAuthorityGroupData() {
      let res = await tableBodyData([
        {
          Columns: "",
          OrderBy: "",
          SqlConn: this.sqlConn,
          TableView: "v_UserGroup_Mst",
          Where: []
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(
        decryptDesCbc(res.qureyDataResult, String(this.userDes))
      );
      console.log(res);
      if (res.State) {
        this.tableData = JSON.parse(res.Data);
        this.tableData = this.tableData.map(element => {
          return {
            fLimitID: 0,
            fGroupID: element.fID,
            fGroupName: element.fGroupName
          };
        });
        this.total = this.tableData.length;
      }
    },

    async getGroupLimitData() {
      let res = await GroupLimitData([
        ["0"],
        { userDes: this.userDes, userId: this.userId }
      ]);

      res = JSON.parse(
        decryptDesCbc(res.getModLimitDataResult, String(this.userDes))
      );
      if (res.State) {
        this.OrignData = JSON.parse(res.Data);
        this.OrignData.forEach(element => {
          for (const key in element) {
            if (key == "fID") {
              this.$set(element, "fModID", element.fID);
            } else if (element[key] == null) {
              element[key] = 0;
            }
          }
        });
        this.tableData = this.OrignData;
        this.total = this.tableData.length;
        console.log(this.tableData, "权限表数据");
      }
    }
  },
  watch: {
    isHandleMenu(newVal, oldVal) {
      if (newVal) {
        this.$emit("update:isHandleMenu", false);
        this.tableData = this.OrignData.filter(item => {
          return item.fPID == this.value;
        });
        this.total = this.tableData.length;
      }
    }
  },

  created() {
    this.getTableHead();
    this.getGroupLimitData();
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
