import { _decorator, Component, Node, Label } from 'cc';
import { em } from '../Common/EventManager';
import { Constant } from '../Common/Constant';
const { ccclass, property } = _decorator;

@ccclass('VersionNotice')
export class VersionNotice extends Component {
    
    @property(Label)
    title: Label = null;

    @property(Label)
    des: Label = null;

    _title: string = "更新内容";
    _content: string = "";
    onLoad() {
        em.add("openVersionNotice", this.openVersionNotice.bind(this));
        this._title = Constant.GlobalGameData.versionCode + "更新内容";
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


