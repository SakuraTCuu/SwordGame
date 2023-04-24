import { _decorator, Component, Node } from 'cc';
import { em } from '../global/EventManager';
const { ccclass, property } = _decorator;


// 各种奖励的处理逻辑 每日签到 七日签到 每日视频
@ccclass('GameReward')
export class GameReward extends Component {

    _rewardList = {
        today: 99,
        lastTodaySignIn: 999,
        sevenDaySignIn: {
            lastSignIn: 99,
            continueDays: 0,
        },
        todayEquVideoShowTimes: 0,
        versionReward1_0_3_2: false,
    }

    _maxTodayEquVideoShowTimes = 2;//每日最大播放次数
    onLoad() {
        em.add("usingGameRewardFun", this.usingGameRewardFun.bind(this));
    }
    onDestroy() {
        em.remove("usingGameRewardFun");
    }
    start() {
        this.initRewardList();
    }
    // 初始化 游戏奖励列表 读取记录列表，并用最新的列表去覆盖。
    initRewardList() {
        let data = em.dispatch("getTempData", "gameRewardList");
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key) && this._rewardList.hasOwnProperty(key)) {
                    this._rewardList[key] = data[key];
                }
            }
        }
        //判定是否要重置今日日期 重置后可再次签到
        let today = new Date().getDay();
        if (this._rewardList.today !== today || this._rewardList.today == 99) {
            this._rewardList.today = today;
            this._rewardList.todayEquVideoShowTimes = 0;
        }

        this.versionUpdateReward();

        em.dispatch("savingToTempData", "gameRewardList", this._rewardList);
    }
    // 版本更新补偿奖励发放
    versionUpdateReward() {
        // return;
        //版本1.0.3.2的更新补偿奖励
        if (!this._rewardList.versionReward1_0_3_2) {
            this._rewardList.versionReward1_0_3_2 = true;
            em.dispatch("addItemToSS", "破旧装备箱", 5);
            em.dispatch("showGets", {
                "破旧装备箱": 5,
            });
        }
    }
    //使用GameReward 方法
    usingGameRewardFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    // 今日签到
    signInToday() {
        if (this._rewardList.today == this._rewardList.lastTodaySignIn) {
            em.dispatch("tipsViewShow", "今日已签到");
            this._rewardList.lastTodaySignIn = this._rewardList.today;
            return;
        }
        this._rewardList.lastTodaySignIn = this._rewardList.today;
        em.dispatch("addItemToSS", "破旧装备箱", 1);
        em.dispatch("addItemToSS", "神秘钥匙", 1);
        em.dispatch("showGets", { "破旧装备箱": 1, "神秘钥匙": 1 });
        em.dispatch("savingToTempData", "gameRewardList", this._rewardList);
    }
    /**
     * @description 获取连续签到天数
     * @returns {number} 连续签到天数
    */
    getContinueDays() {
        let today = new Date().getDay();
        let gap = today - this._rewardList.sevenDaySignIn.lastSignIn;
        //中间只差一天 或者是当天
        if (gap == 1 || gap == -6 || gap == 0) return this._rewardList.sevenDaySignIn.continueDays;
        else return 0;
    }
    /**
     * @description 七日签到
     * @returns {boolean} 签到是否成功
     * */
    signInSevenDay() {
        let today = new Date().getDay();
        if (this._rewardList.sevenDaySignIn.lastSignIn == today) return false;
        let gap = today - this._rewardList.sevenDaySignIn.lastSignIn;
        if (gap == 1 || gap == -6) {
            this._rewardList.sevenDaySignIn.lastSignIn = today;
            this._rewardList.sevenDaySignIn.continueDays++;
            if (this._rewardList.sevenDaySignIn.continueDays > 7) this._rewardList.sevenDaySignIn.continueDays = 1;
            em.dispatch("savingToTempData", "gameRewardList", this._rewardList);
            return true;
        } else {
            this._rewardList.sevenDaySignIn.continueDays = 1;
            this._rewardList.sevenDaySignIn.lastSignIn = today;
            em.dispatch("savingToTempData", "gameRewardList", this._rewardList);
            return true;
        }
    }
    //今日装备奖励视频是否可以展示
    todayEquVideoIsCanShow() {
        return this._rewardList.todayEquVideoShowTimes >= this._maxTodayEquVideoShowTimes;
    }
    // 播放装备奖励视频
    afterPlayEquVideo() {
        this._rewardList.todayEquVideoShowTimes++;
        em.dispatch("savingToTempData", "gameRewardList", this._rewardList);
    }
}


