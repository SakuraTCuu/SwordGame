import { _decorator, Component, Node, game, AudioSource, AudioClip, input, Input, director } from 'cc';
import { em } from '../global/EventManager';
import { EventId } from '../global/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    @property(AudioClip)
    mainBGM: AudioClip;
    @property(AudioSource)
    bgmPlayer;
    @property(AudioSource)
    effectPlayer: AudioClip = null;

    onDestroy() {
        em.remove("switchMainBgm");
        em.remove("playOneShot");
        em.remove("muteAudio");
        em.remove("resumeAudio");
    }
    onLoad() {
        em.add("switchMainBgm", this.switchMainBgm.bind(this));
        em.add("playOneShot", this.playOneShot.bind(this));
        em.add("muteAudio", this.muteAudio.bind(this));
        em.add("resumeAudio", this.resumeAudio.bind(this));
        director.addPersistRootNode(this.node);//背包物品在各个场景皆可用到 设置为常驻节点
    }

    start() {
        this.switchMainBgm("/audio/music/刀剑如梦");
    }

    // 切换bgm
    switchMainBgm(url) {
        this.bgmPlayer.stop();

        app.loader.load('resources', url, (err, clip) => {
            if (err) {
                console.log(err);
                return;
            }
            this.bgmPlayer.clip = clip;
            this.bgmPlayer.play();
        });
  
    }
    //播放音效
    playOneShot(url) {
        let path = "/audio/effect/" + url;
        app.loader.load('resources', path, (err, clip) => {
            if (err) {
                console.log(err);
                return;
            }
            this.effectPlayer.playOneShot(clip);
        });
      
    }
    //静音
    muteAudio() {
        // this.effectPlayer.mute = false;
        this.bgmPlayer.mute = false;
    }
    //恢复音效
    resumeAudio() {
        // this.effectPlayer.mute = true;
        this.bgmPlayer.mute = true;
    }
}

