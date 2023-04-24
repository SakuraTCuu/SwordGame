
import { _decorator, Component, Node, JsonAsset, game, director } from 'cc';
import { em } from '../global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('HeroBaseProperty')
export class HeroBaseProperty extends Component {
    @property(JsonAsset)
    heroPropertyDataJson;
    @property(JsonAsset)
    trainingLvListJson;
    @property(JsonAsset)
    skillBookListJson;
    @property(JsonAsset)
    bossDataListJson;
    @property(JsonAsset)
    equQualityListJson;
    @property(JsonAsset)
    equEffectListJson;
    @property(JsonAsset)
    equLevelListJsonArr: JsonAsset[] = [];

    _heroData;

    _trainingLvList;
    _skillBookList = {};
    _bossDataList = {};
    _equQualityList = {};
    _equLevelList = {};
    _equEffectList = {};
    _percentageBloodLv: number;
    _percentageDamageLv: number;
    _moveSpeedLv: number;
    _percentageMoveSpeedLv: number;
    _criticalHitRateLv: number;
    _bonusBulletTotalLv: number;
    _bonusBulletMoveSpeedLv: number;
    _bonusBulletAttackTimesLv: number;
    _recoveryHealthyLv: number;
    _expAdditionLv: number;
    _divineStoneAdditionLv: number;

    //玩家当前装备
    _heroCurEqu = {
        "法器": "",
        "防具": "",
        "鞋": "",
    }
    onDestroy() {
        em.remove("usingHeroBasePropertyFun");
    }
    onLoad() {
        this._heroData = this.heroPropertyDataJson.json[0];
        this._trainingLvList = this.trainingLvListJson.json;
        this.initSkillBookData();
        this.initBossConfigList();
        this.initEquData();
        em.add("usingHeroBasePropertyFun", this.usingHeroBasePropertyFun.bind(this));
        director.addPersistRootNode(this.node);//背包物品在各个场景皆可用到 设置为常驻节点
    }
    start() {
        this.initHeroCurEqu();
        // this.getBasePropertyValueByEqu();
    }
    // 初始化功法秘籍数据
    initSkillBookData() {
        let all = this.skillBookListJson.json;
        all.forEach(element => {
            // let id = element.id;
            let name = element.name;
            let name2 = element.name2;
            // this._skillBookList[id] = element;
            this._skillBookList[name] = element;
            this._skillBookList[name2] = element;
        });
    }

