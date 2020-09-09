<template>
  <div ref="toPrint">
    <h1
      style="font-size:20px;display: flex;  align-items: center;  justify-content: center;"
    >
      {{ title[0] }}
    </h1>
    <h3
      style="font-size:16px;margin-bottom:10px;display: flex;  align-items: center;  justify-content: center;"
    >
      {{ title[1] }}
    </h3>
    <p class="page" style="display: flex; justify-content: flex-end;">
      单据打印时间:{{ dataTime }}
    </p>
    <div v-for="(item, index) in tableData" :key="index">
      <div
        style="margin-top:15px; margin-left:20px;display: flex;align-items: center;"
      >
        <span style="flex:1"
          >{{ tableHeadData[1] }}:{{ item.fCustomerName }}</span
        >
        <span style="flex:1"
          >{{ tableHeadData[2] }}:{{
            item.fInboundSumNum || item.fOutboundSumNum
          }}</span
        >
        <span style="flex:1"
          >{{ tableHeadData[0] }}:{{ item.OrdeTypeName }}</span
        >
        <span style="flex:1;text-align: right;">
          <svg
            :key="index"
            class="barcode"
            :jsbarcode-value="item.fOrderNo"
            jsbarcode-textmargin="0"
            jsbarcode-height="50"
            jsbarcode-displayvalue="false"
          ></svg
        ></span>
      </div>

      <el-table
      :header-cell-style="{ background: '#eef1f6'}"
        class="singleTable"
        ref="singleTable"
        border
        style="width: 100% ;"
        :data="RData(item.fID)"
      >
        <el-table-column type="index" width="30"></el-table-column>
        <template>
          <template v-for="(item, index) in ItemTableHeadData">
            <el-table-column
              v-if="item.fVisible == 1"
              :key="index"
              :label="item.fColumnDes"
              :prop="item.fColumn"
            >
              <!-- <template slot-scope="scope">
                <svg
                  v-if="item.fColumn == 'fProductBarCode'"
                  :key="index"
                  class="barcode"
                  :jsbarcode-value="scope.row.fProductBarCode"
                  jsbarcode-textmargin="0"
                  jsbarcode-height="20"
                  jsbarcode-displayvalue="false"
                  jsbarcode-width="1"
                ></svg>
                <div v-else>{{ scope.row[item.fColumn] }}</div>
              </template> -->
            </el-table-column>
          </template>
        </template>
      </el-table>
    </div>
    <div
      style="margin-top:15px; margin-left:20px;width:100%; display:flex;font-size:12px"
    >
      <span style="flex:1;">车牌号</span>
      <span style="flex:1;">开始时间:</span>
      <span style="flex:1;">结束时间:</span>
      <span style="flex:1;">退回木板&nbsp;&nbsp;&nbsp;&nbsp;块</span>
      <span style="flex:1;">实收木板&nbsp;&nbsp;&nbsp;&nbsp;块</span>
    </div>
    <div
      style="margin-top:15px; margin-left:20px;width:100%; display:flex;font-size:12px"
    >
      <span style="flex:1">仓库主管签名:</span>
      <span style="flex:1">产品温度:</span>
      <span style="flex:1">车厢温度:</span>
      <span style="flex:1">封条号:</span>
      <span style="flex:1">叉车员</span>
    </div>
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";
import { timeCycle } from "@/utils/updateTime"; //格式化时间
export default {
  props: [
    "dataCode",
    "printHeadData",
    "title",
    "ItemTableHeadData",
    "ItemBackData"
  ],
  data() {
    return {
      dataTime: timeCycle(new Date()),
      tableData: [],
      tableHeadData: []
    };
  },

  mounted() {
    this.tableData = this.dataCode;
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
  },
  methods: {
    RData(v) {
      // console.log(v)
      let TableList = [];
      this.ItemBackData.forEach(item => {
        item.forEach(child => {
          if (child.fMstID == v) {
            TableList = item;
          }
        });
      });
      return TableList;
    }
  },
  created() {
    this.tableHeadData = this.printHeadData;
  },
  watch: {
    dataCode(newVal, oldVal) {
      this.tableData = newVal;
      setTimeout(() => {
        JsBarcode(".barcode").init();
      }, 250);
    }
  }
};
</script>

<style lang="scss" scoped>
.input-box /deep/.el-input__inner {
  border: none !important;
}
</style>
