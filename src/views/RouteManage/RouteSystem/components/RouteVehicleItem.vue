<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="openTable"
        style="margin-bottom:15px"
        >新增</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        size="mini"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
        >取消</el-button
      >
    </div>
    <div class="page" style="margin-top:35px">
      <!-- <div class="search-title"> -->
      <div class="flex">
        <p class="label">运输线路体系:</p>
        <el-select
          v-model="routeValue"
          @change="ValChange"
          placeholder="请选择"
        >
          <el-option
            v-for="optionItem in selectOpts"
            :key="optionItem.fID"
            :label="optionItem.fSystemName"
            :value="optionItem.fID"
          ></el-option>
        </el-select>
      </div>

      <div class="flex" style="margin:10px 0 30px">
        <p class="label">预设线路:</p>
        <el-select v-model="selValue" @change="SelChange" placeholder="请选择">
          <el-option
            v-for="optionItem in selectOptions"
            :key="optionItem.fID"
            :label="optionItem.fRouteCode"
            :value="optionItem.fID"
          ></el-option>
        </el-select>
      </div>
      <!-- </div> -->
      <HcTitle content="线路分派车辆"></HcTitle>

      <!-- 表格 -->
      <child-table
        ref="childTable"
        :fTableView="fTableViewHead[0]"
        :tableData="tableData"
      ></child-table>
      <!-- 新增字表数据 -->
      <el-dialog
        :title="openTitle"
        :visible.sync="dialogFormVisible"
        :append-to-body="true"
        :destroy-on-close="true"
      >
        <alert-table
          @closeBox="closeItemBox"
          :fTableView="'t_Vehcile_Driver'"
        ></alert-table>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { compare, handelData } from "@/utils/common";
import {
  collectionData,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
import HcTitle from "@/components/HcTitle";
import ChildTable from "@/components/ChildTable";
import AlertTable from "./AlertTable";
export default {
  props: ["fTableViewHead", "fTableView"],
  components: {
    HcTitle,
    ChildTable,
    AlertTable
  },
  data() {
    return {
      //下拉框选项的值
      selectOpts: [],
      //预设线路下拉框的值
      selectOptions: [],
      selValue: "",
      userDes: this.$store.state.user.userInfo.userDes,
      routeValue: this.$store.state.common.changeValue,
      //表格列头数据

      tableHead: [],
      tableData: [],
      //回显的数据
      backData: [],
      openTitle: "选择车辆分派线路",
      dialogFormVisible: false
    };
  },
  methods: {
    async submitForm(formName) {
      let fMstID = this.$store.state.common.changeValue;
      if (this.selValue == "") {
        this.$message.warning("请选择预设线路!");
        return;
      }

      if (this.tableData.length != 0) {
        this.tableData.forEach(item => {
          this.$set(item, "fSystemItemID", this.selValue);
        });
      }
      let wantData = handelData(this.backData, this.tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      let deletedArr = wantData[2];
      //   console.log(updateArr, insertArr, deletedArr);
      let res = await collectionData([
        {
          TableName: "t_Route_VehicleItem",
          updateData: updateArr,
          insertData: insertArr,
          deleteData: deletedArr,
          headData: this.tableHead
        }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.$message.success("保存成功!");
        this.$emit("closeBox", res.State);
      } else {
        this.$message.error(res.Message);
      }
    },
    resetForm(formName) {
      this.$emit("closeBox");
    },
    openTable() {
      this.dialogFormVisible = true;
    },
    //主表
    async ValChange() {
      this.$store.commit("common/updateRouteValue", this.routeValue);
      this.selValue = "";
      let where = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: this.$store.state.common.changeValue
        }
      ];
      this.selectOptions = await this.getTableData(
        "v_Route_System_Item",
        where
      );
    },
    //从表
    async SelChange() {
      //获取回显的数据
      let where = [
        {
          Computer: "=",
          DataFile: "fSystemItemID",
          Value: this.selValue
        }
      ];
      let result = await this.getTableData("v_Route_VehicleItem", where);
      this.backData = JSON.parse(JSON.stringify(result));
      this.tableData = result;
      //   console.log(result, "回显的数据");
    },
    //主表数据
    async getMstData(searchWhere = []) {
      let res = await getTableBodyData("v_Route_System_Mst", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.selectOpts = JSON.parse(res.Data);
        // console.log(this.selectOpts, "主表数据");
      }
    },

    async getTableData(fTableView, searchWhere) {
      let res = await getTableBodyData(fTableView, searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        result.forEach(element => {
          for (const key in element) {
            if (
              (key.indexOf("Date") != -1 ||
                key.indexOf("time") != -1 ||
                key.indexOf("Time") != -1) &&
              element[key] != null
            ) {
              element[key] = element[key].replace(/T/, " ");
            }
          }
        });
        // console.log(result, "表体内容");
        return result;
      }
    },

    //获取表格的表头
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
        // console.log(this.tableHead, "表格表头");
      } else {
        this.$message.error(res.Message);
      }
    },

    //关闭子表新增弹窗
    closeItemBox(value) {
      if (value) {
        // console.log(value, "value");
        value.forEach((item, index) => {
          this.$set(item, "fVehicleID", item.fID);
          this.$set(item, "fSort", this.tableData.length + index + 1);
        });

        this.tableData = [...this.tableData, ...value];
      }
      this.dialogFormVisible = false;
    }
  },
  async created() {
    this.getMstData();
    this.getTableHead();
    let where = [
      {
        Computer: "=",
        DataFile: "fMstID",
        Value: this.$store.state.common.changeValue
      }
    ];
    this.selectOptions = await this.getTableData("v_Route_System_Item", where);
  }
};
</script>
<style lang="scss" scoped>
.label {
  min-width: 88px;
}
.el-select {
  width: 300px;
}
</style>
