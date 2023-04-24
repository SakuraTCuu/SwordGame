import { _decorator, Component, Node, Label } from 'cc';
import { em } from './EventManager';
import { ggd } from './globalData';
const { ccclass, property } = _decorator;

@ccclass('VersionNotice')
export class VersionNotice extends Component {
    @property(Label)
    title;
    @property(Label)
    des;

    _title: string = "更新内容";
    _content: string = "";
    onLoad() {
        em.add("openVersionNotice", this.openVersionNotice.bind(this));
        this._title = ggd.versionCode + "更新内容";
        this._content += "1.修复bug。\n";
    }
    onDestroy() {
        em.remove("openVersionNotice");
    }
    openVersionNotice() {
        this.title.string = this._title;
        this.des.string = this._content;
        this.node.active = true;
    }
    closeVersionNotice() {
        this.node.active = false;
    }
}


