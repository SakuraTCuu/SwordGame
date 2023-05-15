import { AnimationClip, JsonAsset, Prefab, SpriteFrame } from "cc";

export namespace Constant {

    export class Audio {
        static HOME_BGM = "刀剑如梦"; //主页bgm
        static LEVEL_BGM = "不谓侠"; //关卡bgm
        static FROZEN_SFX = "frozen"; //冰冻音效
        static SPELL_SFX = "frozen"; //冰冻音效
        static HIT_GROUND_SFX = "砸地"; //砸地音效
        static CLICK_SFX = "通用按键"; //通用按键音效
        static INTO_PROVING_GROUND_SFX = "进入试炼场"; //进入试炼场音效
        static CLICK_FIGURE_SFX = "点击人物界面"; //点击人物界面音效
        static CLICK_PRACTICE_SFX = "点击修行界面"; //点击修行界面音效
        static CLICK_ALCHEMY_SFX = "点击炼丹界面"; //点击炼丹界面音效
        static CLICK_CHEATS_SFX = "点击秘籍界面"; //点击秘籍界面音效

        static REFINING_ELIXIR = "炼制丹药"; //炼制丹药音效
        static TAKE_PILLS = "吃药"; //吃药音效
        static BREAKTHROUGH = "突破"; //突破音效
    }

    export const enum EventId {
        tipsViewShow = "tipsViewShow",
        hideBanner = "hideBanner",
        showWxVideoAd = "showWxVideoAd",
        showBanner = "showBanner",
        loadRes = "loadRes",
        loadDir = "loadDir",
        switchMainMenuLayer = "switchMainMenuLayer",
        updateLoadingProgress = 'updateLoadingProgress',
        loadingComplete = 'loadingComplete',
        passStage = 'passStage', //通关
        quitHalfway = 'quitHalfway', //中途失败或退出
        updateKillCountLabel = 'updateKillCountLabel',
        updateLeaderCurTotal = 'updateLeaderCurTotal',
        getDoubleReward = 'getDoubleReward',
        getCurStageTime = 'getCurStageTime',
        closeGetDoubleRewardAd = 'closeGetDoubleRewardAd',
    }

    //属性标记
    export enum Tag {
        hero = 10,
        sword,
        fan,
        guard,
        spell,
        darts,//15
        friend1Skill1,
        monster,
        wall,
        boss,
        fireBall,//20
        fireBallFire,
        trackDisappear,
        enemySkill,//敌人技能 只单纯的计算伤害
        obstacle,
        puppet,
        destroyWeapon,//无坚不摧的武器
        randomSkillReward,//随机技能奖励
    }

    //分组
    export const GroupIndex = {
        DEFAULT: 2 ** 0,
        enemy: 2 ** 1,
        self: 2 ** 2,
        obstacle: 2 ** 3,
        enemySkill: 2 ** 4,
        heroWeapon: 2 ** 5,
        itemInPlaying: 2 ** 6,//游戏过程中的物品
    }

    //攻击间隔 
    export const AttackInterval = {
        monsterCollideHero: 1,
        guard: 0.5,
        spell: 0.1,
        f1s1: 1 / 60,
        boss1: 1,
        boss2: 1,
    }

    //全局游戏配置 global game config
    export const GlobalGameConfig = {
        framingInitMonster: true,//分帧生成怪物
        dynamicSupFrame: true,//动态辅助框
        quadTreeRange: {
            w: 700,
            h: 1300
        },
        adUnitIds: [
            "adunit-e4f9eda3feb2de98",
            "adunit-4fd8f9b38c4adb1f",
            "adunit-6337803394072dcc"
        ]
    }

    //全局通用数据 global game data
    export const GlobalGameData = {
        stopAll: false,
        curStage: 1,
        totalStage: 80,
        isOpenAd: true,
        // platform: "GooglePlay",
        platform: "wxGame",
        versionCode: "wx-v-1.0.3.2",

        curAdRewardType: "",//当前广告奖励类型 --->通过该字段判断发放奖励类型
        //需要记录的
        stageProgress: 1,
        userInfo: {
            isVisitor: true,
            token: "",
            accountMetadata: null,
        },
        phoneInfo: {
            imei: "",
        },
        //播放广告次数
        playAdTimes: 0,

        //每日最大播放次数
        MaxTodayEquVideoShowTimes: 2,
    }

    export class Res {
        static ResBundleName: "resources";

        static ResourcesList = [
            { id: 0, path: "anim", desc: "动画资源", type: AnimationClip },
            // { id: 1, path: "audio", desc: "音频资源", type: AudioClip },
            { id: 2, path: "data", desc: "配表资源", type: JsonAsset },
            { id: 3, path: "images", desc: "图片资源", type: SpriteFrame },
            { id: 4, path: "prefabs", desc: "预制资源", type: Prefab },
        ];
    }

    export class Path {
        //道具表
        static ItemPath = "data/others/item";
        //英雄属性表
        static HeroPropertyDataJson = "data/others/英雄属性表";
        //修仙境界表
        static TrainingLvListJson = "data/others/修仙境界表";
        //功法秘籍表
        static SkillBookListJson = "data/others/功法秘籍表";
        //boss技能属性表
        static BossSkillDataListJson = "data/others/Boss技能属性表";
        //boss属性配置
        static BossDataListJson = "data/stageConfig/boss属性配置";
        //装备品级属性表
        static EquQualityListJson = "data/equSystem/装备品级属性表";
        //法器词条
        static EquEffectListJson = "data/equSystem/法器词条";
        //法器等级属性表
        static EquEffectLevelListJson = "data/equSystem/法器等级属性表";
        //防具等级属性表
        static EquArmorListJson = "data/equSystem/防具等级属性表";
        //鞋等级属性表
        static EquShoeListJson = "data/equSystem/鞋等级属性表";

        
        //关卡配置
        static StageConfig = "data/stageConfig/stageConfig";
        //关卡精英怪和boss配置leaderAndBossConfigJson
        static StageLeaderAndBossConfig = "data/stageConfig/关卡精英怪和boss配置";
        //关卡奖励配置
        static StageRewardConfig = "data/stageConfig/关卡奖励配置";
        //关卡怪物群配置
        static StageArmyConfig = "data/stageConfig/stageArmyConfig";
    }

    export const URL = {
        Register: "/xiuXian/player/registry",
        Login: "/xiuXian/player/login",
        SavingData: "/xiuXian/player/syncAccountMetadata",
        AdClickCount: "/xiuXian/statistics/adClick",
        GetPrize: "/game/toBeImmortal/prize", //推送记录到服务端
    }
}