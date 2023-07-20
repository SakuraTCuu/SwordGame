import { Prefab, instantiate } from "cc";
import { Constant } from "../../Common/Constant";
import IBaseGame from "../../Interfaces/IBaseGame";
import Queue from "../../Libs/Structs/Queue";
import MonsterUtil from "../../Common/MonsterUtil";
import { em } from "../../Common/EventManager";
import { BossView } from "../../Role/Enemy/BossView";

export default class GameLogic extends IBaseGame {

    private _bossPrefab: Prefab = null; //boss预制体
    private _isKillBoss: boolean = false;
    private _killLeaderTotal: number = 0;//击杀精英怪总数
    private _killCount: number = 0;//用于记录当前关卡击杀

    private _totalRunTime: number = 0;
    //1s
    private _normalSecond: number = 1000;

    //暂停
    private _pause: boolean = false;
    private _end: boolean = false;

    //当前数量
    private _curLeaderTotal: number = 0;
    private _createCount: number = 0;

    //阶段数据
    //关卡精英怪和boss配置
    //关卡奖励配置
    //stageArmyConfig
    private _stageConfig: any = {};
    private _bossConfig: any = {};
    private _armyConfig: any = {};
    private _rewardConfig: any = {};

    //当前关卡id
    private _curLevelId: number = 0;

    //当前阶段数据
    private _curStageData: any = {};
    //最大时长
    private _curStageMaxTime: number = 0;
    //当前时长 毫秒
    private _curStageTime: number = 0;
    private _curScheduleTime: number = 0;
    //队列
    private _stageQueue: Queue<any> = null;

    private _isRunning: boolean = false;
    private _isQueenTask: boolean = false;
    private _isJustBoss: boolean = false;

    constructor(bossPrefab: Prefab) {
        super();
        this._bossPrefab = bossPrefab;
    }

    /**
     *  游戏进入
     */
    onGameEnter(levelId: number) {
        this._curLevelId = levelId;
        this.initGameData();
    }

    /**
    *  游戏开始
    */
    onGameStart() {
        this._isRunning = true;
        this._isQueenTask = true;
        this.startStage(true);

        if (this._isJustBoss) {
            this.justCreateBoss();
        }
    }

    onGamePause() {

    }

    onGameResume() {

    }

    /**
     * 游戏退出
     */
    onGameExit() {
        //清理数据
    }


    onTick(dt: number) {
        if (!this._isRunning) {
            return;
        }

        if (this._isJustBoss) {
            return;
        }

        this._totalRunTime += dt;
        this._curStageTime += dt;
        this._curScheduleTime += dt;

        if (this._isQueenTask) {
            if (!this._curStageData) {
                return
            }

            //阶段调度
            if (this._curStageTime >= this._curStageData.time) {
                //进入下一阶段
                this.startStage();
                this._curStageTime = 0;
            } else {
                //生成小怪
                this.createMonster();
            }
        }

        //计时器调度
        if (this._curScheduleTime >= this._normalSecond) {
            this.startManyMonsterTimer();
            this._curScheduleTime = 0;
        }

    }

    /**
     * 开始游戏
     */
    initGameData() {
        // 获取boss数据
        //开启计时
        this._totalRunTime = 0;
        //准备数据
        let stageId = "stage" + this._curLevelId;

        let stageData = app.staticData.getStageDataById(stageId);
        this._bossConfig = app.staticData.getLeaderAndBossDataById(String(this._curLevelId - 1));
        this._armyConfig = app.staticData.getArmyDataById(stageId);
        this._rewardConfig = app.staticData.getRewardDataById();

        this._stageQueue = new Queue();
        this._curStageMaxTime = stageData[stageData.length - 1].time;
        for (let i = 0; i < stageData.length; i++) {
            let data = stageData[i];
            this._stageQueue.enqueue(data);
        };
    }

    //boss模式 用于
    justCreateBoss() {
        this.createBoss();
    }

    // 快速创建
    createFast() {
        this.createMonsterByCurData();
        this.createMonsterByCurData();
        this.createMonsterByCurData();
        this.createMonsterByCurData();
        this.createMonsterByCurData();
    }

    startStage(isFirst = false) {
        if (Constant.GlobalGameData.stopAll) {
            return;
        }

        this._curStageData = this._stageQueue.dequeue();

        if (this._curStageData == null) {
            if (isFirst) {
                return console.log("_curStageData is null");
            }
            this._isQueenTask = false;
            return this.showBossOrPass();
        }

        console.log("当前阶段: ", this._curStageData);

        this._killCount = 0;
        this._curStageTime = 0;
        this._curScheduleTime = 0;

    }

    //敌群计时器
    startManyMonsterTimer() {
        if (!this._curStageData) {
            return console.log("暂停开启敌群");
        }
        let maxCount = this._curStageData.max > MonsterUtil.monsterMaxTotal
            ? MonsterUtil.monsterMaxTotal
            : this._curStageData.max;

        let curTotal = em.dispatch("getMonsterTotal");

        if (curTotal >= maxCount) {
            return;
        }

        if (this._armyConfig) {
            let index = this._armyConfig.time.indexOf(this._curStageTime);
            if (index > -1) {
                // if (config.queue[index] >= 11001) em.dispatch("playAnimMassMonsterComing");
                let key = MonsterUtil.queueMappingList[this._armyConfig.queue[index]];
                let queue = MonsterUtil.queue[key];
                // console.log("key",key);
                // console.log("queue",queue);
                if (!queue) {
                    throw "queue is error";
                }
                let monsterID = this._curStageData.id[Math.random() * this._curStageData.id.length | 0];
                em.dispatch("createMonsterByOutsideData", monsterID, queue, { x: 0, y: 0 });
            }
        }
    }

