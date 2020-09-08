<template>
  <div>
    <el-card>
      <img class="chart-box" src="../../assets/img/home_bg.jpg" alt  :style="{'height': height + 'px' }" />
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {  
      height:document.body.clientHeight-130
    };
  }
};
</script>
<style lang="scss" scoped>
.chart-box {
  width: 100%;
  
}
</style>
