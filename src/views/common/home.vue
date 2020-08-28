<template>
  <div>
    <el-card>
      <img class="chart-box" src="../../assets/img/微信图片_20200716162737.jpg" alt  :style="{'height': height + 'px' }" />
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