    createMonster() {
        // console.log("运行当前环境");
        let max = this._curStageData.max > MonsterUtil.monsterMaxTotal
            ? MonsterUtil.monsterMaxTotal
            : this._curStageData.max;
        // let max = this._curStageData.max > 300 ? 300 : this._curStageData.max;
        let curTotal = em.dispatch("getMonsterTotal");

        if (curTotal < max) {//小于当前最大数生成
            // if (curTotal < 500) {//小于当前最大数生成
            // if (curTotal < 800) {//小于当前最大数生成

            this._createCount++;
            if (this._createCount > this._bossConfig.startCount
                && this._createCount % this._bossConfig.mod == 0
                && this._curLeaderTotal < this._bossConfig.maxTotal) {

                let monsterID = this._curStageData.id[Math.random() * this._curStageData.id.length | 0];
                let type = this._bossConfig.type[Math.random() * this._bossConfig.type.length | 0];
                this.dispatch(Constant.EventId.createMonsterLeader, monsterID, type);
                // em.dispatch("createMonsterLeader", monsterID, type);
                this._curLeaderTotal++;
            } else {
                this.createMonsterByCurData();
                // this.createFast();
                // this.createFast();
                // this.createFast();
                // this.createFast();
                // this.createFast();
                // this.createFast();
                // // 创建精英怪
                // let monsterID = this._curStageData.id[Math.random() * this._curStageData.id.length | 0];
                // let type = this._bossConfig.type[Math.random() * this._bossConfig.type.length | 0];
                // em.dispatch("createMonsterLeader", monsterID, type);
                //如果当前怪物总数小于最大值创建数数的1/3 则继续创建
                // curTotal = em.dispatch("getMonsterTotal");
                // if (curTotal < max / 3) this.createFast();
            }
        }
    }

    //通过当前数据创建怪物
    createMonsterByCurData() {
        let index = this.getIndexByRatio(this._curStageData.ratio);
        let key = MonsterUtil.queueMappingList[this._curStageData.queue[index]];
        if (key == "circleR1000T20") return;
        if (key == "heartR500T40") return;
        let queue = MonsterUtil.queue[key];
        let dir = MonsterUtil.queueDir[key];
        if (!queue) throw new Error("找不到映射队列:" + key);
        if (!dir && dir !== null) throw new Error("找不到映射方向:" + key);//可以改成 指定方向 后期调整
        let monsterID = this._curStageData.id[Math.random() * this._curStageData.id.length | 0];
        em.dispatch("createMonsterByOutsideData", monsterID, queue, dir);
    }

    //通过比率获取下标
    getIndexByRatio(ratioArr: []) {
        let ratio = Math.random();
        for (let i = 0; i < ratioArr.length; i++) {
            let value = ratioArr[i];
            if (value >= ratio) return i;
            else continue;
        };
        throw new Error("value均小于1，ratioArr 配置错误");
    }

    /**
     * 展示boss或者通关
     */
    showBossOrPass() {
        if (this._bossConfig && this._bossConfig.bossId < 0) {
            this.passStage();
        } else {
            console.log("停止创建小怪 开始创建boss");
            // this.stopCreateMonster();
            this.createBoss();
        }
    }

    // 创建boss
    createBoss() {
        // em.dispatch("createMonsterBoss", this._bossConfig.bossId);

        console.log("createBoss: bossId: ", this._bossConfig.bossId);
        let boss = instantiate(this._bossPrefab);
        let bossController = boss.getComponent(BossView);
        bossController.initBoss(this._bossConfig.bossId);

        // boss.parent = find("Canvas/bossLayer");

        let wp = em.dispatch("getHeroWorldPos");
        boss.setWorldPosition(wp.x, wp.y + 1000, wp.z);
    }

    //停止创建
    stopCreateMonster() {

    }

    removeBoss() {
        // let boss = find("Canvas/bossLayer").children[0];
        // if (boss) {
        //     boss.removeFromParent();
        //     boss.destroy();
        // };
    }

    //通关
    passStage() {
        // this.stopCreateMonster();
        this.dispatch(Constant.EventId.passStage, "通 关 奖 励", true);
    }

    //获取当前游戏进度
    getCurStageProgress() {
        let progress = this._curStageTime / this._curStageMaxTime;
        if (progress > 1) progress = 1;
        return progress;
    }

    //获取当前关卡时间 
    getCurStageTime() {
        return this._curStageTime;
    }

    getTotalRunTime() {
        return this._totalRunTime;
    }

    //刷新精英怪当前总数 如果 num为负数 说明精英怪被击杀 根据精英怪被击杀数量 刷新精英怪出现的最大数量
    updateLeaderCurTotal(num: number) {
        this._curLeaderTotal += num;
        if (num < 0) {
            this._killLeaderTotal += Math.abs(num);
        }
    }

    getKillCount() {
        return this._killCount;
    }

    getKillLeaderCount() {
        return this._killLeaderTotal;
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