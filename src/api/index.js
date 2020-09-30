//引入axios网络请求库
import http from "@/http/http";
import { encryptDesCbc } from "@/utils/cryptoJs.js";
import { batchDelete } from "@/utils/common";

let sqlConn, userDes, userId;

/***
 *
 *   封装获取左侧导航菜单栏
 *
 */

function menus(obj) {
  sqlConn = Number(sessionStorage.getItem("sqlConn"));
  let arr = [];
  let object = {
    ParameterDes: encryptDesCbc(JSON.stringify(arr), String(obj.userDes))
  };
  return http({
    url: "/UrlMenu",
    method: "POST",
    loading: "true",
    data: JSON.stringify(object)
  });
}
/**
 *
 * 用户组权限表菜单
 */
function getItemMenus(data) {
  let object = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };

  return http({
    url: "/UrlMenu",
    method: "POST",
    loading: "true",
    data: JSON.stringify(object)
  });
}

/**
 * 表头数据
 * @param {*} param
 */
function ItemTableHeadData(data) {
  // console.log(data[0].fTableView);
  let obj = {
    ParameterDes: encryptDesCbc(data[0].fTableView, String(data[1].userDes))
  };

  return http({
    url: "/GetInterfaceEntity",
    method: "POST",
    loading: "true",
    data: JSON.stringify(obj)
  });
}
/**
 * 批量删除
 * @param {*} param
 */
function BathcDeleteData(data) {
  console.log(JSON.stringify(data[0]), "请求批量删除");
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };
  return http({
    url: "/DeleteData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 * 获取表格表头
 * @param {} str 获取相应内容的接口名称
 */
function getTableHeadData(str) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  userId = JSON.parse(sessionStorage.getItem("user")).userId;
  let fTableView = '["' + str + '"]';
  // console.log(fTableView)
  let obj = {
    ParameterDes: encryptDesCbc(fTableView, String(userDes))
  };

  return http({
    url: "/GetInterfaceEntity",
    method: "POST",
    loading: "true",
    data: JSON.stringify(obj)
  });
}

/**
 *
 * 用户组权限表表格数据
 */
function GroupLimitData(data) {
  let object = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };

  return http({
    url: "/GetModLimitData",
    method: "POST",
    data: JSON.stringify(object)
  });
}
//获取用户权限权限表数据
function GetUserLimitData(data) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(data), String(userDes))
  };
  return http({
    url: "/GetUserLimitData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/*
 *
 *   封装查询表格内容数据
 *
 */
function tableBodyData(data) {
  console.log(data[0], "tableBodyData");
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };
  return http({
    url: "/QureyData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 *
 * 获取表格内容
 * str 获取相应内容的接口fTableViewData
 * condition 查询条件，可以为空
 */
function getTableBodyData(str, condition = []) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  let obj1 = {
    Columns: "",
    OrderBy: "",
    SqlConn: sqlConn,
    TableView: str,
    Where: condition
  };
  console.log(JSON.stringify(obj1), "获取表格内容");
  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(obj1), String(userDes))
  };
  //  console.log(JSON.stringify(obj),"加密查询")
  return http({
    url: "/QureyData",
    method: "POST",
    loading:true,
    data: JSON.stringify(obj)
  });
}
/**
 *
 * 获取表格内容
 * str 获取相应内容的接口fTableViewData
 * condition 查询条件，可以为空
 * getHomeTableBody 获取首页的数据并排序
 */
function getHomeTableBody(str, condition = []) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  let obj1 = {
    Columns: "",
    OrderBy: "order by fCreateDate desc",
    SqlConn: sqlConn,
    TableView: str,
    Where: condition
  };
  console.log(JSON.stringify(obj1), "获取表格内容");
  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(obj1), String(userDes))
  };
  //  console.log(JSON.stringify(obj),"加密查询")
  return http({
    url: "/QureyData",
    method: "POST",
    loading:true,
    data: JSON.stringify(obj)
  });
}
//EXCEL导出
function exportData(str, condition = [], InterfaceName) {
  // console.log(InterfaceName, "InterfaceName");
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;

  let obj1 = {
    Columns: "",
    OrderBy: "",
    SqlConn: sqlConn,
    TableView: str,
    Where: condition,
    InterfaceName: InterfaceName
  };
  // console.log(JSON.stringify(obj1), "获取表格内容");
  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(obj1), String(userDes))
  };
  // console.log(JSON.stringify(obj), "加密获取表格内容");
  return http({
    url: "/exportData",
    method: "POST",
    responseType: "blob",
    data: JSON.stringify(obj)
  });
}

/**
 * 入库单根据选择条件打印的接口
 * str 获取相应内容的接口fTableViewData
 * condition 查询条件，可以为空
 *
 */
