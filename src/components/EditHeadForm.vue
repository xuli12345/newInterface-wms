<template>
  <div>
    <el-form
      label-position="rigth"
      label-width="145px"
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
            @change="disColumn(item.fColumn, ruleForm[item.fColumn], item)"
            v-else-if="item.fDataType == 'bit'"
            v-model="ruleForm[item.fColumn]"
            :disabled="item.fReadOnly == 0 ? false : true"
          ></el-checkbox>
          <el-select
            v-else-if="isUserLimit && item.fColumn == 'fUserName'"
            v-model="ruleForm[item.fColumn]"
            placeholder="请选择用户"
            @change="GetUserId"
            :disabled="item.fReadOnly == 0 ? false : true"
          >
            <el-option
              v-for="item in UserArr"
              :key="item.fID"
              :label="item.fUserName"
              :value="item.fID"
            ></el-option>
          </el-select>
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
import { creatRules, defaultForm } from "@/utils/common";
import { getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
export default {
  props: {
    tableHead: {
      type: Array,
      default: () => []
    },
    rowData: {
      type: Object,
      default: () => {}
    },
    isUserLimit: {
      type: Boolean,
      default: () => false
    },
    UserArr: {
      type: Array,
      default: () => []
    },
    disabledfColumn: {
      type: Array,
      default: () => []
    },
    selectArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      //表单数据
      ruleForm: {},
      rules: {},
      //需要下拉选择的所有数据
      selectAllData: [],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    GetUserId(data) {
      // console.log(y)
      this.ruleForm.fUserID = data;
      this.UserArr.forEach(element => {
        if (element.fID == data) {
          this.ruleForm.fUserCode = element.fUserCode;
        }
      });
    },
    disColumn(val, status, headItem) {
      // console.log(val, status, headItem);
      for (let i = 0; i < this.disabledfColumn.length; i++) {
        if (this.disabledfColumn[i].name == val && status) {
          this.tableHead.forEach(child => {
            if (this.disabledfColumn[i].disColumn.includes(child.fColumn)) {
              this.$set(child, "fReadOnly", 1);
              this.disabledfColumn[i].disColumn.forEach(element => {
                this.$set(this.ruleForm, element, 0);
              });
            }
          });
          break;
        } else {
          this.tableHead.forEach(child => {
            if (this.disabledfColumn[i].disColumn.includes(child.fColumn)) {
              this.$set(child, "fReadOnly", 0);
              this.disabledfColumn[i].disColumn.forEach(element => {
                this.$set(this.ruleForm, element, 1);
              });
            }
          });
        }
      }
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
    }
  },
  mounted() {
    if (this.rowData) {
      this.ruleForm = JSON.parse(JSON.stringify(this.rowData));
    } else {
      this.ruleForm = defaultForm(this.tableHead);
    }
    if (this.selectArr && this.selectArr.length > 0) {
      this.getSelectData();
    }
    this.rules = creatRules(this.tableHead);
    this.ruleForm.fModifyDate = new Date();
    let userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.$set(this.ruleForm, "fModifierCode", userInfo.usercode);
    this.$set(this.ruleForm, "fModifier", userInfo.userId);
  },
  watch: {
    ruleForm: {
      handler(val) {
        this.tableHead.forEach(item => {
          if (item.fDataType == "bit") {
            if (val[item.fColumn] == 1) {
              // val[item.fColumn]=true
              this.$set(this.ruleForm, item.fColumn, true);
            } else if (val[item.fColumn] == 0) {
              // val[item.fColumn]=false
              this.$set(this.ruleForm, item.fColumn, false);
            }
          }
        });
      },

      deep: true // 表示开启深度监听
    }
  }
};
</script>
<style lang="scss" scoped></style>
