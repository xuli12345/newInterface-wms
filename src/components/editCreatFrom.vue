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
      label-position="right"
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
          <template
            v-if="
              selectArr && selectArr.length > 0 && selectFunction(item.fColumn)
            "
          >
            <el-select
              v-model="ruleForm[item.fColumn]"
              @change="getName(ruleForm[item.fColumn], item.fColumn)"
            >
              <el-option
                :value="i[selectVal(item.fColumn)]"
                v-for="i in selectData(item.fColumn)"
                :key="i[selectVal(item.fColumn)]"
                :label="i[selectStr(item.fColumn)]"
              ></el-option>
            </el-select>
          </template>

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
            @change="changePassword(ruleForm[item.fColumn])"
            v-else-if="item.fColumn == 'fPassWord'"
            v-model="ruleForm[item.fColumn]"
            type="password"
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
import { decryptDesCbc, encryptDesCbc } from "@/utils/cryptoJs.js";
import { addformSaveData, collectionData, getTableBodyData } from "@/api/index";
import { addParams, creatRules } from "@/utils/common";
import md5 from "js-md5";
export default {
  data() {
    return {
      //表单数据
      ruleForm: {},
      rules: {},
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId,
      //修改后的密码
      newPassword: "",
      selectAllData: []
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
    //需要做下拉框的数据
    selectArr: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    changePassword(val) {
      this.newPassword = val;
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (this.newPassword) {
            this.$set(this.ruleForm, "fPassWord", md5(this.newPassword));
          }

          console.log(this.ruleForm);
          let res = await collectionData([
            {
              headData: this.tableHead,
              updateData: [this.ruleForm],
              TableName: this.tableName
            }
          ]);
          res = JSON.parse(
            decryptDesCbc(res.saveDataResult, String(this.userDes))
          );
          if (res.state === true) {
            this.$message.success("修改成功!");

            this.$emit("closeBox", res.state);
            this.$refs[formName].resetFields();
          } else {
            this.$message.error(res.errstr);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.$emit("closeBox");
    },
    // 获取所有需要下拉选择的内容
    async getSelectData() {
      let arr = [];
      let searchWhere = [];
      for (let i = 0; i < this.selectArr.length; i++) {
        if (this.selectArr[i].searchWhere) {
          searchWhere = this.selectArr[i].searchWhere;
        } else {
          searchWhere = [];
        }
        let res = await getTableBodyData(this.selectArr[i].fUrl, searchWhere);
        res = JSON.parse(
          decryptDesCbc(res.qureyDataResult, String(this.userDes))
        );
        if (res.State) {
          let obj = {
            fName: this.selectArr[i].fName, //当前字段
            data: JSON.parse(res.Data) //当前字段下拉框的值
          };
          arr.push(obj);
        } else {
          this.$message.error(res.Message);
        }
      }
      this.selectAllData = arr;
    },
    //判断当前字段是否需要做下拉框
    //v表头所有的字段
    selectFunction(v) {
      let cc = false;
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          cc = true;
        }
      });
      return cc;
    },
    // options下拉选择框的内容
    selectData(v) {
      let arr = [];
      this.selectAllData.forEach(ele => {
        if (ele.fName == v) {
          arr = ele.data;
        }
      });
      return arr;
    },
    //下拉选择框需要显示的label字段
    selectStr(v) {
      let str = "";
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          str = element.fDes;
        }
      });
      return str;
    },
    //下拉选择框选择的值
    selectVal(v) {
      // console.log(this.selectArr)
      let str = "";
      this.selectArr.forEach(element => {
        if (element.fName == v) {
          str = element.fID;
        }
      });
      return str;
    },
    // 下拉选择框选中值后，带出其他需要带出的值
    getName(val, n) {
      // console.log(val,n)
      //当前选择框对应的数据
      let arr = [];
      this.selectAllData.forEach(ele => {
        if (ele.fName == n) {
          arr = ele.data;
        }
      });
      //选中值后对应的单条数据
      let data = {};
      arr.forEach(el => {
        if (el.fID == val) {
          data = el;
        }
      });

      this.selectArr.forEach(ele => {
        if (ele.fName == n && ele.fAuto) {
          ele.fAuto.forEach(item => {
            let i = false;
            if (ele.fAutoID) {
              i = ele.fAutoID.includes(item);
            }
            if (i) {
              this.ruleForm[item] = data.fID;
            } else {
              this.ruleForm[item] = data[item];
            }
            if (ele.fEdit && ele.fEdit.length > 0) {
              ele.fEdit.forEach(itemVal => {
                if (itemVal.key == item) {
                  this.ruleForm[item] = data[itemVal.value];
                }
              });
            }
          });
        }
      });
    }
  },

  created() {
    this.rules = creatRules(this.tableHead);
    this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    // console.log(this.rowData)
    this.ruleForm.fModifyDate = new Date();
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
    //判断获取下拉框的数据
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
    // console.log(this.tableHead);
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

    // console.log(this.ruleForm);
    if (this.ruleForm.fType) {
      if (this.ruleForm.fType.includes("模块分类")) {
        this.$set(this.ruleForm, "fType", 1);
      } else if (this.ruleForm.fType.includes("模块程序")) {
        this.$set(this.ruleForm, "fType", 0);
      }
    }
  },
  watch: {
    rowData(newVal, oldVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal));
      this.ruleForm.fModifyDate = new Date();
      let userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.$set(this.ruleForm, "fModifier", userInfo.userId);
      this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);

      if (this.ruleForm.fType) {
        if (this.ruleForm.fType.includes("模块分类")) {
          this.$set(this.ruleForm, "fType", 1);
        } else if (this.ruleForm.fType.includes("模块程序")) {
          this.$set(this.ruleForm, "fType", 0);
        }
      }
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
  }
};
</script>
<style lang="scss" scoped></style>
