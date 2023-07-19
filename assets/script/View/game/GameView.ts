import { _decorator, Component, Game, Label, Node, Prefab } from 'cc';
import IView from '../../Interfaces/IView';
import GameLogic from './GameLogic';
import { Constant } from '../../Common/Constant';
import { em } from '../../Common/EventManager';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends IView {

    @property(Label)
    timeLabel: Label = null;

    @property(Label)
    killCountLabel: Label = null;

    @property(Prefab)
    bossPrefab: Prefab = null;

    @property(Node)
    bossLayer: Node = null;

    private gameLogic: GameLogic = null;
    private _rewardConfig: any = {};
    private _curLevelId: number = 0;

    protected async onRegister?(...r: any[]) {

        //TODO: 修改
        this.gameLogic = new GameLogic(this.bossPrefab);

        this.initData();
        this.initEvent();
        this.gameLogic.onGameEnter(Constant.GlobalGameData.curStage);
    }

    protected async onUnRegister?(...r: any[]) {

    }

    start() {
        this.gameLogic.onGameStart();
    }

    onTick(delta: number): void {
        this.gameLogic.onTick(delta);
    }

    initEvent() {
        this.subscribe(Constant.EventId.distributeReward, this.distributeReward);
        this.subscribe(Constant.EventId.passStage, this.passStage);
        this.subscribe(Constant.EventId.quitHalfway, this.quitHalfway);

        this.subscribe(Constant.EventId.updateKillCountLabel, this.updateKillCountLabel.bind(this));
        this.subscribe(Constant.EventId.updateLeaderCurTotal, this.updateLeaderCurTotal.bind(this));
        this.subscribe(Constant.EventId.closeGetDoubleRewardAd, this.startDistributeReward);


        em.add(Constant.EventId.quitHalfway, this.quitHalfway.bind(this));
        em.add(Constant.EventId.passStage, this.passStage.bind(this));
        em.add(Constant.EventId.updateKillCountLabel, this.updateKillCountLabel.bind(this));
        em.add(Constant.EventId.updateLeaderCurTotal, this.updateLeaderCurTotal.bind(this));

        // em.add(Constant.EventId.getCurStageTime, this.getCurStageTime.bind(this));
        // em.add(Constant.EventId.getDoubleReward, this.getDoubleReward.bind(this));
        // em.add(Constant.EventId.closeGetDoubleRewardAd, this.closeGetDoubleRewardAd.bind(this));

        // this.subscribe("geCurStageKillInfo", this.geCurStageKillInfo.bind(this));
    }

    initData() {
        this._rewardConfig = app.staticData.getRewardDataById();
    }

    //通关
    passStage(title: string, isPass: boolean) {
        this.distributeReward(title, isPass);
    }

    //关闭关卡 游戏中途失败
    quitHalfway() {
        console.log("关闭关卡");
        // this.stopCreateMonster();
        this.gameLogic.stopCreateMonster();
        this.distributeReward("击 杀 奖 励");
    }

    distributeReward(rewardName: string, isPass: boolean = false) {
        // console.log("击杀怪物总数", this._killCount);
        // console.log("击杀精英怪总数", this._killLeaderTotal);
        // console.log("根据击杀 发放奖励");
        em.dispatch("usingHeroControlFun", "pauseGame");

        this.startDistributeReward(rewardName, isPass, false);
    }

    startDistributeReward(rewardName: string, isPass: boolean, isDouble: boolean) {
        let passReward = this.getPassRewardContent(isPass);
        if (isDouble) {
            for (const reward of passReward) {
                reward.total *= 2;
            }
            console.log("双倍奖励");
        } else {
            console.log("单倍奖励");
        }
        em.dispatch("showPassReward", passReward, rewardName, isDouble);
        // 添加奖励到背包
        passReward.forEach(data => {
            if (data.total > 0) {
                app.bag.addItemToBag(data.id, data.total);
            }
        });
        //更新关卡进度
        if (isPass && Constant.GlobalGameData.curStage + 1 > Constant.GlobalGameData.stageProgress) {
            Constant.GlobalGameData.stageProgress = Constant.GlobalGameData.curStage + 1;
            app.storage.savingGlobalDataToTempData();
        }
    }

    /**
     * @description: 获取通关奖励
     * @param {*} isPass 是否通关 未通关只能获取击杀奖励
     */
    getPassRewardContent(isPass) {
        let config = this._rewardConfig["stage" + this._curLevelId];
        let rewardArr = [];

        let killCount = this.gameLogic.getKillCount();
        let killLeaderTotal = this.gameLogic.getKillLeaderCount();

        //击杀奖励
        config.monsterReward.forEach((id, index) => {
            let ratio = config.monsterRewardRatio[index];
            let total = 0;
            for (let i = 0; i < killCount; i++) {
                let random = Math.random();
                if (random <= ratio) total++;
            };
            if (total > 0) {
                let reward = {
                    id: id,
                    total: total,
                };
                rewardArr.push(reward);
            }
        });
        let lingshi = {
            id: 3,
            total: Math.ceil(killCount * (config.lingshi.min + Math.random() * (config.lingshi.max - config.lingshi.min))),
        }
        rewardArr.push(lingshi);
        config.leaderReward.forEach((id, index) => {
            let ratio = config.leaderRewardRatio[index];
            let total = 0;
            for (let i = 0; i < killLeaderTotal; i++) {
                let random = Math.random();
                if (random <= ratio) total++;
            };
            if (total > 0) {
                let reward = {
                    id: id,
                    total: total,
                };
                rewardArr.push(reward);
            }
        });
        if (isPass) {
            config.passReward.forEach((id, index) => {
                let ratio = config.passRewardRatio[index];
                if (Math.random() < ratio) rewardArr.push({
                    id: id,
                    total: 1,
                });
            });
        }
        console.log("rewardArr", rewardArr);
        return rewardArr;
    }

    //刷新计时信息
    updateTimeLabel() {
        // console.log("this._curStageTime", this._curStageTime);
        let time = " 时 间 ： " + this.gameLogic.getCurStageTime + " ";
        let progress = "（进度" + Math.floor(this.gameLogic.getCurStageProgress() * 100) + "%）";
        // this.timeLabel.string = time + progress;
    }

    //刷新击杀信息
    updateKillCountLabel() {
        // this.killCountLabel.string = " 击 杀 ： " + this.gameLogic.getKillCount() + " ";
    }

    //刷新精英怪当前总数 如果 num为负数 说明精英怪被击杀 根据精英怪被击杀数量 刷新精英怪出现的最大数量
    updateLeaderCurTotal(num: number) {
        // this._curLeaderTotal += num;
        // if (num < 0) {
        //     this._killLeaderTotal += Math.abs(num);
        // }
    }
}

