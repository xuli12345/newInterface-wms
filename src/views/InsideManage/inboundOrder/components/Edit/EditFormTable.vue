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
        :fCustomerID="rowData.fCustomerID"
      ></child-form-head>
    </el-drawer>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare } from "@/utils/common";
import {
  getTableHeadData,
  collectionData,
  imPortExcel,
  importExcelTypeXls,
  importExcelTypeXlsx
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditChildFormHead";
import ChildTable from "./EditChildTable";
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
      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );
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
      res = JSON.parse(
        decryptDesCbc(res, String(this.userDes))
      );
      //   console.log(res);
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },
    //处理数据是修改的，还是新增的，还是删除的
    //传入的参数  （原来的数据，现在的数据）
    //返回一个数组，[修改，新增，删除]
    handelData(BackData, NowData) {
      let that = this;
      let Back = JSON.parse(JSON.stringify(BackData));
      let Now = JSON.parse(JSON.stringify(NowData));
      let update = [],
        insert = [],
        deleted = [],
        common = [];
      //获取原来的和现在的公有数据
      //公有数据就是修改的数据
      Back.forEach(item => {
        Now.forEach(child => {
          if (item[that.fTableViewHead[1]] == child[that.fTableViewHead[1]]) {
            common.push(child);
          }
        });
      });
      //公有数据和现在数据对比，把相同的删掉，剩下的就是新增的
      common.forEach(item1 => {
        Now.forEach((item2, idx2) => {
          if (item1[that.fTableViewHead[1]] == item2[that.fTableViewHead[1]]) {
            Now.splice(idx2, 1);
          }
        });
      });
      //公有数据和原有数据对比，把相同是删掉，剩下的就是删掉的
      common.forEach(child1 => {
        Back.forEach((child2, idx2) => {
          if (
            child1[that.fTableViewHead[1]] == child2[that.fTableViewHead[1]]
          ) {
            Back.splice(idx2, 1);
          }
        });
      });
      if (common.length < 1) {
        common = null;
      }
      if (Now.length < 1) {
        Now = null;
      }
      if (Back.length < 1) {
        Back = null;
      }
      return [common, Now, Back];
    },
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据

      backData.forEach(element => {
        for (const key in element) {
          if (element[key] == null) {
            this.$set(element, key, 0);
          }
        }
      });
      tableData.forEach(element => {
        for (const key in element) {
          if (element[key] == null) {
            this.$set(element, key, 0);
          }
        }
      });
      let wantData = this.handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
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
          //   console.log(res)
          res = JSON.parse(
            decryptDesCbc(res, String(this.userDes))
          );
          console.log(res);
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
      if (this.strType.includes("Inbound")) {
        window.location.href =
          "http://8.129.208.95:8001/ImportTempModFile/入库单导入模板.xlsx";
      } else if (this.strType.includes("Outbound")) {
        window.location.href =
          "http://8.129.208.95:8001/ImportTempModFile/出库单导入模板.xlsx";
      }
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
      window.location.href = "http://www.域名/template.xlsx(文件名)";
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
      console.log(res);
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
        this.insertData = [...tableData, ...this.insertData];
        // console.log(this.insertData);
      } else {
        this.$message.error(res.Message);
      }
    }
  },

  created() {
    this.getTableHeadData();
    this.getTableHead();
    // console.log(this.rowData,'rowData')
  }
};
</script>

<style></style>
