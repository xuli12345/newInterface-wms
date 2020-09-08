<template>
  <div>
    <div class="page">
      <div class="time">
        <span style="width:100px">预约日期：</span>
        <el-date-picker
          v-model="value"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd"
          :default-time="['00:00:00']"
        >
        </el-date-picker>
      </div>
      <div class="buttons">
        <el-button type="warning" round>已预约</el-button>
        <el-button type="primary" round>已预检</el-button>
        <el-button round style="background:yellow">收货中</el-button>
        <el-button type="success" round>完成</el-button>
      </div>
    </div>
    <el-table
      :header-cell-style="{ background: '#eef1f6' }"
      :data="tableData"
      class="table-wrapper"
      ref="singleTable"
      border
      style="width: 100%"
      @cell-dblclick="dblclick"
    >
      <template v-for="(item, index) in tableHeadData">
        <el-table-column
          :key="index"
          :label="item.fColumnDes"
          :prop="item.fColumn"
          min-width="160px"
        >
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js"; //解密
import { compare } from "@/utils/common";
import {
  tableBodyData,
  addformSaveData,
  getTableBodyData,
  getTableHeadData
} from "@/api/index";
export default {
  data() {
    return {
      value: new Date(),
      tableHeadData: [],
      tableData: [
        { fID: 1, fDock: "00:00~00:30", fDockName: "" },
        { fID: 2, fDock: "00:30~01:00", fDockName: "普陀区金沙江路" },
        { fID: 3, fDock: "01:00~01:30", fDockName: "普陀区金沙江路" },
        { fID: 4, fDock: "01:30~02:00", fDockName: "普陀区金沙江路" },
        { fID: 5, fDock: "02:00~02:30", fDockName: "普陀区金沙江路" },
        { fID: 6, fDock: "02:30~03:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "03:00~03:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "03:30~04:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "04:00~04:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "04:30~05:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "05:00~05:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "05:30~06:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "06:00~06:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "06:30~07:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "07:00~07:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "07:30~08:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "08:00~08:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "08:30~09:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "09:00~09:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "09:30~10:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "10:00~10:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "10:30~11:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "11:00~11:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "11:30~12:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "12:00~12:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "12:30~13:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "13:00~13:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "13:30~14:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "14:00~14:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "14:30~15:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "15:00~15:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "15:30~16:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "16:00~16:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "16:30~17:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "17:00~17:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "17:30~18:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "18:00~18:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "18:30~19:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "19:00~19:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "19:30~20:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "20:00~20:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "20:30~21:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "21:00~21:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "21:30~22:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "22:00~22:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "22:30~23:00", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "23:00~23:30", fDockName: "普陀区金沙江路" },
        { fID: 1, fDock: "23:30~24:00", fDockName: "普陀区金沙江路" }
      ],
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    //获取表格头部数据
    async getTabelHeda() {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fDockTypeName",
          Value: "收货"
        },
        {
          Computer: "=",
          DataFile: "fState",
          Value: 1
        }
      ];
      let res = await getTableBodyData("v_Dock", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let data = JSON.parse(res.Data);
        this.tableHeadData = data.map(item => {
          return {
            fID: item.fID,
            fColumnDes: item.fDockName,
            fColumn: "fDockName"
          };
        });

        let obj = {
          fID: 0,
          fColumnDes: "时间\码头",
          fColumn: "fDock"
        };
        this.tableHeadData.unshift(obj);
        console.log(this.tableHeadData);
      }
    },
    //双击表格弹框
    dblclick(row) {
      console.log(row, "row");
      //   if (this.userLimit("fEdit") == false) {
      //     this.$emit("openEditDrawer", row, this.tableHeadData);
      //   }
    }
  },
  created() {
    this.getTabelHeda();
  }
};
</script>
<style lang="scss" scoped>
.page {
  display: flex;
  .buttons {
    margin-left: 15px;
  }
}
.time {
  width: 280px;
  display: flex;
  flex-wrap: nowrap;
}
</style>
