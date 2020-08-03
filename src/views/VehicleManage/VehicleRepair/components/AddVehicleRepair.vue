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
    ></child-form-head>
    <!-- 子表格数据    -->
    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng"
        @click="addPopRight"
        >新增</el-button
      >
      <template v-for="(item, index) in ItemTableData">
        <el-tab-pane :label="item.fColumnDes" :name="item.fName" :key="index">
          <TabItemTable :apiUrl="item.apiUrl" :ref="item.fName"></TabItemTable>
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
import { collectionData, getTableHeadData } from "@/api/index";
import ItemTable from "@/components/ItemTable";
import TabItemTable from "./TabItemTable";
import ChildFormHead from "../../components/ChildFormHead";
import { userLimit, compare } from "@/utils/common";
export default {
  components: {
    ItemTable,
    ChildFormHead,
    TabItemTable
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

    tableName: {
      type: String,
      default: () => ""
    },
    addItem: {
      type: Boolean,
      default: () => false
    },
    ItemTableData: {
      type: Array,
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
      // console.log(this.$refs);
      let vData = [];
      this.ItemTableData.forEach(ele => {
        let vObj = {
          TableName: ele.apiUrl,
          insertData: this.$refs[ele.fName][0].tableData,
          headData: this.$refs[ele.fName][0].tableHeadData,
          IdentityColumn: ele.IdentityColumn
        };
        vData.push(vObj);
      });

      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: this.tableHeadData,
              IdentityColumn: this.fTableViewHead[1]
            },
            ...vData
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.errstr);
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
      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );

      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //tabs
    handleClick(activeName) {
      if (activeName == "second") {
      }
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
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
        this.$refs[this.activeName][0].tableData.unshift(value);
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
