// stageConfig/关卡奖励配置.json
export interface LevelRewardConfig {
    passReward: number[];
    passRewardRatio: number[];
    monsterReward: number[];
    monsterRewardRatio: number[];
    leaderReward: number[];
    leaderRewardRatio: number[];
    lingshi: {
        max: number;
        min: number;
    };
}

// stageConfig/关卡精英怪和boss配置.json
export interface LevelLeaderAndBossConfig {
    id: number;
    stage: number;
    startCount: number;
    mod: number;
    maxTotal: number;
    type: number[];
    bossId: number;
    maxLevel: number;
}

// stageConfig/boss属性配置.json
export interface BossAttributeConfig {
    id: number;
    name: string;
    moveSpeed: number;
    maxBlood: number;
    normalDamage: number;
    animKey: string;
}

// stageConfig/StageArmyConfig.json
export interface StageArmyConfig {
    time: number[];
    queue: number[];
}

// stageConfig/StageConfig.json
export type StageConfig = {
    [key in string]: StageLevelConfig[];
}

//放弃
// export interface StageConfig {
//     [key in string]: StageLevelConfig[];
// }


export interface StageLevelConfig {
    time: number;
    max: number;
    duration: number;
    timeGap: number;
    id: number[];
    queue: number[];
    ratio: number[]
}

// stageConfig/stageDes.json
export type StageDescConfig = {
    [key in string]: string;
}

//stageConfig/StageMonsterStrong.json
export type StageMonsterStrongConfig = {
    [key in string]: {
        blood: number;
        damage: number;
        moveSpeed: number;
    };
}

// others/功法秘籍表.json
export interface CheatsConfig {
    id: number;
    name: string;
    name2: string;
    type: string;
    lv: number;
    description: string;
    cd: number;
    moveSpeedTimes: number;
    duration: number;
    baseDamage: string;
    damageTimes: string;
    criticalHitRate: string;
    rareRatio: number;
}

// others/怪物属性表.json
export interface MonsterAttributeConfig {
    id: number;
    name: string;
    animKey: number;
    damage: number;
    maxBlood: number;
    moveSpeed: number;
    color: string;
    effects: number[]
}

// other/经验等级对应表.json
export interface ExpLevelConfig {
    lv: number;
    exp: number;
}

// other/武器属性表.json
export interface WeaponAttributeConfig {
    id: number,
    name: string,
    name2: string,
    damage: number[],
    damageTimes: number[],
    duration: number[],
    moveSpeed: number[],
    maxLevel: number,
    canAttackTimes: number[],
    backDis: number[],
    attackInterval: number[],
    USInterval: number,
    total: number[],
    lv1: string,
    lv2: string,
    lv3: string,
    lv4: string,
    lv5: string
}

// other/修仙境界表.json
export interface XiuxianLevelConfig {
    lv: number,
    name: string,
    exp: number,
    blood: number,
    damage: number,
    moveSpeed: number
}

// other/英雄属性表.json
export interface HeroAttributeConfig {
    id: number,
    name: string,
    percentageBlood: number[],
    percentageDamage: number[],
    percentageMoveSpeed: number[],
    criticalHitRate: number[],
    bonusBulletTotal: number[],
    bonusBulletMoveSpeed: number[],
    bonusBulletDuration: number[],
    bonusBulletAttackTimes: number[],
    recoveryHealthy: number[],
    expAddition: number[],
    divineStoneAddition: number[],
    moveSpeed: number[],
    maxLevel: number
}

// other/Boss技能属性表.json
export interface BossSkillAttributeConfig {
    normalParticle: {
        name: string,
        damage: number,
        duration: number,
        moveSpeed: number,
        canAttackTimes: number,
        canMove: true
    },
    sprint: {
        speed: number
    }
    maxMS: number;
    ice: {
        name: string,
        damage: number,
        duration: number,
        moveSpeed: number,
        canAttackTimes: number,
        attackInterval: number,
        effects: string[]
    }
    
    1: number,
    2: number,
    3: number,
    4: number
}

//other/item.json
export interface ItemConfig {
    id: number,
    name: string,
    loadUrl: string,
    description: string,
    type: string,
    price: number,
    mergeDemandTotal: string,
    mergeTarget: string,
    quality: number,
    type2: string,
    lv: string
}

//equSystem/法器词条.json
export interface WeaponDescConfig {
    id: number,
    name: string,
    type: number,
    description: string
}

//equSystem/法器等级属性表.json
export interface WeaponLevelAttributeConfig {
    id: number,
    name: string,
    baseDamage: number,
    damageTimes: number,
    attackInterval: number
}
//equSystem/防具等级属性表.json
export interface ArmorLevelAttributeConfig {
    id: number,
    name: string,
    blood: number,
    CHR: number,
    baseDamage: number
}
//equSystem/鞋等级属性表.json
export interface ShoeLevelAttributeConfig {
    id: number,
    name: string,
    blood: number,
    moveSpeed: number,
    baseDamage: number
}
//equSystem/装备品级属性表.json
export interface WeaponQualityConfig {
    id: number,
    name: string,
    effect: number[],
    maxLevel: number
}
