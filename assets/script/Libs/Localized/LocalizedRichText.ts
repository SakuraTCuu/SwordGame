import LocalizedItem from "./LocalizedItem";
import LocalizedService from "../../Services/LocalizedService";
import TimerService from "../../Services/TimerService";
import { Component, Enum, RichText, warn, _decorator } from "cc";
import { EDITOR } from "cc/env";

const { ccclass, property, executeInEditMode, menu, requireComponent, executionOrder } = _decorator;

/**
 * 多语言文本标签
 */
@ccclass
@executeInEditMode
@requireComponent(RichText)
@executionOrder(999)
@menu('Localized/LocalizedRichText')
export default class LocalizedRichText extends Component implements LocalizedItem {
    @property
    _langID:string = '';

    @property
    get langID() {
        return this._langID;
    }
    set langID(id: string) {
        this._langID = id;
        this.updateLang();
    }

    private _label: RichText = null;

    get label() {
        if (this._label == null) {
            this._label = this.getComponent(RichText);
        }
        if (this._label == null) {
            warn('不存在cc.Label节点', this.node.name);
        }
        return this._label;
    }

    @property({
        type: Enum({
            Normal: 0,
            Upper: 1,
            Lower: 2
        }),
        tooltip: '文本类型:\n1.正常\n2.全大写\n3.全小写'
    })
    textType: any = 0;

    @property({
        // type: [],
        tooltip: '格式化参数填充内容'
    })
    langArgs: string[] = [];

    private updateInterval: TimerService.Timer = null;

    onLoad() {
        this.updateLang();
        app.locale.on(LocalizedService.EventType.LanguageChange, this.updateLang, this);

        // 编辑器模式, 执行定时更新
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
        if (this.langID == null || this.langID == '') {
            return;
        }

        const text = (this.langArgs && this.langArgs.length > 0) ? app.locale.value(this.langID, ...this.langArgs) : app.locale.value(this.langID);
        switch (this.textType) {
            case 0:
            default:
                this.label.string = text;
                break;
            case 1:
                this.label.string = text.toUpperCase();
                break;
            case 2:
                this.label.string = text.toLowerCase();
                break;
        }
    }

    /**
     * 设置格式化后的语言对应文本
     * @param langID 
     * @param args 
     */
    public setLangID(langID: string, ...args: any[]) {
        this.langArgs = args;
        this.langID = langID;
    }

    /**
     * 设置文本格式化参数
     * @param args 
     */
    public setLangFormat(...args: any[]) {
        this.langArgs = args;
        this.updateLang();
    }
}