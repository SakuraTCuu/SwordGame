export default class HeroPropertyRuntimeData {

    public percentageBlood: number = 1;
    public percentageDamage: number = 1;
    public percentageMoveSpeed: number = 1;
    public moveSpeed: number = 1;
    public criticalHitRate: number = 1;
    public bonusBulletTotal: number = 1;
    public bonusBulletMoveSpeed: number = 1;
    public bonusBulletAttackTimes: number = 1;
    public recoveryHealthy: number = 1;
    public expAddition: number = 1;
    public divineStoneAddition: number = 10;

    public 法器: string = "";
    public 防具: string = "";
    public 鞋: string = "";

    constructor(config?: any) {
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                if (this[key]) {
                    this[key] = config[key];
                }
            }
        }
    }

    public getEquData() {
        return {
            法器: this.法器,
            防具: this.防具,
            鞋: this.鞋
        }
    }
}