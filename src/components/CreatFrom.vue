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
          <el-input
            v-else-if="item.fDataType == 'decimal'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-input>
          <el-checkbox
            v-else-if="item.fDataType == 'bit'"
            @change="showColumn(item.fColumn, ruleForm[item.fColumn], item)"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-checkbox>
          <el-input
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
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData, getTableBodyData } from "@/api/index";
import { creatRules, defaultForm } from "@/utils/common";
import md5 from "js-md5";
export default {
  data() {
    return {
      //表单数据
      ruleForm: {},
      //验证规则
      rules: {},
      //需要下拉选择的所有数据
      selectAllData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      userId: this.$store.state.user.userInfo.userId
    };
  },
  props: {
    //表头数据
    tableHead: {
      type: Array,
      default: () => []
    },
    //保存的tableName字段
    tableName: {
      type: String,
      default: () => ""
    },
    //需要做下拉框的数据
    selectArr: {
      type: Array,
      default: () => []
    },

    showfColumn: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    submitForm(formName) {
      // console.log(this.ruleForm);
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (this.ruleForm.fPassWord != undefined) {
            this.$set(
              this.ruleForm,
              "fPassWord",
              md5(this.ruleForm["fPassWord"])
            );
          }
          let res = await collectionData([
            {
              TableName: this.tableName,
              headData: this.tableHead,
              insertData: [this.ruleForm]
            }
          ]);
          // console.log(res, "保存的结果");
          // console.log(
          //   decryptDesCbc(
          //     res.saveDataResult,
          //     String(this.userDes),
          //     "保存解密的结果"
          //   )
          // );
          res = JSON.parse(
            decryptDesCbc(res.saveDataResult, String(this.userDes))
          );
          if (res.state === true) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.state, res.Identity);
            this.$refs[formName].resetFields();
            this.ruleForm = defaultForm(this.tableHead);
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
      let searchWhere=[];
      for (let i = 0; i < this.selectArr.length; i++) {
          if (this.selectArr[i].searchWhere) {
          searchWhere = this.selectArr[i].searchWhere;
        } else {
          searchWhere = [];
        }
        let res = await getTableBodyData(this.selectArr[i].fUrl,searchWhere);
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
    },
    showColumn(val, status, headItem) {
      // console.log(val, status);
      this.showfColumn.forEach(item => {
        if ((item.name = val && status)) {
          this.tableHead.forEach(child => {
            if (item.hidden.includes(child.fColumn)) {
              this.$set(child, "fVisible", 1);
            }
          });
        } else {
          this.tableHead.forEach(child => {
            if (item.hidden.includes(child.fColumn)) {
              this.$set(child, "fVisible", 0);
            }
          });
        }
      });
    }
  },

  created() {
    this.ruleForm = defaultForm(this.tableHead);
    this.rules = creatRules(this.tableHead);
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
  }
};
</script>
<style lang="scss" scoped></style>
