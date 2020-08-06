<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
      >
        新增</el-button
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
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
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
        :alertArr="alertArr"
      ></child-form-head>
    </el-drawer>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import {
  getTableHeadData,
  collectionData,
  imPortExcel,
  importExcelTypeXls,
  importExcelTypeXlsx
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./ChildFormHead";
import ChildTable from "./ChildTable";
export default {
  //strType:导入文件的类型
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "alertArr",
    "strType"
  ],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      tableHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格数据
      tableData: [],
      //表格数据表头
      tableHead: [],
      //excel
      fileTemp: null,
      file: null,
      fileName: ""
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
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
    //获取表格的表头
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: this.tableHeadData,
              IdentityColumn: this.fTableViewHead[1]
            },
            {
              TableName: this.fTableViewItem[0],
              insertData: this.tableData,
              headData: this.tableHead,
              IdentityColumn: this.fTableViewItem[1]
            }
          ]);

          res = JSON.parse(
            decryptDesCbc(res, String(this.userDes))
          );

          if (res.State === true) {
            this.$message.success("新增成功!");
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
        this.tableData.unshift(value);
      }
      this.drawer = false;
    },
    // excel导入
    handleChange(file, fileList) {
      // console.log(file, fileList);
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        //xlsx
        if (
          this.fileTemp.type ==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          this.importExcelTypeXlsx(this.fileTemp);
        } else if (this.fileTemp.type == "application/vnd.ms-excel") {
          //.xls
          this.importExcelTypeXls(this.fileTemp);
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
      // this.importFile(this.fileTemp);
    },

    handleRemove(file, fileList) {
      this.fileTemp = null;
    },
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Inbound")) {
        window.location.href =
          "http://8.129.208.95:8001/ImportTempModFile/入库单导入模板.xlsx";
      } else if (this.strType.includes("Outbound")) {
        window.location.href =
          "http://8.129.208.95:8001/ImportTempModFile/出库单导入模板.xlsx";
      }
    },

    async importExcelTypeXls(obj) {
      let _this = this;
      let inputDOM = this.$refs.inputer;
      // 通过DOM取文件数据
      this.file = event.currentTarget.files[0];
      let res = await importExcelTypeXls(this.file);
      // console.log(res, "xls");
      let xlsFileName = res.ImPortExcel_xlsResult.strFileName;
      if (res.ImPortExcel_xlsResult.State) {
        this.importFile(this.strType, xlsFileName);
      } else {
        this.$message.error(res.ImPortExcel_xlsResult.Message);
      }
    },
    async importExcelTypeXlsx(obj) {
      let _this = this;
      let inputDOM = this.$refs.inputer;
      // 通过DOM取文件数据
      this.file = event.currentTarget.files[0];
      let res = await importExcelTypeXlsx(this.file);
      console.log(res, "xlsx");
      let xlsxFileName = res.ImPortExcel_xlsxResult.strFileName;

      if (res.ImPortExcel_xlsxResult.State) {
        this.importFile(this.strType, xlsxFileName);
      } else {
        this.$message.error(res.ImPortExcel_xlsxResult.Message);
      }
    },
    async importFile(strType, fileName) {
      let res = await imPortExcel({
        strType: strType,
        strFileName: fileName
      });
      res = JSON.parse(
        decryptDesCbc(res.ImportExcelResult, String(this.userDes))
      );
     
      if (res.State) {
        this.$message.success("导入成功!");
        let tableData = JSON.parse(res.Data).sort(compare);
        tableData.forEach(element => {
          for (const key in element) {
            if (JSON.stringify(element[key]).indexOf("/Date") != -1) {
              element[key] = timeCycle(element[key]);
            }
          }
        });
        this.tableData = [...tableData, ...this.tableData];
        // console.log(this.tableData);
      } else {
        if (res.Message == null) {
          this.$message.error("上传失败!");
        } else {
          this.$message.error(res.Message);
        }
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
