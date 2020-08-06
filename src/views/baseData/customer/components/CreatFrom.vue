<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存</el-button
      >
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>取消</el-button
      >
    </div>
    <el-form
      :label-position="labelPosition"
      label-width="180px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="flex-wrap form-margin"
    >
      <template v-for="(item, index) in tableHead">
        <el-form-item
          v-if="item.fVisible == 1"
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
        >
          <template v-if="fColumn.length > 0 && fColumn.includes(item.fColumn)">
            <el-select
              v-model="ruleForm[item.fColumn]"
              @change="getName(ruleForm[item.fColumn], item.fColumn)"
            >
              <el-option
                :value="i.fType"
                v-for="i in sData(item.fColumn)"
                :key="i.fType"
                :label="i.fColumnDes"
              ></el-option>
            </el-select>
          </template>

          <el-cascader
            v-else-if="item.fColumn == 'address'"
            size="large"
            :options="options"
            v-model="selectedOptions"
            @change="handleChange"
          >
          </el-cascader>
          <el-date-picker
            v-else-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-date-picker>

          <el-input
            v-else-if="item.fDataType == 'int'"
            v-model.number="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-input
            v-else-if="item.fDataType == 'decimal'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-checkbox>
          <el-input
            v-else-if="item.fColumn == 'fCountry'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-input
            v-else
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import {
  addformSaveData,
  collectionData,
  saveContainerCode
} from "@/api/index";
import { addParams, creatRules, defaultForm } from "@/utils/common";
import md5 from "js-md5";
import { regionData, CodeToText } from "element-china-area-data";
export default {
  data() {
    return {
      options: regionData,
      selectedOptions: [],
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      obj: {
        fColumn: "address",
        fColumnDes: "选择地址",
        fComputer: "",
        fDataType: "string",
        fDateFormat: "",
        fDecimal: 0,
        fEnd: "",
        fHeader: "",
        fIsNo: 0,
        fKey: 0,
        fLanguageCode: "",
        fLength: 200,
        fLoadData: 0,
        fNeedSave: 0,
        fNotNull: 1,
        fQureyCol: 1,
        fReadOnly: 0,
        fRemark: "",
        fSn: 0,
        fSort: 2,
        fTableView: "t_AddressBook",
        fVisible: 1
      },
      Areaobj: {}
    };
  },
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    tableName: {
      type: String,
      default: () => ""
    },
    fColumn: {
      type: Array,
      default: () => []
    },
    selData: {
      type: Array,
      default: () => []
    },

    switchArr: {
      type: Array,
      default: () => []
    },
    fVisibleColumn: {
      type: Array,
      default: () => []
    }
  },
 
  methods: {
    handleChange() {
      var loc = "";
      this.Areaobj = {};
      for (let i = 0; i < this.selectedOptions.length; i++) {
        loc += CodeToText[this.selectedOptions[i]] + ",";
      }

      loc = loc.substring(0, loc.lastIndexOf(","));
      let arr = loc.split(",");
      let newArr = ["fProvince", "fCity", "fDistrict"];

      for (let i = 0; i < newArr.length; i++) {
        this.Areaobj[newArr[i]] = arr[i];
      }

      if (this.Areaobj.fDistrict == undefined) {
        this.Areaobj.fDistrict = "";
      }

      this.ruleForm = Object.assign(this.ruleForm, this.Areaobj);
    },
    submitForm(formName) {
      if (JSON.stringify(this.Areaobj) == "{}") {
        this.$message.warning("请选择地址!");
        return;
      }

      this.$refs[formName].validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.tableName,
              headData: this.tableHead,
              insertData: [this.ruleForm]
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.State, res.Identity);
            this.changeColumn();
            this.$refs[formName].resetFields();
            this.ruleForm = defaultForm(this.tableHead);
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.$emit("closeBox");
      this.changeColumn();
    },
    changeColumn() {
      this.tableHead.splice(10, 1);
      this.fVisibleColumn.forEach(item => {
        this.tableHead.forEach(ele => {
          if (item == ele.fColumn) {
            this.$set(ele, "fVisible", 1);
          }
        });
      });
    },

    sData(v) {
      let arr = [];
      this.selData.forEach(element => {
        if (element.name == v) {
          arr = element.data;
        }
      });
      return arr;
    },
    getName(data, i) {
      // console.log(data, i);
      let arr = this.sData(i);
      this.ruleForm.fID = data;
      this.switchArr.forEach(v => {
        // console.log(v)
        if (v.fColumn == i) {
          this.ruleForm[v.sfColumn] = data;
        }
      });
    }
  },
  created() {
    this.ruleForm = defaultForm(this.tableHead);
    this.rules = creatRules(this.tableHead);
    this.tableHead.splice(10, 0, this.obj);
    this.fVisibleColumn.forEach(item => {
      this.tableHead.forEach(ele => {
        if (item == ele.fColumn) {
          this.$set(ele, "fVisible", 0);
        }
      });
    });
  }
};
</script>
<style lang="scss" scoped></style>
