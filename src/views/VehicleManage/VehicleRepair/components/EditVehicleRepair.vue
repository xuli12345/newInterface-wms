<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >保存</el-button
      >
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
        >取消</el-button
      >
    </div>
    <!-- form表格 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :selectArr="selectArr"
      :rowData="rowData"
    ></child-form-head>
    <!-- 子表格数据    -->
    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng"
        @click="addPopRight"
        style="margin-bottom:10px"
        >新增</el-button
      >
      <template v-for="(item, index) in ItemTableData">
        <el-tab-pane :label="item.fColumnDes" :name="item.fName" :key="index">
          <EditTabItemTable
            :apiUrl="item.apiUrl"
            :ref="item.fName"
            :IdentityColumn="item.IdentityColumn"
            :fID="rowData.fID"
          ></EditTabItemTable>
        </el-tab-pane>
      </template>
    </el-tabs>
    <!-- 新增字表数据 -->
    <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="addItem"
    >
      <child-form-head
        v-if="drawer"
        @closeBox="closeItemBox"
        :fTableViewHead="TabItemInterFace"
        ref="ItemRuleForm"
        :addItem="addItem"
        :selectArr="selectArr2"
      ></child-form-head>
    </el-drawer>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { getItemMenus, collectionData, getTableHeadData } from "@/api/index";
import ItemTable from "@/components/ItemTable";
import EditTabItemTable from "./EditTabItemTable";
import ChildFormHead from "../../components/EditChildFormHead";
import { userLimit, compare,handelData } from "@/utils/common";
export default {
  components: {
    ItemTable,
    ChildFormHead,
    EditTabItemTable
  },
  props: {
    fTableViewHead: {
      type: Array,
      default: () => []
    },
    fTableViewItem: {
      type: Array,
      default: () => []
    },
    selectArr: {
      type: Array,
      default: () => []
    },
    selectArr2: {
      type: Array,
      default: () => []
    },
    addItem: {
      type: Boolean,
      default: () => false
    },
    ItemTableData: {
      type: Array,
      default: () => []
    },
    rowData: {
      type: Object,
      default: () => []
    }
  },
  data() {
    return {
      drawer: false,
      activeName: "",
      tableHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格数据
      tableData: [],
      //表格数据表头
      tableHead: [],
      TabItemInterFace: ""
    };
  },

  methods: {
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let vData = [];
          this.ItemTableData.forEach(ele => {
            // 处理数据，获取新增的，修改的，删除的数据
            let wantData = handelData(
              this.$refs[ele.fName][0].OriginTableData,
              this.$refs[ele.fName][0].tableData
            );
            let updateData = wantData[0];
            let insertData = wantData[1];
            if (insertData && insertData.length > 0) {
              insertData.forEach(ele => {
                ele.fMstID = this.rowData.fID;
              });
            }
            let deleteData = wantData[2];
            let vObj = {
              TableName: ele.apiUrl,
              updateData,
              insertData,
              deleteData,
              headData: this.$refs[ele.fName][0].tableHeadData
            };
            vData.push(vObj);
          });

          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: this.tableHeadData
            },
            ...vData
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("修改成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.Message);
          }
        }
      });
    },
 
    //取消
    resetForm() {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },

    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //tabs
    handleClick(activeName) {
      if (activeName == "second") {
      }
    },
    //新增
    addPopRight() {
      this.ItemTableData.forEach(ele => {
        if (ele.fName == this.activeName) {
          this.TabItemInterFace = ele.apiUrl;
        }
      });
      this.drawer = true;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        value.fSort = this.$refs[this.activeName][0].tableData.length + 1;
        this.$refs[this.activeName][0].tableData.push(value);
      }
      this.drawer = false;
    }
  },
  created() {
    this.activeName = this.ItemTableData[0].fName;
    this.getTableHeadData();
  }
};
</script>
<style lang="scss" scoped>
.item-munus {
  height: 30px;
  cursor: pointer;
}

.addClass {
  color: #409eff;
}
.el-col-4 {
  width: 14.66667%;
}
.table-wrapper .el-input {
  margin-left: 0;
}
.table-wrapper /deep/.el-input__inner {
  border: none !important;
}
</style>
