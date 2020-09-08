//引入axios网络请求库
import http from "@/http/http";
/**
 *
 *   封装获取用户登录
 *
 */
function userLogin(obj) {
  return http({
    url: "http://8.129.208.95:8004/token/userLogin",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
export { userLogin };
