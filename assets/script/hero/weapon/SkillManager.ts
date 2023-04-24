/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-19 10:05:41
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\SkillManager.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Sprite, Prefab, instantiate, Label, find } from 'cc';
import { em } from '../../global/EventManager';
import { ggd } from '../../global/globalData';
import { glf } from '../../global/globalFun';

const { ccclass, property } = _decorator;

@ccclass('SkillManager')
export class SkillManager extends Component {

    @property(Prefab)
    skillPrefab;

    _openSecretList = [];//存储激活的秘法
    _bloodMakeMeStrongTimes: number = 0;//血煞功叠加层数
    _drinkBloodValue: number = 0;//嗜血诀回血量
    _godWindCloudBodyTimes: number = 0;//仙风云体叠加层数
    _thunderGodAngryTimes: number = 0;//雷神之怒叠加层数
    _thunderGodDignifiedTimes: number = 0;//雷神之威叠加层数

    _percentageDamage: number = 0;//百分比伤害提升 叠加所有静态秘法
    _avoidAttackingTotalTime: number = 0;//避开攻击总时长（未必攻击的时长）

    _beAttackedSSTimesList = {};//存储被击中触发的秘法

    _countdownList = {
        "sunHeart": 0,
    };
    //技能控制效果
    _skillDebuffEffect = {
        "paralysis": {
            "probability": 0,
            "duration": 0
        }
    }


    onDestroy() {
        em.remove("usingSkillManagerFun");
        em.remove("getSkillManagerProperty");
    }
    onLoad() {
        em.add("usingSkillManagerFun", this.usingSkillManagerFun.bind(this));
        em.add("getSkillManagerProperty", this.getSkillManagerProperty.bind(this));
        this.initSkill();


    }
    start() {
        this.openAllSecretSkill();
        this.startRecodeAvoidTime();
        //记录未被击中时长

    }
    //开始记录未被击中的时长
    startRecodeAvoidTime() {
        this.schedule(() => {
            if (ggd.stopAll) return;
            this._avoidAttackingTotalTime++;
            this.updateBeAttackedListCountdown();
        }, 1);
    }
    //刷新被攻列表的倒计时
    updateBeAttackedListCountdown() {
        for (const key in this._beAttackedSSTimesList) {
            if (Object.prototype.hasOwnProperty.call(this._beAttackedSSTimesList, key)) {
                const element = this._beAttackedSSTimesList[key];
                if (element.countdown > 0) {
                    element.countdown--;
                    if (element.countdown <= 0) element.times = 0;
                }
            }
        }
    }
    initSkill() {
        let list = em.dispatch("getTempData", "SkillBookLayer") && em.dispatch("getTempData", "SkillBookLayer").usingBookList;
        if (!list) return;
        for (const type in list) {
            if (Object.prototype.hasOwnProperty.call(list, type)) {
                const skillName = list[type];
                if (skillName) {
                    let skill = instantiate(this.skillPrefab);
                    skill.parent = this.node;
                    let sprite = skill.getComponent(Sprite);
                    let loadUrl = "images/icons/icon_" + skillName + "/spriteFrame";
                    em.dispatch("loadTheDirResources", loadUrl, (assets) => sprite.spriteFrame = assets);
                    glf.createButton(this.node, skill, "SkillManager", "onBtnSkill", skillName);
                }
            }
        }
    }

    // 通用方法
    onBtnSkill(e, p) {
        let sprite = e.target.getChildByName("mask").getComponent(Sprite);
        if (sprite.fillRange > 0) return;
        // this.changeMoveSpeed();
        this[p]();
        sprite.fillRange = 1;
        let totalTime = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", p).cd;
        let label = e.target.getChildByName("remainingTime").getComponent(Label);
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", p);
        em.dispatch("createTipsTex", skillData.name);
        this.startCoolDowntime(sprite, label, totalTime);
    }
    // 开始冷却
    startCoolDowntime(sprite, label, totalTime) {
        let interval = 1 / 60;
        // let interval = 1;
        let curTime = 0;
        label.string = totalTime;
        let cd = setInterval(() => {
            if (ggd.stopAll) return;
            curTime += interval;
            sprite.fillRange = (1 - curTime / totalTime);
            label.string = (totalTime - curTime).toFixed(2);
            // label.string = Math.floor(totalTime - curTime);
            if (curTime >= totalTime) {
                clearInterval(cd);
                sprite.fillRange = 0;
                label.string = "";
            };
        }, interval * 1000);
    }

