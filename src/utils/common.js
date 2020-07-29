// import { chunk } from "./index.js";
import { checkDecimal } from "@/utils/validate";
/**
 *  动态表单验证规则
 *
 */
export function creatRules(data) {
  //  console.log(data)
  let rules = {};
  data.forEach((item, index) => {
    let rulesArr = [];
    if (item.fNotNull === 1) {
      switch (item.fDataType) {
        case "string":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            },
            { type: "string", message: "请输入字符串", trigger: "blur" },
            {
              max: item.fLength,
              message: "长度不能大于" + item.fLength,
              trigger: "blur"
            }
          ];
          rules[item.fColumn] = rulesArr;
          break;
        case "bit":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            }
          ];
          rules[item.fColumn] = rulesArr;
          // case "datetime":
          //   rulesArr = [
          //     {
          //       required: true,
          //       message: item.fColumnDes + "不能为空",
          //       trigger: "blur"
          //     },
          //     {  message: "请输入时间" }
          //   ];
          //   rules[item.fColumn] = rulesArr;
          break;
        case "int":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            },
            { type: "number", message: "请输入数字" }
          ];
          rules[item.fColumn] = rulesArr;
          break;
        case "decimal":
          rulesArr = [
            {
              required: true,
              message: item.fColumnDes + "不能为空",
              trigger: "blur"
            },
            { validator: checkDecimal, message: "请输入数字" }
          ];
          rules[item.fColumn] = rulesArr;
          break;
      }
    } else if (item.fNotNull == 0) {
      switch (item.fDataType) {
        case "string":
          rulesArr = [
            { type: "string", message: "请输入字符串", trigger: "blur" },
            {
              max: item.fLength,
              message: "长度不能大于" + item.fLength,
              trigger: "blur"
            }
          ];
          break;
          // case "int":
          //   rulesArr = [
          //     { type: "number", message: "请输入数字", trigger: "blur" }
          //   ];
          //   rules[item.fColumn] = rulesArr;
          break;
        case "decimal":
          rulesArr = [{ validator: checkDecimal, message: "请输入数字" }];
          rules[item.fColumn] = rulesArr;
          break;
      }
    }
  });
  return rules;
}

/**
 *
 *   设置表单默认值
 *
 */
export function defaultForm(tableHead) {
  var obj = {};
  let userInfo = JSON.parse(sessionStorage.getItem("user"));
  tableHead.forEach(element => {
    if (element.fDataType == "datetime") {
      if (element.fColumn == "fCreateDate"||element.fColumn == "fLogintime") {
        obj[element.fColumn] = new Date();
      } else {
        obj[element.fColumn] = null;
      }
    } else if (
      //库位管理中要控制的字段
      (element.fDataType == "bit" && element.fColumn == "fIsPutOnArea") ||
      element.fColumn == "fIsAllocationArea" ||
      element.fColumn == "fIsWorkingArea"
    ) {
      obj[element.fColumn] = false;
    } else if (element.fDataType == "bit") {
      obj[element.fColumn] = true;
    } else if (element.fColumn == "fCountry") {
      obj[element.fColumn] = "中国";
    } else if (element.fColumn == "fCreaterCode") {
      obj[element.fColumn] = userInfo.usercode;
    } else if (element.fNeedSave == 1 && element.fColumn == "fCreater") {
      obj[element.fColumn] = userInfo.userId;
    } else if (element.fNeedSave == 1 && element.fColumn == "fModifier") {
      obj[element.fColumn] = userInfo.userId;
    } else if (element.fNeedSave == 1 && element.fVisible == 0) {
      obj[element.fColumn] = 0;
    } else if (element.fNeedSave == 1 && element.fDataType == "string") {
      obj[element.fColumn] = "";
    } else{
      
    }
  });

  return obj;
}

/**
 *  增删改查传递的参数
 *
 */

export function addParams(tableHead, rowData) {
  let arr = [];
  let columns = tableHead.map((item, index) => {
    return {
      ColumnName: item.fColumn,
      ColumnType: item.fDataType
    };
  });
  columns.forEach(element => {
    for (const key in rowData) {
      if (element.ColumnName == key) {
        let obj = {
          Key: element.ColumnName,
          Value: rowData[key]
        };
        arr.push(obj);
      }
    }
  });

  return {
    arr,
    columns
  };
}
/**
 *  增删改查批量删除的参数
 *
 */
export function batchDelete(tableHead, batchList) {
  // let tableHeadLength = tableHead.length;
  let arr = [];
  let columns = tableHead.map((item, index) => {
    return {
      ColumnName: item.fColumn,
      ColumnType: item.fDataType
    };
  });
  batchList.forEach(item => {
    let OneArr = [];
    columns.forEach(element => {
      for (const key in item) {
        let obj = {};
        if (element.ColumnName == key) {
          obj = {
            Key: element.ColumnName,
            Value: item[key]
          };
          OneArr.push(obj);
        }
      }
    });
    arr.push(OneArr);
  });
  return {
    arr,
    columns
  };
}

//判断用户是否有权限，将按钮是否禁用
export function userLimit(strVal) {
  let url = window.location.hash.substring(2);
  // console.log(url,'路径')
  let urlMenu = JSON.parse(sessionStorage.getItem("dynamicMenuRoutes"));

  let limitMeta = {};
  urlMenu.forEach(ele => {
    if (ele.path == url) {
      limitMeta = ele.meta;
    }
  });
  let userLimit = JSON.parse(sessionStorage.getItem("userLimit"));
  let disabled = true;

  if (userLimit.length > 0) {
    // disabled = userLimit.some(element => {
    //   return  element.fModID == limitMeta.menuId && element[strVal] == 0;
    // });
    userLimit.forEach(element => {
      if (element.fModID == limitMeta.menuId && element[strVal] == 1) {
        disabled = false;
      }
    });
  }
  return disabled;
  // return false
}

//根据fsort进行排序
export function compare(obj1, obj2) {
  let val1 = obj1.fSort;
  let val2 = obj2.fSort;
  if (val1 < val2) {
    return -1;
  } else if (val1 > val2) {
    return 1;
  } else {
    return 0;
  }
}
