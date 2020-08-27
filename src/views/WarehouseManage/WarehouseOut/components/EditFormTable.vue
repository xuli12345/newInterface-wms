<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        class="el-icon-bottom"
        @click="downloadTemp"
        size="mini"
        >下载模板</el-button
      >
      <el-upload
        style="margin-right:5px;float:left"
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
        <el-button type="primary" class="iconfont icon-excel" size="mini"
          >导入excel</el-button
        >
      </el-upload>
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >新增</el-button
      >
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
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fID"
      :changeData="changeData"
    ></child-table>
    <!-- 新增字表数据 -->
    <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="addItem"
    >
      <child-form-head
        @closeBox="closeItemBox"
        :fTableViewHead="fTableViewItem[0]"
        ref="ItemRuleForm"
        :addItem="addItem"
        :selectArr="selectArr2"
      ></child-form-head>
    </el-drawer>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare, handelData } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { getTableHeadData, collectionData, imPortExcel } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "../../component/EditChildFormHead";
import ChildTable from "../../component/EditChildTable";

export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "rowData",
    "changeData",
    "strType"
  ],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      //   fTableView: "",
      tableHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格添加的数据
      insertData: {},
      //表格数据表头
      tableHead: []
    };
  },
  methods: {
    //获取form表单数据
    async getTableHeadData() {
      // console.log(this.fTableViewHead)
      let res = await getTableHeadData(this.fTableViewHead[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      //   console.log(res)
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取表格的表头，保存的时候需要用到
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      //   console.log(res);
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },

    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据

      let wantData = handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      let deletedArr = wantData[2];
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: this.tableHeadData
            },
            {
              TableName: this.fTableViewItem[0],
              updateData: updateArr,
              insertData: insertArr,
              deleteData: deletedArr,
              headData: this.tableHead
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State === true) {
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
    //新增按钮
    addPopRight() {
      this.drawer = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        this.insertData = value;
      }
      this.drawer = false;
    },
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Outbound")) {
        window.location.href =`${tempUrl}/ImportTempModFile/出库单导入模板.xlsx`
        
      }
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
            message: "附件格式错误，请删除后重新上传！"
          });
        }
      } else {
        this.$message({
          type: "warning",
          message: "请上传附件！"
        });
      }
    },

    handleRemove(file, fileList) {
      this.fileTemp = null;
    },


    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });

      if (res.state) {
        this.$message.success("导入成功!");
        let tableData = JSON.parse(res.Data).sort(compare);
        tableData.forEach(element => {
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
        this.insertData = [...tableData, ...this.insertData];
      } else {
        this.$message.error(res.Message);
      }
    }
  },

  created() {
    this.getTableHeadData();
    this.getTableHead();
  }
};
</script>

<style></style>
