<template>
  <el-container
    v-loading="this.$store.state.common.loadingStatus"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <!-- 左侧菜单 -->
    <main-aside></main-aside>
    <el-container>
      <el-header class="header">
        <main-navbar></main-navbar>
      </el-header>
      <el-main>
        <main-tabs></main-tabs>
        <transition name="fade-transform" mode="out-in">
          <router-view></router-view>
        </transition>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import mainAside from "@/views/main-aside.vue";
import mainNavbar from "@/views/main-navbar.vue";
import mainTabs from "@/views/main-tabs.vue";

export default {
  components: {
    mainAside,
    mainNavbar,
    mainTabs
  },
  data() {
    return {};
  },
  computed: {
    sidebarFold: {
      //侧边栏折叠状态
      get() {
        return this.$store.state.common.sidebarFold;
      }
    },
    userId: {
      get() {
        return this.$store.state.user.id;
      },
      set(val) {
        this.$store.commit("user/updateId", val);
      }
    },
    userName: {
      get() {
        return this.$store.state.user.name;
      },
      set(val) {
        this.$store.commit("user/updateName", val);
      }
    }
  },
  created() {
    // this.getUserInfo();
  },
  methods: {
    // 获取当前管理员信息
    // getUserInfo() {
    //   this.$http({
    //     url: this.$http.adornUrl("/sys/user/info"),
    //     method: "get",
    //     params: this.$http.adornParams()
    //   }).then(({ data }) => {
    //     if (data && data.code === 0) {
    //       this.userId = data.user.userId;
    //       this.userName = data.user.username;
    //     }
    //   });
    // }
  }
};
</script>
<style lang="scss" scoped>
.el-container {
  height: 100%;
}
.header {
  height: 36px !important;
  background-color: lavender;
  box-shadow: 4px 4px 3px rgba(168, 168, 168, 0.84);
}
.el-main {
  padding: 0;
  margin-top: 40px;
}
</style>
