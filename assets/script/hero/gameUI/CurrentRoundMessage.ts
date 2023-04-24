import { _decorator, Component, Node, find, instantiate, Label, ScrollView } from 'cc';
import { em } from '../../global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('CurrentRoundMessage')
export class CurrentRoundMessage extends Component {

    _messagePrefab;
    _messagePar;
    onDestroy() {
        em.remove("sendRoundMessage");
    }
    onLoad() {
        em.add("sendRoundMessage", this.sendRoundMessage.bind(this));
        this._messagePrefab = find("Label", this.node);
        this._messagePar = find("ScrollView/view/content", this.node);
    }
    // 发送回合信息
    sendRoundMessage(string:string) {
        // console.log("sendRoundMessage",string);
        let message = instantiate(this._messagePrefab);
        message.parent = this._messagePar;
        message.getComponent(Label).string = string;
        this._messagePar.parent.parent.getComponent(ScrollView).scrollToBottom(1);
        message.active = true;
    }
}

