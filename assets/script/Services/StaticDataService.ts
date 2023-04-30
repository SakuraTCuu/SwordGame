
import { _decorator, Component, Node, JsonAsset, game, director, resources } from 'cc';
import { em } from '../global/EventManager';
import IService from '../Interfaces/IService';
import { Constant } from '../Common/Constant';
import HeroPropertyRuntimeData from '../Role/Hero/HeroPropertyRuntimeData';
import Singleton from '../Decorators/Singleton';

@Singleton
export class StaticDataService implements IService {

    public static readonly instance: StaticDataService;

    heroStaticData: any = {};
    trainingLvData = {};
    skillBookData = {};
    bossData = {};
    equQualityData = {};
    equLevelData = {};
    equEffectData = {};

    heroPropertyRuntimeData: HeroPropertyRuntimeData = null;

    public async initialize(): Promise<void> {

    }

    public async lazyInitialize(): Promise<void> {
        let heroPropertyDataJson = await app.loader.loadAsync(Constant.Path.HeroPropertyDataJson, JsonAsset) as JsonAsset;
        let trainingLvListJson = await app.loader.loadAsync(Constant.Path.TrainingLvListJson, JsonAsset) as JsonAsset;
        let skillBookListJson = await app.loader.loadAsync(Constant.Path.SkillBookListJson, JsonAsset) as JsonAsset;
        let bossDataListJson = await app.loader.loadAsync(Constant.Path.BossDataListJson, JsonAsset) as JsonAsset;
        let equQualityListJson = await app.loader.loadAsync(Constant.Path.EquQualityListJson, JsonAsset) as JsonAsset;
        let equEffectListJson = await app.loader.loadAsync(Constant.Path.EquEffectListJson, JsonAsset) as JsonAsset;
        let equEffectLevelListJson = await app.loader.loadAsync(Constant.Path.EquEffectLevelListJson, JsonAsset) as JsonAsset;
        let equArmorListJson = await app.loader.loadAsync(Constant.Path.EquArmorListJson, JsonAsset) as JsonAsset;
        let equShoeListJson = await app.loader.loadAsync(Constant.Path.EquShoeListJson, JsonAsset) as JsonAsset;

        //英雄属性表
        if (heroPropertyDataJson) {
            this.heroStaticData = heroPropertyDataJson?.json[0];
        }

        //修仙境界表
        if (trainingLvListJson) {
            this.trainingLvData = trainingLvListJson.json;
        }

        // 初始化功法秘籍数据
        if (skillBookListJson) {
            let all = skillBookListJson.json;
            all.forEach(element => {
                // let id = element.id;
                let name = element.name;
                let name2 = element.name2;
                // this.skillBookData[id] = element;
                this.skillBookData[name] = element;
                this.skillBookData[name2] = element;
            });
        }

        // 初始化boss配置列表
        if (bossDataListJson) {
            let all = bossDataListJson.json;
            all.forEach(element => {
                let id = element.id;
                this.bossData[id] = element;
            });
        }

        //装备品级属性
        if (equQualityListJson) {
            let equQualityJson = equQualityListJson.json;
            equQualityJson.forEach(element => {
                let name = element.name;
                this.equQualityData[name] = element;
            });
        }

        //法器词条
        if (equEffectListJson) {
            let all3 = equEffectListJson.json;
            all3.forEach(element => {
                let id = element.id;
                this.equEffectData[id] = element;
            });
        }

        //法器等级属性表
        if (equEffectLevelListJson) {
            let all = equEffectLevelListJson.json;
            all.forEach(element => {
                let id = element.id;
                this.equLevelData[id] = element;
            });
        }

        //防具
        if (equArmorListJson) {
            let all = equArmorListJson.json;
            all.forEach(element => {
                let id = element.id;
                this.equLevelData[id] = element;
            });
        }

        //鞋具
        if (equShoeListJson) {
            let all = equShoeListJson.json;
            all.forEach(element => {
                let id = element.id;
                this.equLevelData[id] = element;
            });
        }

        //初始化英雄属性
        this.initHeroData();

        em.add("usingHeroBasePropertyFun", this.usingHeroBasePropertyFun.bind(this));
    }

    onDestroy() {
        em.remove("usingHeroBasePropertyFun");
    }

    initHeroData() {
        let heroProperty = app.storage.getTempData("HeroBasePropertyLvList") || {};
        let equData = app.storage.getTempData("curEquData") || {};

        let heroData = {
            ...heroProperty,
            ...equData,
        }

        this.heroPropertyRuntimeData = new HeroPropertyRuntimeData(heroData);
    }