function queryViewData(str, condition = []) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  let obj1 = {
    Columns: "",
    OrderBy: "",
    SqlConn: sqlConn,
    TableView: str,
    Where: condition
  };
  // console.log(obj1);
  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(obj1), String(userDes))
  };
  return http({
    url: "/queryViewData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

/**
 *
 *  获取入库单号
 *
 */
function getOrderNo(str) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  let fTableView = '["' + str + '"]';
  console.log(fTableView, "自动生成单号");
  let object = {
    ParameterDes: encryptDesCbc(fTableView, String(userDes))
  };

  return http({
    url: "/getOrderNo",
    method: "POST",
    data: JSON.stringify(object)
  });
}
/**
 *
 *   封装新增/删除/修改保存数据
 *
 */
function addformSaveData(data) {
  console.log(data);
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };

  return http({
    url: "/SaveData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

/**
 *
 *   封装配件入库 审核接口
 *
 */
function savePartsInboundData(data) {
  // console.log(data[0], "请求的数据");
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };
  return http({
    url: "/savePartsInboundData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 *
 *   封装配件出库 审核接口
 *
 */
function savePartsOutboundData(data) {
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };
  return http({
    url: "/savePartsOutboundData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 * 新增/删除/修改保存数据
 * @param {*} data 
 * 如data: [
          {
            type: "insert",type 字符串 有三个值 insert（新建） update（修改） delete（删除）
            TableName: "t_UserLimit_Company",//表接口
            bodyData: this.selSceondData,//表格的内容
            headData: this.itemSceondTableHead,//表格的头部
            IdentityColumn: "fLimitID"//自增长字段
          }]
 * 
 * 
 * 
 */
function collectionData(data) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  let saveObj = [];
  let globalColumns;
  data.forEach(element => {
    // console.log(element.updateData)
    let obj = {};
    let update = null,
      deleted = null,
      insert = null;
    if (element.insertData && element.insertData.length > 0) {
      insert = batchDelete(element.headData, element.insertData);
      globalColumns = insert.columns;
    }
    if (element.updateData && element.updateData.length > 0) {
      update = batchDelete(element.headData, element.updateData);
      globalColumns = update.columns;
    }
    if (element.deleteData && element.deleteData.length > 0) {
      deleted = batchDelete(element.headData, element.deleteData);
      globalColumns = deleted.columns;
    }
    // console.log(insert,update,deleted)
    obj = {
      TableName: element.TableName,
      IdentityColumn: element.IdentityColumn ? element.IdentityColumn : null,
      InsertRow: insert ? insert.arr : null,
      UpdateRow: update ? update.arr : null,
      DeleteRow: deleted ? deleted.arr : null,
      Columns: globalColumns
    };
    saveObj.push(obj);
  });
  let savaData = {
    lstSaveData: saveObj
  };
  console.log(savaData);

  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(savaData), String(userDes))
  };
  console.log(JSON.stringify(savaData));
  return http({
    url: "/SaveData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

/**
 * 库位管理 保存数据
 * @param {*} data
 *
 *
 */

function storageCollectionData(data) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  userId = JSON.parse(sessionStorage.getItem("user")).userId;
  let saveObj = [];
  let globalColumns;
  data.forEach(element => {
    let obj = {};
    let update = null,
      deleted = null,
      insert = null;
    if (element.insertData && element.insertData.length > 0) {
      insert = batchDelete(element.headData, element.insertData);
      globalColumns = insert.columns;
    }
    if (element.updateData && element.updateData.length > 0) {
      update = batchDelete(element.headData, element.updateData);
      globalColumns = update.columns;
    }
    if (element.deleteData && element.deleteData.length > 0) {
      deleted = batchDelete(element.headData, element.deleteData);
      globalColumns = deleted.columns;
    }
    obj = {
      TableName: element.TableName,
      IdentityColumn: element.IdentityColumn ? element.IdentityColumn : null,
      InsertRow: insert ? insert.arr : null,
      UpdateRow: update ? update.arr : null,
      DeleteRow: deleted ? deleted.arr : null,
      Columns: globalColumns
    };
    saveObj.push(obj);
  });
  let savaData = {
    lstSaveData: saveObj
  };
  console.log(savaData);
  console.log(JSON.stringify(savaData));
  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(savaData), String(userDes))
  };
  return http({
    url: "/saveStorageData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

/**
 *
 * @param {*} data
 * 生成容器号保存
 *
 */
function saveContainerCode(data) {
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };
  return http({
    url: "/saveContainerCodeData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

/**
 *
 * @param {*} data
 * 库存表管理 设置在库数量保存
 *
 */
function saveStockAdjust(data) {
  console.log(data[0]);
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };
  return http({
    url: "/saveStockAdjustData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

/**
 *
 * @param {*} data
 * 收货预检保存
 */
function saveRGPreExamData(data) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;

  let saveObj = [];
  let globalColumns;
  data.forEach(element => {
    // console.log(element.updateData)
    let obj = {};
    let update = null,
      deleted = null,
      insert = null;
    if (element.insertData && element.insertData.length > 0) {
      insert = batchDelete(element.headData, element.insertData);
      globalColumns = insert.columns;
    }
    if (element.updateData && element.updateData.length > 0) {
      update = batchDelete(element.headData, element.updateData);
      globalColumns = update.columns;
    }
    if (element.deleteData && element.deleteData.length > 0) {
      deleted = batchDelete(element.headData, element.deleteData);
      globalColumns = deleted.columns;
    }
    // console.log(insert,update,deleted)
    obj = {
      TableName: element.TableName,
      IdentityColumn: element.IdentityColumn ? element.IdentityColumn : null,
      InsertRow: insert ? insert.arr : null,
      UpdateRow: update ? update.arr : null,
      DeleteRow: deleted ? deleted.arr : null,
      Columns: globalColumns
    };
    saveObj.push(obj);
  });
  let savaData = {
    lstSaveData: saveObj
  };
  console.log(savaData);

  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(savaData), String(userDes))
  };
  // console.log(JSON.stringify(savaData));
  return http({
    url: "/saveRGPreExamData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 *
 * @param {*} data
 * 收货预约保存
 */
function saveRGBookRegData(data) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  let saveObj = [];
  let globalColumns;
  data.forEach(element => {
    // console.log(element.updateData)
    let obj = {};
    let update = null,
      deleted = null,
      insert = null;
    if (element.insertData && element.insertData.length > 0) {
      insert = batchDelete(element.headData, element.insertData);
      globalColumns = insert.columns;
    }
    if (element.updateData && element.updateData.length > 0) {
      update = batchDelete(element.headData, element.updateData);
      globalColumns = update.columns;
    }
    if (element.deleteData && element.deleteData.length > 0) {
      deleted = batchDelete(element.headData, element.deleteData);
      globalColumns = deleted.columns;
    }
    // console.log(insert,update,deleted)
    obj = {
      TableName: element.TableName,
      IdentityColumn: element.IdentityColumn ? element.IdentityColumn : null,
      InsertRow: insert ? insert.arr : null,
      UpdateRow: update ? update.arr : null,
      DeleteRow: deleted ? deleted.arr : null,
      Columns: globalColumns
    };
    saveObj.push(obj);
  });
  let savaData = {
    lstSaveData: saveObj
  };
  console.log(savaData);

  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(savaData), String(userDes))
  };
  // console.log(JSON.stringify(savaData));
  return http({
    url: "/saveRGBookRegData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 *
 * @param {*} data
 * 生成拣货单
 *
 */
function DistributeJob(data) {
  console.log(data[0], 33);
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };
  console.log(JSON.stringify(obj));
  return http({
    url: "/DistributeJob",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 *
 * @param {*} data
 * 生成补货单
 *
 */
function savePickingList(data) {
  console.log(data[0]);
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };

  return http({
    url: "/savePickingList",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 *
 * @param {*} data
 * 删除库位接口
 *
 */
function deleteStorageItem(data) {
  console.log(JSON.stringify(data[0]));
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };

  return http({
    url: "/deleteStorageItem",
    method: "POST",
    data: JSON.stringify(obj)
  });
}
/**
 * 修改页面中获取从表数据
 *
 *
 */
function getInterfaceItemData(data) {
  console.log(JSON.stringify(data[0]));
  let obj = {
    ParameterDes: encryptDesCbc(
      JSON.stringify(data[0]),
      String(data[1].userDes)
    )
  };

  return http({
    url: "/qureyInterfaceItemData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

/**
 *
 * 导入excel
 */

function imPortExcel(data) {
  console.log(data);
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;
  userId = JSON.parse(sessionStorage.getItem("user")).userId;
  let formData = new FormData();
  formData.append("UserID", userId);
  formData.append("SqlConn", sqlConn);
  formData.append("IndexSheet", 0);
  formData.append("ImportType", data.strType);
  formData.append("file", data.file);
  console.log(data.file);
  return http({
    url: "/InportExcel",
    method: "POST",
    data: formData
  });
}
/**
 *
 * 登录页面下拉选择框仓库
 */
function companyList() {
  return http({
    url: "/GetCompanyData",
    method: "POST"
  });
}

// 获取用户权限
function getUserLimitMenu(data, fSqlconn) {
  userDes = JSON.parse(sessionStorage.getItem("user")).userDes;

  let obj = {
    ParameterDes: encryptDesCbc(JSON.stringify(data), String(userDes))
  };
  return http({
    url: "/getModUserLimitData",
    method: "POST",
    data: JSON.stringify(obj)
  });
}

export {
  menus,
  tableBodyData,
  addformSaveData,
  ItemTableHeadData,
  companyList,
  getInterfaceItemData,
  getItemMenus,
  GroupLimitData,
  getTableBodyData,
  getHomeTableBody,
  getTableHeadData,
  collectionData,
  getUserLimitMenu,
  GetUserLimitData,
  BathcDeleteData,
  storageCollectionData,
  getOrderNo,
  saveContainerCode,
  queryViewData,
  saveStockAdjust,
  imPortExcel,
  savePartsInboundData,
  savePartsOutboundData,
  exportData,
  saveRGBookRegData,
  saveRGPreExamData,
  DistributeJob,
  savePickingList,
  deleteStorageItem
};
