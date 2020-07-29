<template>
  <div>
    <div class="page flex-justify-end">
      <el-button type="primary" size="mini" class="iconfont icon-baocun" @click="submitForm('ruleForm')">保存</el-button>
      <el-button class="iconfont icon-quxiao"     size="mini" @click="resetForm('ruleForm')"> 取消</el-button>
    </div>
    <el-form
      :label-position="labelPosition"
      label-width="125px"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      class="flex-wrap"
    >
      <el-form-item
        v-for="(item, index) in tableHead"
        :key="index"
        :label="item.fColumnDes"
        :prop="item.fColumn"
      >
    
        <el-date-picker
          v-if="item.fDataType == 'datetime'"
          v-model="ruleForm[item.fColumn]"
          type="datetime"
          placeholder="选择日期时间"
          :disabled="item.fReadOnly == 0 ? false : true"
        ></el-date-picker>
      
        <el-input v-else-if="item.fDataType == 'int'" v-model.number="ruleForm[item.fColumn]" :disabled="item.fReadOnly == 0 ? false : true"></el-input>
        <el-checkbox v-else-if="item.fDataType == 'bit'" v-model="ruleForm[item.fColumn]" :disabled="item.fReadOnly == 0 ? false : true"></el-checkbox>
      
        <el-select
          v-else-if="item.fColumn == 'fDataType'"
          v-model="ruleForm[item.fColumn]"
          placeholder="请选择"
          :disabled="item.fReadOnly == 0 ? false : true"
        >
          <el-option
            v-for="optionItem in selectOptions"
            :key="optionItem.value"
            :label="optionItem.label"
            :value="optionItem.value"

          ></el-option>
        </el-select>
        <el-input
          v-else
          v-model="ruleForm[item.fColumn]"
        :disabled="item.fReadOnly == 0 ? false : true"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
export default {
  name: "addInterface",
  props: ["tableHead", "fTableView"],
  data() {
    return {
      //表单域标签的位置
      labelPosition: "right",
      //Columns
      columns: [],
    
      userDes: this.$store.state.user.userInfo.userDes,
      //表单数据
      ruleForm: {},
      rules: {},
      selectOptions: [
        { label: "字符串", value: "string" },
        { label: "整数", value: "int" },
        { label: "小数", value: "decimal" },
        { label: "布尔值", value: "bit" },
        { label: "数组", value: "bytes" },
        { label: "日期与时间", value: "datetime" }
      ]
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.$message.success("新增成功!");
          this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
          this.$refs[formName].resetFields();
          this.defaultForm();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.$emit("closeBox");
    },
    //创建动态表单验证规则
    creatRules(data) {
      let rules = {};
      data.forEach((item, index) => {
        let rulesArr = [];
        if (item.fNotNull == 1) {
          switch (item.fDataType) {
            case "string":
              rulesArr = [
                {
                  required: true,
                  message: item.fColumnDes + "不能为空",
                  trigger: "change"
                },
                { type: "string", message: "请输入字符串" },
                {
                  max: item.fLength,
                  message: "长度不能大于" + item.fLength
                }
              ];
              rules[item.fColumn] = rulesArr;
              break;
            case "datetime":
              rulesArr = [
                {
                  required: true,
                  message: item.fColumnDes + "不能为空",
                  trigger: "blur"
                },
                { type: "date", message: "请输入时间" }
              ];
              rules[item.fColumn] = rulesArr;
              break;
            case "int":
              rulesArr = [
                {
                  required: true,
                  message: item.fColumnDes + "不能为空",
                  trigger: "blur"
                },
                { type: "number", message: "请输入数字" }
              ];
              rules[item.fColumn] = rulesArr;
              break;
            case "bit":
              rulesArr = [
                {
                  required: true,
                  message: item.fColumnDes + "不能为空",
                  trigger: "blur"
                }
              ];
              rules[item.fColumn] = rulesArr;
          }
        } else if (item.fNotNull == 0) {
          switch (item.fDataType) {
            case "string":
              rulesArr = [
                { type: "string", message: "请输入字符串", trigger: "blur" },
                {
                  max: item.fLength,
                  message: "长度不能大于" + item.fLength,
                  trigger: "blur"
                }
              ];
              if (
                item.fColumn == "fCreater" ||
                "fCreaterCode" ||
                "fModifier" ||
                "fModifierCode"
              ) {
              } else {
                rules[item.fColumn] = rulesArr;
              }
              break;
            case "datetime":
              rulesArr = [{ message: "请输入时间", trigger: "blur" }];
              rules[item.fColumn] = rulesArr;
              break;
            case "int":
              rulesArr = [
                { type: "number", message: "请输入数字", trigger: "blur" }
              ];
              rules[item.fColumn] = rulesArr;
          }
        }
      });
      this.rules = rules;
    },
    //设置表单默认值
    defaultForm() {
      var obj = {};
      this.tableHead.forEach(element => {
        if (element.fDataType == "datetime") {
          obj[element.fColumn] = new Date();
        } else if (element.fDataType == "bit") {
          obj[element.fColumn] = true;
        } else if (element.fColumn === "fTableView") {
          obj[element.fColumn] = this.fTableView;
        }
      });
      this.ruleForm = obj;
    }
  },
  created() {
    this.creatRules(this.tableHead);
    this.defaultForm();
  },
  computed: {
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      }
    }
  },
};
</script>
<style lang="scss" scoped></style>
