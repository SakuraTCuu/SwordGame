import { Constant } from "../Common/Constant";
import { em } from "../Common/EventManager";
import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";


@Singleton
export default class RewardService implements IService {

    public static readonly instance: RewardService

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

    public async initialize(): Promise<void> {

    }
    public async lazyInitialize(): Promise<void> {
        this.initRewardList();
    }

    // 初始化 游戏奖励列表 读取记录列表，并用最新的列表去覆盖。
    initRewardList() {
        let data = app.storage.getTempData("gameRewardList");
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

        app.storage.savingToTempData("gameRewardList", this._rewardList);
    }
    // 版本更新补偿奖励发放
    versionUpdateReward() {
        // return;
        //版本1.0.3.2的更新补偿奖励
        if (!this._rewardList.versionReward1_0_3_2) {
            this._rewardList.versionReward1_0_3_2 = true;
            app.bag.addItemToBag("破旧装备箱", 5);

            em.dispatch("showGets", {
                "破旧装备箱": 5,
            });
        }
    }

    // 今日签到
    signInToday() {
        if (this._rewardList.today == this._rewardList.lastTodaySignIn) {
            em.dispatch("tipsViewShow", "今日已签到");
            this._rewardList.lastTodaySignIn = this._rewardList.today;
            return;
        }
        this._rewardList.lastTodaySignIn = this._rewardList.today;
        app.bag.addItemToBag("破旧装备箱", 1);
        app.bag.addItemToBag("神秘钥匙", 1);

        em.dispatch("showGets", { "破旧装备箱": 1, "神秘钥匙": 1 });
        app.storage.savingToTempData("gameRewardList", this._rewardList);
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
            app.storage.savingToTempData("gameRewardList", this._rewardList);
            return true;
        } else {
            this._rewardList.sevenDaySignIn.continueDays = 1;
            this._rewardList.sevenDaySignIn.lastSignIn = today;
            app.storage.savingToTempData("gameRewardList", this._rewardList);
            return true;
        }
    }

    //今日装备奖励视频是否可以展示
    todayEquVideoIsCanShow() {
        return this._rewardList.todayEquVideoShowTimes >= Constant.GlobalGameData.MaxTodayEquVideoShowTimes;
    }

    // 播放装备奖励视频
    afterPlayEquVideo() {
        this._rewardList.todayEquVideoShowTimes++;
        app.storage.savingToTempData("gameRewardList", this._rewardList);
    }
}


