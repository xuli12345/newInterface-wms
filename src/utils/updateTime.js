import moment from "moment";


export function timeCycle(val) {
  return  moment(val).format("YYYY-MM-DD HH:mm:ss");
}

export function updateTime(val) {
  return  moment(val).format("YYYY-MM-DD");
}
