import { dynamicAtlasManager, macro } from "cc";

// //开启动态和图
// macro.CLEANUP_IMAGE_CACHE = false;
// dynamicAtlasManager.enabled = true;

// 关闭动态和图
dynamicAtlasManager.enabled = false;

export { groupIndex, attackInterval, ggd, ggConfig }
export enum tagData {
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
const groupIndex = {
    DEFAULT: 2 ** 0,
    enemy: 2 ** 1,
    self: 2 ** 2,
    obstacle: 2 ** 3,
    enemySkill: 2 ** 4,
    heroWeapon: 2 ** 5,
    itemInPlaying: 2 ** 6,//游戏过程中的物品
}

//攻击间隔 
const attackInterval = {
    monsterCollideHero: 1,
    guard: 0.5,
    spell: 0.1,
    f1s1: 1 / 60,
    boss1: 1,
    boss2: 1,
}

//全局通用数据 global game data
const ggd = {
    stopAll: false,
    curStage: 1,
    totalStage: 80,
    isOpenAd: true,
    // platform: "GooglePlay",
    platform: "wxGame",
    versionCode:"wx-v-1.0.3.2",

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
}

//全局游戏配置 global game config
const ggConfig = {
    framingInitMonster: true,//分帧生成怪物
    dynamicSupFrame: false,//动态辅助框
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


