<template>
  <div ref="toPrint">
    <div
      :span="8"
      v-for="(item, index) in tableData"
      :key="index"
      style="text-align: center;margin:15px 0"
    >
      <div>库位标签</div>
      <svg
        :key="index"
        class="barcode"
        :jsbarcode-value="item.fStorageBarCode"
        jsbarcode-textmargin="0"
        jsbarcode-height="75"
      ></svg>
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
