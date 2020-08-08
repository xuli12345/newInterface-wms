<template>
  <div>
    <div class="page flex-wrap">
      <!-- @change=" selectType(scope.row, scope.row[item.fColumn], item.fColumn) " -->

      <div class="search-title flex-align-center">
        运输线路体系:
        <el-select v-model="routeValue" placeholder="请选择">
          <el-option
            v-for="optionItem in selectOpts"
            :key="optionItem.fID"
            :label="optionItem.fSystemName"
            :value="optionItem.fID"
          ></el-option>
        </el-select>
      </div>
      <div>
        <el-button
          type="primary"
          size="mini"
          class="iconfont icon-xinzeng"
          @click="handleAdd"
          :disabled="userLimit('fAdd')"
          >新增线路体系</el-button
        >

        <el-button
          type="primary"
          size="small"
          @click="handleEdit"
          :disabled="userLimit('fEdit')"
          >修改线路体系</el-button
        >
        <el-button
          type="primary"
          size="small"
          @click.stop="handleDelete"
          :disabled="userLimit('fDel')"
          >删除线路体系</el-button
        >
      </div>
    </div>
    <!-- dailog -->

    <el-dialog title="新增线路" :visible.sync="dialogFormVisible">
      <CreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="fTableView"
        :selectArr="selectArr"
      ></CreatFrom>
    </el-dialog>
    <el-dialog title="修改线路" :visible.sync="editFormVisible">
      <editCreatFrom
        @closeBox="closeBox"
        :tableHead="tableHeadData"
        :tableName="fTableView"
        :selectArr="selectArr"
        :rowData="rowData"
      ></editCreatFrom>
    </el-dialog>
  </div>
</template>

<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { addParams, batchDelete, userLimit, compare } from "@/utils/common";
import {
  tableBodyData,
  collectionData,
  addformSaveData,
  ItemTableHeadData,
  getTableBodyData,
  getTableHeadData,
  BathcDeleteData
} from "@/api/index";
import CreatFrom from "./CreatFrom";
import editCreatFrom from "./editCreatFrom";
export default {
  props: ["fTableView", "selectArr"],
  components: {
    CreatFrom,
    editCreatFrom
  },
  data() {
    return {
      routeValue: 2,
      //下拉框选项的值
      selectOpts: [],
      //新增
      dialogFormVisible: false,
      //修改线路
      editFormVisible: false,
      userDes: this.$store.state.user.userInfo.userDes,
      //表格列头数据
      tableHeadData: [],
      //获取主体内容字段
      //   fTableViewData: ""
      //当前行数据
      rowData: {}
    };
  },
  watch: {
    routeValue(newVal, oldVal) {
      console.log(newVal, oldVal);
    }
  },
  methods: {
    //新增线路体系
    handleAdd() {
      this.dialogFormVisible = true;
    },
    //修改线路体系
    async handleEdit() {
      //   console.log(this.routeValue);
      if (!this.routeValue) {
        this.$message.warning("请选择运输线路!");
        return;
      } else {
        let searchWhere = [
          {
            Computer: "=",
            DataFile: "fID",
            Value: this.routeValue
          }
        ];
        let result = await this.getMstData(searchWhere);
        this.rowData = result[0];
        console.log(this.rowData, "rowData");
        //修改的弹窗
        this.editFormVisible = true;
      }
    },
    //删除线路体系
    handleDelete() {
      if (!this.routeValue) {
        this.$message.warning("请选择运输线路!");
        return;
      } else {
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            let searchWhere = [
              {
                Computer: "=",
                DataFile: "fID",
                Value: this.routeValue
              }
            ];
            let result = await this.getMstData(searchWhere);
            this.rowData = result[0];
            // console.log(this.rowData, "row");
            if (this.rowData) {
              let res = await collectionData([
                {
                  TableName: this.fTableView,
                  headData: this.tableHeadData,
                  deleteData: [this.rowData]
                }
              ]);
              res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
              if (res.State) {
                this.$message.success("删除成功!");
                // this.selectOpts = await this.getMstData();
                // this.routeValue = 2;
              } else {
                this.$message.error(res.Message);
              }
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },
    //关闭新增弹窗
    async closeBox(value) {
      if (value) {
        // this.selectOpts = await this.getMstData();
        // this.routeValue = 2;
      }
      this.dialogFormVisible = false;
      this.editFormVisible = false;
    },
    //获取线路体系表头数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableView);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
        // console.log(this.tableHeadData, "表头");
      } else {
        this.$message.error(res.Message);
      }
    },
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    //获取回显的数据
    async getMstData(searchWhere = []) {
      let res = await getTableBodyData("v_Route_System_Mst", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        return result;
        // console.log(this.selectOpts, "主体数据");
      }
    }
  },
  async created() {
    this.getTableHeadData();
    this.selectOpts = await this.getMstData();
  }
};
</script>

<style lang="scss" scoped>
.search-title {
  margin-top: 0;
}
</style>
