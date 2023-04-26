import LocalizedItem from "./LocalizedItem";
import LocalizedService from "../../Services/LocalizedService";
import TimerService from "../../Services/TimerService";
import { Component, Sprite, SpriteFrame, _decorator } from "cc";
import { EDITOR } from "cc/env";

const { ccclass, property, executeInEditMode, menu, requireComponent, executionOrder } = _decorator;

/**
 * 多语言精灵表单项
 */
@ccclass('SpriteFrameSet')
export class SpriteFrameSet {
    @property({
        serializable: true
    })
    lang: string = '';

    @property({
        type: SpriteFrame,
        serializable: true
    })
    spriteFrame: SpriteFrame = null;
}

/**
 * 多语言精灵
 */
@ccclass
@executeInEditMode
@requireComponent(Sprite)
@executionOrder(999)
@menu('Localized/LocalizedSprite')
export default class LocalizedSprite extends Component implements LocalizedItem {
    @property({
        type: [SpriteFrameSet]
    })
    spriteFrameSet: SpriteFrameSet[] = [];

    private _sprite: Sprite = null;

    get spriteFrame() {
        if (this._sprite == null) {
            this._sprite = this.getComponent(Sprite);
        }
        return this._sprite ? this._sprite.spriteFrame : null;
    }

    set spriteFrame(frame: SpriteFrame) {
        if (this._sprite == null) {
            this._sprite = this.getComponent(Sprite);
        }

        if (this._sprite) {
            this._sprite.spriteFrame = frame;
        }
    }

    private defaultFrame: SpriteFrame;

    private updateInterval: TimerService.Timer = null;


    onLoad() {
        this.defaultFrame = this.spriteFrame;
        app.locale.on(LocalizedService.EventType.LanguageChange, this.updateLang, this);

        // 编辑器模式, 执行
        if (EDITOR) {
            this.updateInterval = app.timer.startTimer(app.locale.EditorRefreshInterval, this.updateLang.bind(this));
        }
    }

    onDestroy() {
        app.locale.off(LocalizedService.EventType.LanguageChange, this.updateLang, this);
        if (this.updateInterval) {
            app.timer.stopTimer(this.updateInterval);
        }
    }

    updateLang() {
        this.spriteFrame = this.getSpriteFrameByLang(app.locale.getLang());
    }

    private getSpriteFrameByLang(lang): SpriteFrame {
        for (let i = 0; i < this.spriteFrameSet.length; ++i) {
            if (this.spriteFrameSet[i].lang === lang) {
                return this.spriteFrameSet[i].spriteFrame;
            }
        }

        return this.defaultFrame;
    }
}
