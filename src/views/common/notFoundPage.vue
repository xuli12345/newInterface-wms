<template>
  <div class="middle-box text-center animated fadeInDown">
    <h1>404</h1>
    <h3 class="font-bold">页面未找到！</h3>

    <div class="error-desc">
      抱歉，页面好像去火星了~
    </div>
  </div>
</template>
<script>
export default {
  name: "notFoundPage",
};
</script>
<style lang="scss" scoped>
.middle-box {
  max-width: 400px;
  z-index: 100;
  margin: 0 auto;
  padding-top: 40px;
  text-align: center;
  height: 100%;
}
.middle-box h1 {
  font-size: 170px;
}
.font-bold {
  font-weight: 600;
}
</style>
