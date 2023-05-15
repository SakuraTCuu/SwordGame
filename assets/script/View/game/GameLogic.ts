import { Constant } from "../../Common/Constant";
import Singleton from "../../Decorators/Singleton";

@Singleton
export default class GameLogic {

    public static readonly instance: GameLogic;

    private _isKillBoss: boolean = false;
    private _killLeaderTotal: number = 0;//击杀精英怪总数
    private _killCount: number = 0;//用于记录当前关卡击杀

    private _runTime: number = 0;

    //暂停
    private _pause: boolean = false;
    private _end: boolean = false;

    //stageConfig
    //关卡精英怪和boss配置
    //关卡奖励配置
    //stageArmyConfig

    /**
     * 游戏数据中心
     * 供外部调用
     */

    /**
     * 开始游戏
     */
    startGame(levelId: number) {
        // 获取boss数据
        //开启计时
        this._runTime = 0;
        //准备数据
        let stageId = "stage" + levelId;

        let stageConfig = app.staticData.getStageDataById(stageId);
        let bossConfig = app.staticData.getLeaderAndBossDataById(String(levelId - 1));
        let armyConfig = app.staticData.getArmyDataById(stageId);
        let rewardConfig = app.staticData.getRewardDataById();
    }

    onGamePause() {

    }

    onGameResume() {

    }

    /**
     * 游戏退出
     */
    onGameExit() {

    }

    /**
     *  游戏开始
     */
    onGameEnter() {

    }


    /**
     * 击杀敌人
     */
    onKill() {

    }

    // 获取击杀信息描述
    geCurStageKillInfo() {
        let string: string = "";
        if (this._isKillBoss) {
            string = "boss击杀：1\n";
        }
        else {
            string = "boss击杀：0\n";
            string += "击杀精英怪总数：" + this._killLeaderTotal + "\n";
            string += "击杀怪物总数：" + this._killCount + "\n";
        }
        return string;
    }

}