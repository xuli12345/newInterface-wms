<template>
  <div>
    <div class="btns">
      <el-button type="primary" size="mini" @click="submitForm('ruleForm')">
        <i class="iconfont icon-baocun"></i>保存
      </el-button>
      <el-button size="mini" @click="resetForm('ruleForm')">
        <i class="iconfont icon-quxiao"></i>
        取消
      </el-button>
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
          <!-- 省市联动 -->
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
          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-checkbox>

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
import { decryptDesCbc, encryptDesCbc } from "@/utils/cryptoJs.js";
import { addformSaveData, collectionData } from "@/api/index";
import { addParams, creatRules } from "@/utils/common";
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
      }
    };
  },
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    rowData: {
      type: Object,
      default: () => {}
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
    selectParams: {
      type: Array,
      default: () => []
    },
    fVisibleColumn: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      }
    }
  },
  methods: {
    handleChange() {
      var loc = "";
      let obj = {};
      for (let i = 0; i < this.selectedOptions.length; i++) {
        loc += CodeToText[this.selectedOptions[i]] + ",";
      }

      loc = loc.substring(0, loc.lastIndexOf(","));
      let arr = loc.split(",");
      let newArr = ["fProvince", "fCity", "fDistrict"];

      for (let i = 0; i < newArr.length; i++) {
        obj[newArr[i]] = arr[i];
      }

      if (obj.fDistrict == undefined) {
        obj.fDistrict = "";
      }
      // console.log(obj);
      this.ruleForm = Object.assign(this.ruleForm, obj);
    },

    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              headData: this.tableHead,
              updateData: [this.ruleForm],
              TableName: this.tableName
            }
          ]);
          res = JSON.parse(
            decryptDesCbc(res, String(this.userDes))
          );
          if (res.State) {
            this.$message.success("修改成功!");
            this.changeColumn();
            this.$emit("closeBox", res.State);
            this.$refs[formName].resetFields();
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
      this.switchArr.forEach(v => {
        if (v.fColumn == i) {
          this.ruleForm[v.sfColumn] = data;
        }
      });
    },
    //回显省事联动
    selGetArea() {
      let str = [];
      this.selectParams.forEach(item => {
        for (const key in this.ruleForm) {
          if (item == key) {
            str.push(this.ruleForm[item]);
          }
        }
      });

      var temp = [];
      let that = this;
      scoure(str);
      function scoure(str) {
        for (let i = 0; i < that.options.length; i++) {
          function getChildren(item) {
            if (str.includes(item.label)) {
              temp = temp.concat(item.value);
              if (item.children && item.children.length > 0) {
                item.children.forEach(v => {
                  getChildren(v);
                });
              }
            }
            return temp;
          }
          getChildren(that.options[i]);
        }
      }
      this.selectedOptions = temp;
    },
    //处理bit类型的回显
    changeBool() {
      this.tableHead.forEach(element => {
        if (element.fDataType == "bit" && this.ruleForm[element.fColumn] == 1) {
          this.$set(this.ruleForm, element.fColumn, true);
        } else if (
          element.fDataType == "bit" &&
          this.ruleForm[element.fColumn] == 0
        ) {
          this.$set(this.ruleForm, element.fColumn, false);
        }
      });
    }
  },
  created() {
    this.rules = creatRules(this.tableHead);
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    // console.log(this.ruleForm);
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
    this.ruleForm.fModifyDate = new Date();
    this.tableHead.splice(10, 0, this.obj);
    this.fVisibleColumn.forEach(item => {
      this.tableHead.forEach(ele => {
        if (item == ele.fColumn) {
          this.$set(ele, "fVisible", 0);
        }
      });
    });
    this.selGetArea();
    this.changeBool();
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal));
      // console.log(this.ruleForm);
      this.selGetArea();
      this.changeBool();
      this.tableHead.splice(3, 0, this.obj);
      this.fVisibleColumn.forEach(item => {
        this.tableHead.forEach(ele => {
          if (item == ele.fColumn) {
            this.$set(ele, "fVisible", 0);
          }
        });
      });

      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.$set(this.ruleForm, "fModifier", userInfo.userId);
      this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
      this.ruleForm.fModifyDate = new Date();
    }
  }
};
</script>
<style lang="scss" scoped></style>
