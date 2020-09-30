import moment from "moment";


export function timeCycle(val) {
  // console.log(val)
  return  moment(new Date(val)).format("YYYY-MM-DD HH:mm:ss");
}

export function updateTime(val) {
  return  moment(val).format("YYYY-MM-DD");
}
