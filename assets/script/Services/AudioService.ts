import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";
import { AudioClip, AudioSource, director, Node, log, resources, error } from "cc";

/**
 * 全局的声音服务
 *
 * @class AudioService
 */
@Singleton
export default class AudioService implements IService {

    public static readonly instance: AudioService

    //背景音
    private _bgmAudioSource: AudioSource;
    //特效音
    private _sfxAudioSource: AudioSource;

    private static readonly BGM_VOL_KEY = 'bgm_volume';
    private static readonly SFX_VOL_KEY = 'sfx_volume';

    private list = new Map<string, AudioClip>();

    private readonly audioPath = "audio";

    // 声音大小
    private bgmVolume: number = 1.0;
    private sfxVolume: number = 1.0;

    public async initialize() {
        await this.loadFolder();
        this.initVolume();
    }

    public async lazyInitialize() {

        //@zh 创建一个节点作为 bgmAudioMgr
        let bgmAudioMgr = new Node();
        let sfxAudioMgr = new Node();
        bgmAudioMgr.name = '__bgmAudioMgr__';
        sfxAudioMgr.name = '__sfxAudioMgr__';

        //@zh 添加节点到场景
        director.getScene().addChild(bgmAudioMgr);
        director.getScene().addChild(sfxAudioMgr);

        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        director.addPersistRootNode(bgmAudioMgr);
        director.addPersistRootNode(sfxAudioMgr);

        //@zh 添加 AudioSource 组件，用于播放音频。
        this._bgmAudioSource = bgmAudioMgr.addComponent(AudioSource);
        this._sfxAudioSource = sfxAudioMgr.addComponent(AudioSource);
    }

    public get bgmAudioSource() {
        return this._bgmAudioSource;
    }

    public get sfxAudioSource() {
        return this._sfxAudioSource;
    }

    /**
     * 从目录加载声音
     */
    public loadFolder() {
        return new Promise<void>((resolve, reject) => {
            resources.loadDir(this.audioPath, (err, resource) => {
                for (let index = 0; index < resource.length; index++) {
                    const audio = (resource as AudioClip[])[index];
                    this.register(audio.name, audio);
                }

                this.info();

                resolve();
            });
        })
    }

    /**
    * 初始化音量
    */
    public initVolume() {
        const bgmVol = app.platform.getPlatform().getArchive(AudioService.BGM_VOL_KEY);
        this.bgmVolume = parseFloat(bgmVol);
        if (isNaN(this.bgmVolume)) {
            this.bgmVolume = 1;
        }

        const sfxVol = app.platform.getPlatform().getArchive(AudioService.SFX_VOL_KEY);
        this.sfxVolume = parseFloat(sfxVol);
        if (isNaN(this.sfxVolume)) {
            this.sfxVolume = 1;
        }
    }

    /**
     * @en
     * play short audio, such as strikes,explosions
     * @zh
     * 播放短音频,比如 打击音效，爆炸音效等
     * @param sound clip or url for the audio
     * @param volume 
     */
    playSFX(sound: AudioClip | string, volume: number = 1.0) {

        if (!volume) {
            volume = this.sfxVolume;
        }

        if (sound instanceof AudioClip) {
            this._sfxAudioSource.playOneShot(sound, volume);
        } else if (this.list.has(sound)) {
            this._bgmAudioSource.playOneShot(this.list.get(sound), volume);
        } else {
            error(`播放的声音不存在!:${sound}`)
        }
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound clip or url for the sound
     * @param volume 
     */
    playBGM(sound: AudioClip | string, volume?: number) {

        if (!volume) {
            volume = this.bgmVolume;
        }

        this.bgmAudioSource.stop();

        if (sound instanceof AudioClip) {
            this._bgmAudioSource.clip = sound;
        } else if (this.list.has(sound)) {
            this._bgmAudioSource.clip = this.list.get(sound);
        } else {
            error(`播放的声音不存在!:${sound}`)
        }

        this._bgmAudioSource.loop = true;
        this._bgmAudioSource.volume = volume;
        this._bgmAudioSource.play();
    }

    register(name: string, audio: AudioClip) {
        if (!this.list.has(name)) {
            this.list.set(name, audio);
        }
    }

    unregister(name: string) {
        if (this.list.has(name)) {
            this.list.delete(name);
        }
    }

    /**
    * 获取音效音量
    */
    public getSFXVolume() {
        return this.sfxVolume;
    }

    /**
     * 获取背景音乐音量
     */
    public getBGMVolume() {
        return this.bgmVolume;
    }

    /**
    * 设置音效音量
    * @param vol 
    */
    public setSFXVolume(vol: number) {
        if (this.sfxVolume != vol) {
            app.platform.getPlatform().saveArchive(AudioService.SFX_VOL_KEY, vol.toString());
            this.sfxVolume = vol;
        }
    }

    /**
     * 设置背景音乐音量
     * @param vol 
     * @param force 
     */
    public setBGMVolume(vol: number) {
        if (this.bgmVolume != vol) {
            app.platform.getPlatform().saveArchive(AudioService.BGM_VOL_KEY, vol.toString());
            this.bgmVolume = vol;
            this._bgmAudioSource.volume = vol;
        }
    }

    /**
    * stop the audio play
    */
    stop() {
        this._bgmAudioSource.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this._bgmAudioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume() {
        this._bgmAudioSource.play();
    }

    /**
     * 暂停所有播放
    */
    public pauseAll() {
        this._bgmAudioSource.stop();
    }

    /**
     * 恢复所有播放
     */
    public resumeAll() {
        this._bgmAudioSource.play();
    }

    /**
     * 打印信息
     * @param name 
     */
    info(name?: string) {
        if (name) {
            if (this.list.has(name)) {
                log(name + ":", this.list.get(name));
            } else {
                log(`没有${name}声音`);
            }
        } else {
            let info = "声音信息:\n"
            if (this.list.size > 0) {
                this.list.forEach(
                    (value: AudioClip, key: string, map: Map<string, AudioClip>) => {
                        info += "   " + key + "    ✔" + "\n";
                    }
                );
            } else {
                info += "   没有注册声音";
            }
            log(info)
        }
    }
}