    usingSkillManagerFun(string, ...param) {

        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    //获取hero control 属性
    getSkillManagerProperty(string: string) {
        if (this.hasOwnProperty(string)) return this[string];
        else throw "skill manager 中不存在属性：" + string;
    }
    // ===========================具体实现===========================
    /**
     * @description: 一阶功法
     */
    //凌波微步 --->身法
    changeMoveSpeed() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "changeMoveSpeed");
        // em.dispatch("usingHeroControlFun", "changeHeroMoveSpeed", 2, 10);//两倍移速 10s
        em.dispatch("usingHeroControlFun", "changeHeroMoveSpeed", skillData.moveSpeedTimes, skillData.duration);//两倍移速 10s
    }
    //剑雨术 --->武技
    swordRain() {
        em.dispatch("usingWeaponManagerFun", "usingSkillSwordRain");
    }
    // 一剑隔世 --->绝技
    justOneSwordDivideWorld() {
        em.dispatch("usingWeaponManagerFun", "usingSkillJustOneSwordDivideWorld");
    }
    // 凝气术 --->心法
    collectGas() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "凝气术");
        em.dispatch("usingHeroControlFun", "updateTempCriticalHitRate", skillData.criticalHitRate);
        em.dispatch("usingHeroControlFun", "isOpenCollectGas", true);
        let t = skillData.duration;
        let fun = () => {
            if (ggd.stopAll) return;
            t--;
            if (t <= 0) {
                this.unschedule(fun);
                em.dispatch("usingHeroControlFun", "updateTempCriticalHitRate", -skillData.criticalHitRate);
                em.dispatch("usingHeroControlFun", "isOpenCollectGas", false);
            }
        }
        this.schedule(fun, 1);
    }
    //万剑归冢 --->神通
    thousandsSwordToTomb() {
        em.dispatch("usingWeaponManagerFun", "usingSkillThousandsSwordToTomb");
    }
    /**
     * @description: 二阶功法
     */
    // 迷踪步 --->身法
    trackDisappear() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "trackDisappear");
        em.dispatch("usingHeroControlFun", "usingSkillTrackDisappear", skillData.duration);
        em.dispatch("usingHeroControlFun", "changeHeroMoveSpeed", skillData.moveSpeedTimes, skillData.duration);//两倍移速 10s
    }
    // 怒狮狂吼 --->武技
    lionRoar() {
        em.dispatch("usingHeroControlFun", "usingSkillLionRoar");
    }
    // 冰锥术 --->绝技 向周围发射冰锥，每个冰锥造成500伤害，附加1.5伤害加成，并冻结对方
    iceCone() {
        em.dispatch("usingWeaponManagerFun", "usingSkillIceCone");
    }
    // 冰盾术 ---> 心法
    iceShield() {
        em.dispatch("usingHeroControlFun", "usingSkillIceShield");
    }
    // 冰河世纪 --->神通
    iceAge() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "iceAge");
        em.dispatch("usingMapLayerFun", "frozenMap", skillData.duration, 0.2);
    }
    /**
     * @description: 三阶功法
     */
    //大步流星 --> 身法
    moveLikeMeteor() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "moveLikeMeteor");
        em.dispatch("usingHeroControlFun", "changeHeroMoveSpeed", skillData.moveSpeedTimes, skillData.duration);//两倍移速 10s
    }
    // 三昧真火 --> 武技
    samadhiTrueFire() {
        let url = "/prefabs/hero/weapon/samadhiTrueFire";
        em.dispatch("loadTheDirResources", url, (assets) => {
            let prefab = instantiate(assets);
            prefab.getComponent("SamadhiTrueFire").init();
        })
    }
    // 烈日心决 ---> 心法
    sunHeart() {
        let url = "/prefabs/hero/weapon/sunHeart";
        em.dispatch("loadTheDirResources", url, (assets) => {
            let prefab = instantiate(assets);
            prefab.parent = em.dispatch("getHeroControlProperty", "node").getChildByName("effect");
        })
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "sunHeart");
        em.dispatch("usingHeroControlFun", "updateTempCriticalHitRate", skillData.criticalHitRate);
        this._countdownList.sunHeart = skillData.duration;
        this.unschedule(this.sunHeartCountdownRun);
        this.schedule(() => {
            this.sunHeartCountdownRun();
        }, 1);
    }
    // 烈日心决倒计时运行
    sunHeartCountdownRun() {
        if (ggd.stopAll) return;
        this._countdownList.sunHeart--;
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "sunHeart");
        em.dispatch("usingHeroControlFun", "updatePercentageBloodProgress", -skillData.damageTimes);
        if (this._countdownList.sunHeart <= 0) {
            em.dispatch("usingHeroControlFun", "updateTempCriticalHitRate", -skillData.criticalHitRate);
            this.unschedule(this.sunHeartCountdownRun);
        }
    }
    // 炎爆术 ---> 绝技
    fireBloom() {
        em.dispatch("usingWeaponManagerFun", "usingSkillFireBloom");
    }
    // 地狱火
    hellFire() {
        em.dispatch("usingWeaponManagerFun", "usingSkillHellFire");
    }
    // ==================四阶功法===================
    /**
     * @description: 身法 移形换影  留下残影，吸引火力
     */
    moveLikeShadow() {
        em.dispatch("usingHeroControlFun", "usingSkillMoveLikeShadow");
    }
    /**
     * @description: 武技 灵风指 持续变化的技能，跟随瞄准方向。持续伤害
     */
    fingerLikeWind() {
        console.log("使用灵风指");
        em.dispatch("loadTheDirResources", "/prefabs/hero/weapon/fingerLikeWind", (assets) => {
            let prefab = instantiate(assets);
            prefab.getComponent("FingerLikeWind").init();
        });
    }
    /**
     * @description: 心法 如沐春风 持续回血，提升百分比伤害，提升暴击率
     */
    likeSpringBreeze() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "likeSpringBreeze");
        em.dispatch("usingHeroControlFun", "updateTempCriticalHitRate", skillData.criticalHitRate);
        em.dispatch("usingHeroControlFun", "updateTempPercentageDamage", skillData.damageTimes);
        em.dispatch("usingHeroControlFun", "isOpenLikeSpringBreeze", true);
        let t = skillData.duration;
        let fun = () => {
            if (ggd.stopAll) return;
            em.dispatch("usingHeroControlFun", "updatePercentageBloodProgress", skillData.baseDamage);
            t--;
            if (t <= 0) {
                this.unschedule(fun);
                em.dispatch("usingHeroControlFun", "updateTempCriticalHitRate", -skillData.criticalHitRate);
                em.dispatch("usingHeroControlFun", "updateTempPercentageDamage", -skillData.damageTimes);
                em.dispatch("usingHeroControlFun", "isOpenLikeSpringBreeze", false);
            }
        }
        this.schedule(fun, 1);
    }
    /**
     * @description: 绝技  八面危风   向周边发射持续的八道龙卷风 
     */
    dangerWindToNear() {
        em.dispatch("usingWeaponManagerFun", "usingSkillDangerWindToNear");
    }
    /**
     * @description: 末日风暴 不断向周边发射大风暴，范围广。伤害高,攻击间隔短
     */
    doomsdayStorm() {
        em.dispatch("usingWeaponManagerFun", "usingSkillDoomsdayStorm");
    }


    // ==================五阶功法===================
    // 飞雷神
    flyingThunderGod() {
        em.dispatch("usingHeroControlFun", "usingSkillFlyingThunderGod");
    }
    // 雷神之力
    thunderGodPower() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "thunderGodPower");
        this._skillDebuffEffect.paralysis.duration = skillData.baseDamage;
        this._skillDebuffEffect.paralysis.probability = skillData.damageTimes;
        em.dispatch("usingHeroControlFun", "isOpenThunderGodPower");
    }
    //雷云术
    thundercloud() {
        em.dispatch("loadTheDirResources", "/prefabs/hero/weapon/thundercloud", (assets) => {
            let prefab = instantiate(assets);
            let layer = find("Canvas/bulletLayer");
            prefab.parent = layer;
            let wp = em.dispatch("getHeroWorldPos");
            prefab.setWorldPosition(wp);
            prefab.getComponent("Thundercloud").init();
        });
    }
    // 奔雷术
    thunderRunning() {
        em.dispatch("usingWeaponManagerFun", "usingSkillThunderRunning");
    }
    /**
     * @description: 雷裂珠  向移动方向发射一枚雷裂珠，雷裂珠在造成和高额伤害的同时并不会消失，而是分裂为两颗新珠子。可持续分裂5次。
     */
    thunderFissionBead() {
        em.dispatch("usingWeaponManagerFun", "usingSkillThunderFissionBead");
    }


    //==================秘法======================
    // 开启所有被动秘法
    openAllSecretSkill() {
        let list = em.dispatch("getTempData", "SkillBookLayer") && em.dispatch("getTempData", "SkillBookLayer").finishBookList;
        console.log("openAllSecretSkill", list);
        if (list) {
            list.forEach(skillName => {
                let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", skillName);
                if (skillData.type == "秘法") {
                    this[skillData.name2]();
                }
            });
        }
    }
    //风行诀
    likeWindMove() {
        this._openSecretList.push("likeWindMove");
    }
    // 血煞功
    bloodMakeMeStrong() {
        this._openSecretList.push("bloodMakeMeStrong");
    }
    //叠加血煞功层数
    add_bloodMakeMeStrongTimes() {
        if (this._openSecretList.indexOf("bloodMakeMeStrong") < 0) return;
        this._bloodMakeMeStrongTimes++;
    }
    // 嗜血诀
    drinkBlood() {
        this._openSecretList.push("drinkBlood");
        this._drinkBloodValue = 20;
    }
    //冰心诀
    iceHeart() {
        this._openSecretList.push("iceHeart");
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "iceHeart");
        this._percentageDamage += skillData.damageTimes;
    }
    //火行步
    moveLikeFire() {
        this._openSecretList.push("moveLikeFire");
        em.dispatch("usingWeaponManagerFun", "usingSkillMoveLikeFire");
    }
    //流火诀
    flowFire() {
        this._openSecretList.push("flowFire");
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "flowFire");
        this._percentageDamage += skillData.damageTimes;
    }
    //仙风云体
    godWindCloudBody() {
        this._openSecretList.push("godWindCloudBody");
        this.schedule(() => {
            let times = Math.ceil(em.dispatch("getCurStageTime") / 60);
            this._godWindCloudBodyTimes = times;
        }, 1);
    }
    // 御风术 打开即用，外部获取
    driveWind() {
        this._openSecretList.push("driveWind");
    }
    thunderGodAngry() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "thunderGodAngry");
        this._openSecretList.push("thunderGodAngry");
        this._beAttackedSSTimesList["thunderGodAngry"] = {
            duration: skillData.duration,
            countdown: 0,
            maxTimes: skillData.damageTimes,
            times: 0,
            value: skillData.baseDamage
        }
    }
    thunderGodDignified() {
        this._openSecretList.push("thunderGodDignified");
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "thunderGodDignified");
        this._openSecretList.push("thunderGodDignified");
        this._beAttackedSSTimesList["thunderGodDignified"] = {
            duration: skillData.duration,
            countdown: 0,
            maxTimes: skillData.damageTimes,
            times: 0,
            value: skillData.baseDamage
        }
    }
    //============外部调用==============
    // 获取秘法提供的移速加成
    getMoveSpeedFromSecretSkill() {
        let d1 = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "仙风云体");
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "likeWindMove");
        let likeWindMoveTimes = this._avoidAttackingTotalTime > skillData.damageTimes ? skillData.damageTimes : this._avoidAttackingTotalTime;
        if (this._openSecretList.indexOf("likeWindMove") < 0) likeWindMoveTimes = 0;
        if (this._openSecretList.indexOf("godWindCloudBody") < 0) d1.moveSpeedTimes = 0;
        return likeWindMoveTimes + this._godWindCloudBodyTimes * d1.moveSpeedTimes;
    }
    // 获取秘法提供的数值加成（伤害）  
    getDamageValueFromSecretSkill() {
        let damage = this._bloodMakeMeStrongTimes;
        if (this._openSecretList.indexOf("iceHeart") > -1) damage += em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "iceHeart").baseDamage;
        return damage;
    }
    // 获取秘法提供的百分比加成（伤害）  
    getPercentageDamageFromSecretSkill() {
        let total = this._percentageDamage;
        if (this._beAttackedSSTimesList.hasOwnProperty("thunderGodAngry")) {
            let value = (this._beAttackedSSTimesList["thunderGodAngry"].times) * (this._beAttackedSSTimesList["thunderGodAngry"].value);
            total += value;
        }
        return total;
    }
    //获取秘法提供的血量恢复
    getRecoveryBloodFromSecretSkill() {
        return this._drinkBloodValue;
    }
    //获取秘法提供的百分比减伤效果
    getPercentageReduceDamageFromSecretSkill() {
        let d1 = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "仙风云体");
        let total = this._godWindCloudBodyTimes * d1.damageTimes;
        if (total > 0.5) console.warn("免伤达到50%以上");
        return total;
    }
    // 获取秘法提供的击退效果
    getBackDisFromSecretSkill() {
        let backDis = 0;
        if (this._openSecretList.indexOf("driveWind") > -1) {
            let dwd = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "御风术");
            backDis += dwd.baseDamage;
        };
        return backDis;
    }
    //获取秘法提供的暴击率
    getCHRFromSecretSkill() {
        let total = 0;
        if (this._beAttackedSSTimesList.hasOwnProperty("thunderGodDignified")) {
            let value = (this._beAttackedSSTimesList["thunderGodDignified"].times) * (this._beAttackedSSTimesList["thunderGodDignified"].value);
            total += value;
        }
        return total;
    }
    //刷新被击中后触发的秘法的层数
    updateSecretSkillTimesAfterAttacked() {
        this._avoidAttackingTotalTime = 0;
        for (const key in this._beAttackedSSTimesList) {
            if (Object.prototype.hasOwnProperty.call(this._beAttackedSSTimesList, key)) {
                const element = this._beAttackedSSTimesList[key];
                element.countdown = element.duration;
                if (element.times < element.maxTimes) element.times++;
            }
        }

    }
    /**
     * @description: 获取秘法描述
     */
    getSSDes() {
        // let string = "================秘法================\n";
        let string = "秘法：\n";
        if (this._openSecretList.indexOf("likeWindMove") > -1) {
            string += ("风行诀层数:" + this._avoidAttackingTotalTime + "\n");
        };
        if (this._openSecretList.indexOf("bloodMakeMeStrong") > -1) {
            string += ("血煞功层数:" + this._bloodMakeMeStrongTimes + "\n");
        };
        if (this._openSecretList.indexOf("godWindCloudBody") > -1) {
            string += ("仙风云体层数:" + this._godWindCloudBodyTimes + "\n");
        };
        if (this._openSecretList.indexOf("thunderGodAngry") > -1) {
            string += ("雷神之怒层数:" + this._beAttackedSSTimesList["thunderGodAngry"].times + "\n");
        };
        if (this._openSecretList.indexOf("thunderGodDignified") > -1) {
            string += ("雷神之威层数:" + this._beAttackedSSTimesList["thunderGodDignified"].times + "\n");
        };
        return string;
    }
    // 判断是否被控制
    getSkillDebuffEffectList() {
        let list = [];
        for (const key in this._skillDebuffEffect) {
            if (Object.prototype.hasOwnProperty.call(this._skillDebuffEffect, key)) {
                const element = this._skillDebuffEffect[key];
                if (element.probability > Math.random()) {
                    list.push({ type: key, duration: element.duration });
                };
            }
        }
        return list;
    }
}


