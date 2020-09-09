import Vue from "vue";
import VueRouter from "vue-router";
import { menus } from "@/api/index";
import store from "@/store/store";
import { clearLoginInfo } from "@/utils/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";

Vue.use(VueRouter);

// 全局路由(无需嵌套上左右整体布局)
let globalRoutes = [
  {
    path: "/login",
    name: "/login",
    component: () => import("@/views/common/login"),
    meta: {
      title: "登录"
    }
  },
  {
    // 404页面
    path: "*",
    component: () => import("@/views/common/notFoundPage"),
    meta: {
      title: "404未找到"
    }
  }
];

// 主入口路由(需嵌套上左右整体布局)
var mainRoutes = {
  path: "/",
  component: () => import("@/views/main"),
  name: "main",
  redirect: { name: "home" },
  meta: { title: "主入口整体布局" },
  //通过meta对象设置路由展示方式 isTab: 是否通过tab展示内容, true: 是, false: 否
  children: [
    {
      path: "/home",
      name: "home",
      meta: {
        title: "首页",
        isTab: true
      },
      component: () => import("@/views/common/home")
    }
  ],
  beforeEnter(to, from, next) {
    let user = store.state.user.userInfo;
    // console.log(user);
    if (!user) {
      clearLoginInfo();
      next({ name: "login" });
    }
    next();
  }
};

// 路由对象
// let router = new VueRouter({
//  mode: "hash",
//  isAddDynamicMenuRoutes: false, // 是否已经添加动态(菜单)路由
//  routes: globalRoutes.concat(mainRoutes)
// });
//根据权限变化动态清除注册的路由
const createRouter = () =>
  new VueRouter({
    mode: "hash",
    scrollBehavior: () => ({ y: 0 }),
    isAddDynamicMenuRoutes: false,
    routes: globalRoutes.concat(mainRoutes)
  });

const router = createRouter();
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router 注册的路由信息都是存放在matcher
}

// 注册(添加)导航守卫 前置守卫
router.beforeEach(async (to, from, next) => {
  let user = store.state.user.userInfo;
  // console.log(user)
  // 添加动态(菜单)路由
  // 1. 已经添加 or 全局路由, 直接访问
  // 2. 获取菜单列表, 添加并保存本地存储
  if (
    router.options.isAddDynamicMenuRoutes ||
    fnCurrentRouteType(to, globalRoutes) === "global"
  ) {
    next();
  } else {
    //获取菜单列表 动态路由

    try {
      let res = await menus(user);
      let resultData = JSON.parse(decryptDesCbc(res, String(user.userDes)));
      if (resultData.State) {
        fnAddDynamicMenuRoutes(resultData.Menuurl.Child);
        router.options.isAddDynamicMenuRoutes = true;
        window.sessionStorage.setItem(
          "menuList",
          JSON.stringify(resultData.Menuurl.Child) || "[]"
        );
        // console.log(resultData)
        next({ ...to, replace: true });
      } else {
        sessionStorage.setItem("menuList", "[]");
        next();
      }
    } catch (error) {
      console.log(`%c${error} 请求菜单列表和权限失败，跳转至登录页！！`);
      router.push({ path: "/login" });
    }
  }
});

/**
 * 判断当前路由类型, global: 全局路由, main: 主入口路由
 * @param {*} route 当前路由 globalRoutes路由对象
 */
function fnCurrentRouteType(route, globalRoutes = []) {
  var temp = [];
  for (var i = 0; i < globalRoutes.length; i++) {
    if (route.path === globalRoutes[i].path) {
      return "global";
    } else if (
      globalRoutes[i].children &&
      globalRoutes[i].children.length >= 1
    ) {
      temp = temp.concat(globalRoutes[i].children);
    }
  }
  return temp.length >= 1 ? fnCurrentRouteType(route, temp) : "main";
}

/**
 * 添加动态(菜单)路由
 * @param {*} menuList 菜单列表
 * @param {*} routes 递归创建的动态(菜单)路由
 */
function fnAddDynamicMenuRoutes(menuList = [], routes = []) {
  var temp = [];
  let _userLimit = JSON.parse(sessionStorage.getItem("userLimit"));
  scoure();
  function scoure() {
    for (let i = 0; i < menuList.length; i++) {
      function getChildren(item) {
        if (item.Child && item.Child.length > 0) {
          item.Child.forEach(v => {
            getChildren(v);
          });
        } else {
          let show = false;
          if (_userLimit && _userLimit.length > 0) {
            _userLimit.forEach(element => {
              if (element.fModID == item.MenuID && element.fLook == 1) {
                show = true;
              }
            });
          }
          if (item.Type == 1) {
            temp = temp.concat(item);
          } else if (show) {
            temp = temp.concat(item);
          }
        }
        return temp;
      }
      getChildren(menuList[i]);
    }
  }
  if (temp.length > 0) {
    for (let j = 0; j < temp.length; j++) {
      var route = {
        path: temp[j].Url,
        component: () => import(`@/views/${temp[j].Url}`) || null,
        name: temp[j].Url,
        meta: {
          menuId: temp[j].MenuID,
          title: temp[j].MenuName,
          isDynamic: true,
          isTab: true
        }
      };
      routes.push(route);
    }
    mainRoutes.name = "main-dynamic";
    mainRoutes.children = routes;
    router.addRoutes([
      mainRoutes,
      {
        path: "*",
        redirect: {
          name: "notFoundPage"
        }
      }
    ]);
    sessionStorage.setItem(
      "dynamicMenuRoutes",
      JSON.stringify(mainRoutes.children || "[]")
    );
  }
}
router.beforeEach((to, from, next) => {
  if (to.path === "/login") {
    // 登录页 不需要判断
    next();
  } else {
    let user = window.sessionStorage.getItem("user");
    if (user) {
      next();
    } else {
      next("/login");
      Vue.prototype.$message.error("请您先登录!");
    }
  }
});
// 暴露
export default router;
