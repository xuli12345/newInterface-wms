<template>
  <div>
    <div class="btns" v-if="addItem">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
      >保存</el-button>
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm('ruleForm')">取消</el-button>
    </div>
    <el-form
      :label-position="labelPosition"
      label-width="160px"
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
          <el-date-picker
            v-if="item.fDataType == 'datetime'"
            v-model="ruleForm[item.fColumn]"
            type="datetime"
            placeholder="选择日期时间"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-date-picker>
          <!-- 需要使用下拉选择框的 -->
          <template
            v-else-if="
              selectArr && selectArr.length > 0 && selectFunction(item.fColumn)
            "
          >
            <el-select
              v-model="ruleForm[item.fColumn]"
              @change="getVal(ruleForm[item.fColumn], item.fColumn)"
              :disabled="item.fReadOnly == 0 ? false : true"
            >
              <el-option
                :value="i[selectVal(item.fColumn)]"
                v-for="i in selectData(item.fColumn)"
                :key="i[selectVal(item.fColumn)]"
                :label="i[selectStr(item.fColumn)]"
              ></el-option>
            </el-select>
          </template>
  
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
import { creatRules, defaultForm, compare } from "@/utils/common";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { getTableHeadData, getTableBodyData, getOrderNo } from "@/api/index";

export default {
  props: ["fTableViewHead", "addItem", "selectArr", "alertArr"],
  data() {
    return {
      //表单域标签的位置
      labelPosition: "right",
      //表单数据
      ruleForm: {},
      rules: {},
      tableHead: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      //需要下拉选择的所有数据
      selectAllData: [],
      fInboundOrderNo: ""
    };
  },
  created() {
    this.getTableHeadData();
    // console.log(1111, "created");

    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
  },
  mounted() {
    setTimeout(() => {
      this.getOrderNoData();
    }, 100);
  },
  methods: {
    //获取form表单数据
    async getTableHeadData() {
      let res = await getTableHeadData(this.fTableViewHead);
      res = JSON.parse(
        decryptDesCbc(res.getInterfaceEntityResult, String(this.userDes))
      );
      // console.log(res);
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
        this.ruleForm = defaultForm(this.tableHead);
        this.rules = creatRules(this.tableHead);
      } else {
        this.$message.error(res.Message);
      }
    },
    //获取入库单号
    async getOrderNoData() {
      let res = await getOrderNo(this.fTableViewHead);

      res = JSON.parse(
        decryptDesCbc(res.getOrderNoResult, String(this.userDes))
      );
      if (res.State) {
        for (const key in this.ruleForm) {
          if (
            key.indexOf("boundOrderNo") != -1 ||
            key.indexOf("CheckOrderNO") != -1
          ) {
            this.ruleForm[key] = res.Data;
          }
        }
      }
    },
    //新增子项,提交
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // this.$message.success("添加成功!");
          this.$notify({
            title: "新增",
            message: "新增成功",
            type: "success"
          });
          this.$emit("closeBox", JSON.parse(JSON.stringify(this.ruleForm)));
          this.$refs[formName].resetFields();
        } else {
          return false;
        }
      });
    },
    //取消
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.$emit("closeBox");
    },
    //判断当前字段是否需要做下拉框
    //v表头所有的字段
    selectFunction(v) {
      // console.log(v);
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
        // console.log(element)
        // console.log(element.fDes)
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
    getVal(val, n) {
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

    // 获取所有需要下拉选择的内容
    async getSelectData() {
      let arr = [];
      for (let i = 0; i < this.selectArr.length; i++) {
        let res = await getTableBodyData(this.selectArr[i].fUrl);
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
      //   console.log(arr);
      this.selectAllData = arr;
      // console.log(this.selectAllData, 11);
    }
  },
  computed: {
    sidebarLayoutSkin: {
      get() {
        return this.$store.state.common.sidebarLayoutSkin;
      }
    }
  },
  watch: {
    ruleForm: function(val) {
      this.ruleForm.fID = 0;
    }
  }
};
</script>
<style lang="scss" scoped></style>
