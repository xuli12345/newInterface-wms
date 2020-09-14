<template>
  <div ref="toPrint">
    <div
      :span="8"
      v-for="(item, index) in tableData"
      :key="index"
      style="margin:15px 0;display:flex;flex-direction:column;align-items:center"
    >
      <div>
        <svg
          :key="index"
          class="barcode"
          :jsbarcode-value="item.fOutboundOrder"
          jsbarcode-textmargin="0"
          jsbarcode-height="50"
          jsbarcode-displayvalue="false"
        ></svg>
      </div>
      <div style="display:flex">
        <div>
          <p>门店代码:{{ item.fShopCode }}</p>
          <p>门店名称:{{ item.fShopName }}</p>
        </div>
        <div style="margin-left:30px">
          <p>拣货单号:{{ item.fOutboundOrderNo }}</p>
          <p>数量:{{ item.fSkus }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import JsBarcode from "jsbarcode";

export default {
  props: ["dataCode"],
  data() {
    return {
      tableData: [],
      dataTime: new Date()
    };
  },

  mounted() {
    this.tableData = this.dataCode;
    // console.log(this.dataCode)
    setTimeout(() => {
      JsBarcode(".barcode").init();
    }, 250);
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

<style>
.input-box /deep/.el-input__inner {
  border: none !important;
}
</style>