    savingLvData() {
        // 基础属性等级清单
        app.storage.savingToTempData("HeroBasePropertyLvList", this.heroPropertyRuntimeData);
    }

    // ==============外部调用==============
    usingHeroBasePropertyFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }

    //获取玩家当前某属性的值
    getHeroBaseProperty(property) {
        if (!this.heroStaticData.hasOwnProperty(property)) throw "不存在属性" + property;
        let lv = this["_" + property + "Lv"];
        if (!lv) return this.heroStaticData[property][0];
        else return this.heroStaticData[property][lv - 1];
    }
    // 获取玩家某属性值的升级详情
    getHeroBasePropertyLvDetail(property) {
        if (!this.heroStaticData.hasOwnProperty(property)) throw "不存在属性" + property;
        return this.heroStaticData[property];
    }

    // 获取玩家某属性的当前等级
    getHeroBasePropertyCurLv(property) {
        if (!this.heroStaticData.hasOwnProperty(property)) throw "不存在属性" + property;
        // console.log("property",property,this["_" + property + "Lv"]);
        return this["_" + property + "Lv"];
    }

    //升级基础属性值
    upgradeBaseProperty(property) {
        if (!this.heroStaticData.hasOwnProperty(property)) throw "不存在属性" + property;
        // this["_" + property + "Lv"]++;
        this.heroPropertyRuntimeData[property]++;
        this.savingLvData();//
    }

    //获取修为数据
    getTrainingData(key) {
        let data = app.storage.getTempData("training");

        if (null !== data) {
            return this.trainingLvData[data.curLv][key];
            // if (data.curLv !== 0) return this.trainingLvData[data.curLv][key];
            // if (data.curLv !== 0) return this.trainingLvData[data.curLv - 1][key];
            // else return 0;
        } else {
            return this.trainingLvData[0][key];
        }
    }
    //===================功法秘籍相关===================
    // 获取所有和功法秘籍相关的数据
    getAllAboutSkillBook() {
        return this.skillBookData;
    }

    getSkillBookDataByIdOrName(id_name) {
        if (this.skillBookData.hasOwnProperty(id_name)) return this.skillBookData[id_name];
        else throw id_name + " of skillBookData is null";
    }
    //===================装备相关===================
    // 获取完整的装备信息
    getAllEquData() {
        return this.heroPropertyRuntimeData;
    }
    // 获取指定部位装备名称
    getEquNameByType(type) {
        if (!this.heroPropertyRuntimeData.hasOwnProperty(type)) throw "当前装备类型 " + type + " 不存在";
        return this.heroPropertyRuntimeData[type];
    }
    //通过装备名称 获取装备属性
    getEquDataByName(nameString: string) {
        //获得品级
        let qIndex = nameString.indexOf("（");
        // if (qIndex < 0) throw "name string is error,cur name string is " + nameString;
        if (qIndex < 0) return null;
        let qKey = nameString.slice(0, qIndex);
        let lKey = nameString.slice(2);
        let qValue = this.equQualityData[qKey];
        let lValue = this.equLevelData[lKey];
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
        if (!this.heroPropertyRuntimeData.hasOwnProperty(type)) throw "当前装备类型 " + type + " 不存在";
        this.heroPropertyRuntimeData[type] = equString;
        this.savingEquData();
    }
    // 记录装备数据
    savingEquData() {
        app.storage.savingToTempData("curEquData", this.heroPropertyRuntimeData.getEquData());
    }
    // 获取当前玩家的装备 
    getCurHeroEqu(type) {
        if (this.heroPropertyRuntimeData.hasOwnProperty(type)) return this.heroPropertyRuntimeData[type];
        else throw "type is error,cur type is " + type;
    }
    // 获取玩家当前使用法器数据
    getCurHeroUsingWeaponData() {
        let key = this.getCurHeroEqu("法器");
        return this.getEquDataByName(key);
    }
    // 获取当前玩家的法器类型
    getCurHeroUsingWeaponType() {
        let nameString = this.heroPropertyRuntimeData.法器;
        if (!nameString) return "";
        let qIndex = nameString.indexOf("（");
        return nameString.slice(2, qIndex);
    }
    // 获取装备词条信息
    getEquEffectData(id) {
        if (!this.equEffectData.hasOwnProperty(id)) throw "词条" + id + "不存在";
        return this.equEffectData[id];
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

        let equUsingData = this.heroPropertyRuntimeData.getEquData();
        console.log("this.heroPropertyRuntimeData", equUsingData);

        for (const key in equUsingData) {
            const equName = equUsingData[key];
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
        if (this.bossData.hasOwnProperty(id)) return this.bossData[id];
        else throw id + " of bossData is null";
    }
}

