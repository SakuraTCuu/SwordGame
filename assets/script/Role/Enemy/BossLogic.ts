import { Constant } from '../../Common/Constant';
export default class BossLogic {

    _bossId: number = 0;

    _normalDamage: number = 99;

    private _rawSpeed: number = 0;
    public get rawSpeed(): number {
        return this._rawSpeed;
    }
    public set rawSpeed(value: number) {
        this._rawSpeed = value;
    }
    private _curSpeed: number = 0;
    public get curSpeed(): number {
        return this._curSpeed;
    }
    public set curSpeed(value: number) {
        this._curSpeed = value;
    }

    private _canMove: boolean = true;
    public get canMove(): boolean {
        return this._canMove;
    }
    public set canMove(value: boolean) {
        this._canMove = value;
    }

    _maxBlood: number = 0;
    _curBlood: number = 0;
    _animKey: string = "";

    //技能相关
    private _skillData: any = {};
    public get skillData(): any {
        return this._skillData;
    }
    public set skillData(value: any) {
        this._skillData = value;
    }

    //冲刺碰撞技能
    _sprintDir = null; //boss 冲刺方向
    _sprintDis: number; //boss 冲刺距离
    private _sprintSpeed: number;//boss 冲刺速度
    public get sprintSpeed(): number {
        return this._sprintSpeed;
    }
    public set sprintSpeed(value: number) {
        this._sprintSpeed = value;
    }

    _bossInfo: any = {};

    _isDead: boolean = false;

    constructor(bossId: number) {
        this.initBoss(bossId);
    }

    initBoss(bossId: number) {
        let bossData = app.staticData.getBossDataById(bossId);
        bossData.canMove = true;

        this.skillData = app.staticData.getBossSkillDataById(bossId);

        this.skillData.normalParticle.damage = bossData.normalDamage;
        this.sprintSpeed = this.skillData?.sprint?.speed;
        this.initBossInfo(bossData);
    }

    getIsDead() {
        return this._isDead;
    }

    getAnimKey() {
        return this._animKey;
    }

    getCurBlood() {
        return this._curBlood;
    }

    // =====================初始化阶段=====================
    initBossInfo(bd: { moveSpeed: number, canMove: boolean, id: number, maxBlood: number, normalDamage: number, animKey: string }) {
        this._bossId = bd.id;
        this.rawSpeed = bd.moveSpeed;
        this.curSpeed = bd.moveSpeed;
        this.canMove = bd.canMove;
        this._maxBlood = bd.maxBlood;
        this._curBlood = bd.maxBlood;
        this._normalDamage = bd.normalDamage;
        this._animKey = bd.animKey;
    }

    /**
     * 
     */
    attackedByHero(attackInfo: any) {
        let damage = attackInfo.damage;
        /**
         * TODO:
         * 计算技能以及抗性, 得出最终伤害
         */
        this.updateBlood(damage);
    }

    //更新血量
    updateBlood(changeValue: number) {
        this._curBlood += changeValue;
        if (this._curBlood <= 0) {
            Constant.GlobalGameData.stopAll = true;
            //TODO:  检测有复活之类的?
            this._isDead = true;
        }
        if (this._curBlood > this._maxBlood) this._curBlood = this._maxBlood;
    }

    // 获取当前血量百分比
    getBloodPercentage() {
        return this._curBlood / this._maxBlood;
    }
}
