<template>
  <div class="site-wrapper">
    <div class="site-content">
      <img
        src="https://file02.16sucai.com/d/file/2014/1006/e94e4f70870be76a018dff428306c5a3.jpg"
        alt
      />
      <!-- <img src="../../assets/img/微信图片_20200716162737.jpg" alt=""> -->
      <p class="title">欢迎进入知行易通仓储管理系统平台</p>
    </div>
    <div class="login-main">
      <h3 class="login-title">管理员登录</h3>

      <el-form
        :model="dataForm"
        :rules="dataRule"
        ref="dataForm"
        @keyup.enter.native="submitForm('dataForm')"
        status-icon
      >
        <el-form-item>
          <el-select v-model="value" placeholder="请选择仓库" class="select">
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.fCompanyName"
              :value="item.fCompanyName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="dataForm.username" placeholder="帐号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="dataForm.password"
            type="password"
            placeholder="密码"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            class="login-btn-submit"
            type="primary"
            @click="submitForm('dataForm')"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
//导入请求的api
import { userLogin } from "@/api/user";
import { companyList, getUserLimitMenu, menus } from "@/api/index.js";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import axios from "axios";
import md5 from "js-md5";
export default {
  name: "login",
  data() {
    return {
      options: [],
      value: "",
      dataForm: {
        username: "",
        password: ""
      },
      dataRule: {
        username: [
          { required: true, message: "帐号不能为空", trigger: "blur" }
        ],
        password: [{ required: true, message: "密码不能为空", trigger: "blur" }]
      },
      fCompanyId: -1
    };
  },

  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          let res = await userLogin({
            username: this.dataForm.username,
            password: md5(this.dataForm.password)
          });

          if (res.state) {
            let user = {
              username: res.userName,
              userId: res.userID,
              usercode: res.userCode,
              userDes: decryptDesCbc(res.desCode, "d#s87@28se45&i(p")
            };
    
            window.sessionStorage.setItem("user", JSON.stringify(user));
            this.$store.commit("user/updataUser", user);
            this.$message.success("登录成功!");

            let userId = res.userID;
            let userDes = decryptDesCbc(res.desCode, "d#s87@28se45&i(p");
            // //用户权限
            let fSqlConn = 1;

            this.options.forEach((item, index) => {
              if (this.value == item.fCompanyName) {
                fSqlConn = item.fSqlConn;
              }
            });
            let res1 = await getUserLimitMenu(
              [this.fCompanyId, userId],
              fSqlConn
            );
            res1 = JSON.parse(decryptDesCbc(res1, String(userDes)));
            sessionStorage.setItem("userLimit", res1.Data);
            this.$router.replace({ name: "home" });
            let user2 = this.$store.state.user.userInfo;
            let res3 = await menus(user2);
            res3 = JSON.parse(
              decryptDesCbc(res3.urlMenuResult, String(user.userDes))
            );
            if (res3.State) {
              this.$store.commit("common/updateMenuList", res3.Menuurl.Child);
            }
          } else {
            this.$message.warning(res.userLoginResult.Message);
          }
        } else {
          this.$message.error("登录失败!");
          return false;
        }
      });
    }
  },
  watch: {
    value(newVal, oldVal) {
      this.options.forEach((item, index) => {
        if (newVal == item.fCompanyName) {
          sessionStorage.setItem("sqlConn", JSON.stringify(item.fSqlConn));
          sessionStorage.setItem("requestUrl", item.fServiceUrl);
          sessionStorage.setItem("fCompanyId", item.fID);
          this.fCompanyId = item.fID;
        }
      });
    }
  },

  async created() {
    let res = await companyList();
    if (res.state) {
      let resCom = res.lstRet;
      // console.log(resCom);
      this.options = resCom;
      this.value = resCom[0].fCompanyName;
      sessionStorage.setItem("sqlConn", JSON.stringify(resCom[0].fSqlConn));
      sessionStorage.setItem("requestUrl", resCom[0].fServiceUrl);
      this.fCompanyId = resCom[0].fID;
    } else {
      // console.log(res);
    }
  }
};
</script>

<style lang="scss" scoped>
.site-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
.site-content {
  position: relative;
  flex: 1;
  img {
    height: 100%;
    width: 100%;
  }
  .title {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    font-size: 40px;
    font-weight: 700;
    margin: 200px 0 0 160px;
    color: #66b1ff;
  }
}
.login-main {
  width: 400px;
  background-color: #fff;
  // background-color: #1b3651;
  padding: 200px 50px 180px;
  .select {
    width: 100%;
  }
}
.login-title {
  // color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 60px;
}

.login-btn-submit {
  width: 100%;
  margin-top: 38px;
}
.el-form-item {
  width: 100%;
}
/deep/ .el-input__inner {
  height: 40px !important;
}
</style>
