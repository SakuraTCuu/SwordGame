import { _decorator, Component, Node, Label, instantiate, tween, Vec3, Color, NodePool, Prefab, color, Animation } from 'cc';
import { em } from '../Common/EventManager';
import IView from '../Interfaces/IView';
import { Constant } from '../Common/Constant';
const { ccclass, property } = _decorator;

@ccclass('ShowLayer')
export class ShowLayer extends IView {

    @property(Node)
    damageLabelLayer;

    @property(Node)
    tipsLabelLayer;

    @property(Animation)
    monsterComingAnim;

    protected onRegister?(...r: any[]): void {

        this.subscribe(Constant.EventId.createDamageTex, this.createDamageTex, this);
        this.subscribe(Constant.EventId.createTipsTex, this.createTipsTex, this);
        this.subscribe(Constant.EventId.showMassMonsterComing, this.showMassMonsterComing, this);
    }

    protected onUnRegister?(...r: any[]): void {
        this.unsubscribe(Constant.EventId.createDamageTex, this.createDamageTex, this);
        this.unsubscribe(Constant.EventId.createTipsTex, this.createTipsTex, this);
        this.unsubscribe(Constant.EventId.showMassMonsterComing, this.showMassMonsterComing, this);
    }

    onTick(delta: number): void {

    }

    //创建伤害文本
    createDamageTex(node: Node, damageValue, initPos = { x: 0, y: 50 }, type: string = "normal") {
        // console.log("createDamageTex");
        // return;
        // let color = new Color(255, 255, 255, 255); 
        let color: Color = this.getColorConfigByDamage(damageValue);
        let tex = app.pool.get("damageTex");
        // let tex = app.pool.plm.getFromPool("damageTex");
        tex.setScale(new Vec3(0, 0, 1));
        damageValue = this.switchDamageTexToLength(damageValue);

        if (type == "criticalHit") tex.getComponent(Label).string = "暴击:  " + damageValue;
        else tex.getComponent(Label).string = damageValue;
        tex.getComponent(Label).color = color;
        tex.parent = this.damageLabelLayer;
        let wp = node.getWorldPosition();
        // tex.setPosition(initPos.x, initPos.y);
        tex.setWorldPosition(wp.x + initPos.x, wp.y + initPos.y, 0);

        // this.playEffect1(tex,color);
        this.playEffect2(tex, color);

    }

    // 转换伤害文本长度
    switchDamageTexToLength(damageValue) {
        if (damageValue <= 9999) return damageValue;
        if (damageValue <= 9999999) return Math.round(damageValue / 1000) + "K";
        if (damageValue <= 9999999999) return Math.round(damageValue / 1000000) + "M";
        else return Math.round(damageValue / 1000000000) + "B";
    }

    //文字缩放 渐隐 位移
    playEffect1(tex: Node, color: Color) {
        let a1 = tween().by(0.5, { position: new Vec3(0, 100, 0) }, {
            onUpdate: (target, ratio) => {
                tex.getComponent(Label).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        });
        let a2 = tween().to(0.3, { scale: new Vec3(1.2, 1.2, 1) });
        let action = tween(tex).parallel(a1, a2)
            .call(() => {
                tex.setScale(new Vec3(1, 1, 1));
                // app.pool.plm.putToPool("damageTex", tex);
                app.pool.put("damageTex", tex);
                // app.pool.plm.putToPool("damageTex", tex, true);
            });
        action.start();
    }

    // 文字缩放 渐隐
    playEffect2(tex: Node, color: Color) {
        tween(tex).to(0.1, { scale: new Vec3(1, 1, 1) })
            .delay(0.3)
            .to(0.1, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                tex.setScale(new Vec3(1, 1, 1));
                // app.pool.plm.putToPool("damageTex", tex);
                app.pool.put("damageTex", tex);
                // app.pool.plm.putToPool("damageTex", tex, false);
            })
            .start();
    }
    /**
    * @description:  通过伤害判定颜色 
    * @param {*} type 伤害类型
    */
    getColorConfigByDamage(value: number) {
        return new Color(255, 245, 0, 255);
        if (value <= 100) return new Color(140, 255, 95, 255);
        if (value <= 500) return new Color(255, 245, 0, 255);
        if (value <= 1000) return new Color(255, 78, 34, 255);
        if (value <= 5000) return new Color(53, 247, 239, 255);
        if (value <= 10000) return new Color(247, 53, 53, 255);
        if (value <= 50000) return new Color(204, 0, 255, 255);
        else return new Color(255, 0, 0, 255);
    }

    //=================创建提示信息===============
    createTipsTex(content: string, initPos = { x: 0, y: 50 }) {
        // return;
        let tex = app.pool.get("tipsTex");
        // let tex = app.pool.plm.getFromPool("tipsTex");
        tex.getComponent(Label).string = content;
        tex.parent = this.tipsLabelLayer;
        // let wp = node.getWorldPosition();
        let wp = em.dispatch("getHeroWorldPos");
        tex.setWorldPosition(wp.x + initPos.x, wp.y + initPos.y, 0);
        this.playTIPSTeXEffect(tex);;
    }

    playTIPSTeXEffect(tex, color = new Color(255, 255, 255, 255)) {
        let a1 = tween().by(1, { position: new Vec3(0, 200, 0) }, {
            onUpdate: (target, ratio) => {
                tex.getComponent(Label).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        });
        let a2 = tween().to(0.5, { scale: new Vec3(1.2, 1.2, 1) });
        let action = tween(tex).parallel(a1, a2)
            .call(() => {
                tex.setScale(new Vec3(1, 1, 1));
                // app.pool.plm.putToPool("damageTex", tex);
                app.pool.put("tipsTex", tex);
                // app.pool.plm.putToPool("tipsTex", tex, true);
            });
        action.start();
    }

    //===================播放提示动画================
    showMassMonsterComing() {
        this.monsterComingAnim.node.active = true;
        this.monsterComingAnim.play();
        this.scheduleOnce(() => {
            this.monsterComingAnim.node.active = false;
        }, 3);
    }
}