    // 初始化boss配置列表
    initBossConfigList() {
        let all = this.bossDataListJson.json;
        all.forEach(element => {
            let id = element.id;
            this._bossDataList[id] = element;
        });
        // console.log("_bossDataList",this._bossDataList);
    }
    // 初始化装备数据
    initEquData() {
        let all1 = this.equQualityListJson.json;
        let all2: any = (() => {
            let arr = [];
            this.equLevelListJsonArr.forEach((list) => {
                arr = arr.concat(list.json);
            });
            return arr;
        })();
        let all3 = this.equEffectListJson.json;
        // console.log("all1", all1);
        // console.log("all2", all2);
        // console.log("all3", all3);

        all1.forEach(element => {//初始化品级
            let name = element.name;
            this._equQualityList[name] = element;
        });
        all2.forEach(element => {//初始化等级
            let name = element.name;
            this._equLevelList[name] = element;
        });
        all3.forEach(element => {//初始化词条
            let id = element.id;
            this._equEffectList[id] = element;
        });
    }
    // 初始化英雄当前装备
    initHeroCurEqu() {
        let data = em.dispatch("getTempData", "curEquData");
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    if (this._heroCurEqu.hasOwnProperty(key)) this._heroCurEqu[key] = element;
                }
            }
        }
    }
    onEnable() {
        this.initBasePropertyLv();
    }
    initBasePropertyLv() {
        let config = em.dispatch("getTempData", "HeroBasePropertyLvList");
        if (null == config) {//数据为空时 起用默认值
            config = {
                percentageBloodLv: 1,
                percentageDamageLv: 1,
                percentageMoveSpeedLv: 1,
                moveSpeedLv: 1,
                criticalHitRateLv: 1,
                bonusBulletTotalLv: 1,
                bonusBulletMoveSpeedLv: 1,
                bonusBulletAttackTimesLv: 1,
                recoveryHealthyLv: 1,
                expAdditionLv: 1,
                divineStoneAdditionLv: 10
            };
        }
        this._percentageBloodLv = config.percentageBloodLv;
        this._percentageDamageLv = config.percentageDamageLv;
        this._percentageMoveSpeedLv = config.percentageMoveSpeedLv;
        this._moveSpeedLv = config.moveSpeedLv;
        this._criticalHitRateLv = config.criticalHitRateLv;
        this._bonusBulletTotalLv = config.bonusBulletTotalLv;
        this._bonusBulletMoveSpeedLv = config.bonusBulletMoveSpeedLv;
        this._bonusBulletAttackTimesLv = config.bonusBulletAttackTimesLv;
        this._recoveryHealthyLv = config.recoveryHealthyLv;
        this._expAdditionLv = config.expAdditionLv;
        this._divineStoneAdditionLv = config.divineStoneAdditionLv;


    }


    savingLvData() {
        // 基础属性等级清单
        let list = {
            percentageBloodLv: this._percentageBloodLv,
            percentageDamageLv: this._percentageDamageLv,
            moveSpeedLv: this._moveSpeedLv,
            percentageMoveSpeedLv: this._percentageMoveSpeedLv,
            criticalHitRateLv: this._criticalHitRateLv,
            bonusBulletTotalLv: this._bonusBulletTotalLv,
            bonusBulletMoveSpeedLv: this._bonusBulletMoveSpeedLv,
            bonusBulletAttackTimesLv: this._bonusBulletAttackTimesLv,
            recoveryHealthyLv: this._recoveryHealthyLv,
            expAdditionLv: this._expAdditionLv,
            divineStoneAdditionLv: this._divineStoneAdditionLv
        }
        em.dispatch("savingToTempData", "HeroBasePropertyLvList", list);
    }

    // ==============外部调用==============
    usingHeroBasePropertyFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    //获取玩家当前某属性的值
    getHeroBaseProperty(property) {
        if (!this._heroData.hasOwnProperty(property)) throw "不存在属性" + property;
        let lv = this["_" + property + "Lv"];
        if (!lv) return this._heroData[property][0];
        else return this._heroData[property][lv - 1];
    }
    // 获取玩家某属性值的升级详情
    getHeroBasePropertyLvDetail(property) {
        if (!this._heroData.hasOwnProperty(property)) throw "不存在属性" + property;
        return this._heroData[property];
    }
    // 获取玩家某属性的当前等级
    getHeroBasePropertyCurLv(property) {
        if (!this._heroData.hasOwnProperty(property)) throw "不存在属性" + property;
        // console.log("property",property,this["_" + property + "Lv"]);
        return this["_" + property + "Lv"];
    }
    //升级基础属性值
    upgradeBaseProperty(property) {
        if (!this._heroData.hasOwnProperty(property)) throw "不存在属性" + property;
        this["_" + property + "Lv"]++;
        this.savingLvData();//
    }
    //获取修为数据
    getTrainingData(key) {
        let data = em.dispatch("getTempData", "training");
        if (null !== data) {
            return this._trainingLvList[data.curLv][key];
            // if (data.curLv !== 0) return this._trainingLvList[data.curLv][key];
            // if (data.curLv !== 0) return this._trainingLvList[data.curLv - 1][key];
            // else return 0;
        } else {
            return this._trainingLvList[0][key];
        }
    }
    //===================功法秘籍相关===================
    // 获取所有和功法秘籍相关的数据
    getAllAboutSkillBook() {
        return this.skillBookListJson.json;
    }
    getSkillBookDataByIdOrName(id_name) {
        if (this._skillBookList.hasOwnProperty(id_name)) return this._skillBookList[id_name];
        else throw id_name + " of _skillBookList is null";
    }
    //===================装备相关===================
    // 获取完整的装备信息
    getAllEquData() {
        return this._heroCurEqu;
    }
    // 获取指定部位装备名称
    getEquNameByType(type) {
        if (!this._heroCurEqu.hasOwnProperty(type)) throw "当前装备类型 " + type + " 不存在";
        return this._heroCurEqu[type];
    }
    //通过装备名称 获取装备属性
    getEquDataByName(nameString: string) {
        //获得品级
        let qIndex = nameString.indexOf("（");
        // if (qIndex < 0) throw "name string is error,cur name string is " + nameString;
        if (qIndex < 0) return null;
        let qKey = nameString.slice(0, qIndex);
        let lKey = nameString.slice(2);
        let qValue = this._equQualityList[qKey];
        let lValue = this._equLevelList[lKey];
        // console.log("qKey",qKey);
        // console.log("lKey",lKey);
        // console.log("qValue",qValue);
        // console.log("lValue",lValue);
        if (!qValue || !lValue) {
            console.log("qKey", qKey);
            console.log("lKey", lKey);
            console.log("qValue", qValue);
            console.log("lValue", lValue);
            throw "q or l value is null";
        }
        return {
            qData: qValue,
            lData: lValue
        };
    }
    // 切换装备
    switchEqu(type, equString) {
        if (!this._heroCurEqu.hasOwnProperty(type)) throw "当前装备类型 " + type + " 不存在";
        this._heroCurEqu[type] = equString;
        this.savingEquData();
    }
    // 记录装备数据
    savingEquData() {
        em.dispatch("savingToTempData", "curEquData", this._heroCurEqu);
    }
    // 获取当前玩家的装备 
    getCurHeroEqu(type) {
        if (this._heroCurEqu.hasOwnProperty(type)) return this._heroCurEqu[type];
        else throw "type is error,cur type is " + type;
    }
    // 获取玩家当前使用法器数据
    getCurHeroUsingWeaponData() {
        let key = this.getCurHeroEqu("法器");
        return this.getEquDataByName(key);
    }
    // 获取当前玩家的法器类型
    getCurHeroUsingWeaponType() {
        let nameString = this._heroCurEqu.法器;
        if (!nameString) return "";
        let qIndex = nameString.indexOf("（");
        return nameString.slice(2, qIndex);
    }
    // 获取装备词条信息
    getEquEffectData(id) {
        if (!this._equEffectList.hasOwnProperty(id)) throw "词条" + id + "不存在";
        return this._equEffectList[id];
    }
    //获取当前玩家通过装备获取的属性值
    getBasePropertyValueByEqu() {
        let BPV = {
            effectList: [],
            //基础属性值
            baseDamage: 0,
            moveSpeed: 0,
            blood: 0,
            CHR: 0,
            CHD: 0,
            //词条属性
            bonusCHD: 0,//额外暴伤
            bonusBulletTotal: 0,//额外法宝数量
            bonusBulletAttackTimes: 0,//额外穿透
            bonusMoveSpeed: 0,
            bonusBackDis: 0,//击退距离
            slowResistance: 0,//减速抗性
            damageReduce: 0,//减伤效果
            //debuff
            slowPer: 0,//减速百分比
        };
        console.log("this._heroCurEqu", this._heroCurEqu);

        for (const key in this._heroCurEqu) {
            const equName = this._heroCurEqu[key];
            if (!equName) continue;
            let equData = this.getEquDataByName(equName);
            let lData = equData.lData;
            let effects = equData.qData.effect;
            for (const effect of effects) {
                if (BPV.effectList.indexOf(effect) < 0) BPV.effectList.push(effect);
            }
            console.log("equData", equData);
            //添加基础属性
            for (const key2 in lData) {
                if (BPV.hasOwnProperty(key2)) {
                    let value = this.getValidValueByEffects(lData[key2], key2, effects);
                    BPV[key2] += value;
                };
            };
            //添加效果属性
            this.addEffectsValue(effects, BPV);
        };
        console.log("BPV", BPV);
        return BPV;
    }
    addEffectsValue(effects, BPV) {
        for (const id of effects) {
            switch (id) {
                case 5:
                    BPV.slowPer += 0.1;
                    break;
                case 6:
                    BPV.slowPer += 0.2;
                    break;
                case 7:
                    BPV.slowPer += 0.3;
                    break;
                case 8:
                    BPV.slowPer += 0.4;
                    break;
                case 2001:
                    BPV.bonusCHD += 0.1;
                    break;
                case 2002:
                    BPV.bonusCHD += 0.2;
                    break;
                case 2003:
                    BPV.bonusCHD += 0.3;
                    break;
                case 2004:
                    BPV.bonusBulletAttackTimes += 1;
                    break;
                case 2005:
                    BPV.bonusBulletAttackTimes += 2;
                    break;
                case 2006:
                    BPV.bonusBulletAttackTimes += 3;
                    break;
                case 2007:
                    BPV.slowResistance += 0.5;
                    break;
                case 2008:
                    BPV.slowResistance += 0.75;
                    break;
                case 2009:
                    BPV.slowResistance += 1;
                    break;
                case 2010:
                    BPV.damageReduce += 0.1;
                    break;
                case 2011:
                    BPV.damageReduce += 0.2;
                    break;
                case 2012:
                    BPV.damageReduce += 0.3;
                    break;
                case 2013:
                    BPV.bonusCHD += 0.1;
                    break;
                case 2014:
                    BPV.bonusCHD += 0.2;
                    break;
                case 2015:
                    BPV.bonusCHD += 0.3;
                    break;
                case 2016:
                    BPV.bonusMoveSpeed += 10;
                    break;
                case 2017:
                    BPV.bonusMoveSpeed += 20;
                    break;
                case 2018:
                    BPV.bonusMoveSpeed += 30;
                    break;
                case 2019:
                    BPV.bonusMoveSpeed += 40;
                    break;
                case 2020:
                    BPV.bonusMoveSpeed += 50;
                    break;
                case 2021:
                    BPV.bonusBackDis += 50;
                    break;
                case 2022:
                    BPV.bonusBackDis += 100;
                    break;
                case 5007:
                    BPV.bonusBulletTotal += 1;
                    break;
                case 5008:
                    BPV.bonusBulletTotal += 2;
                    break;
                case 5009:
                    BPV.bonusBulletTotal += 3;
                    break;

                default:
                    break;
            }
        }
    }
    //通过词条获取有效值
    getValidValueByEffects(value, key, effects) {
        if (effects.indexOf(1) > -1 && key == "baseDamage") return 0;//破烂不堪
        if (effects.indexOf(3) > -1 && key == "baseDamage") return value * 0.8;//力不从心
        if (effects.indexOf(4) > -1) {//衣衫褴褛
            if (key == "blood") return value * 0.5;
            if (key == "CHR") return 0;
            if (key == "baseDamage") return 0;
        }
        if (effects.indexOf(1012) > -1) return value * 1.1;
        if (effects.indexOf(1013) > -1) return value * 1.3;
        if (effects.indexOf(1014) > -1) return value * 1.5;
        return value;
    }

    //===================boss配置相关===============
    getBossDataById(id) {
        if (this._bossDataList.hasOwnProperty(id)) return this._bossDataList[id];
        else throw id + " of _bossDataList is null";
    }
}

