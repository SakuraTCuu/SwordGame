import Singleton from "../../../Decorators/Singleton";

@Singleton
export default class MonsterManagerTemp {
    public static readonly instance: MonsterManagerTemp;

    //怪物数量
    private _monsterCount: number = 0;

    //精英怪数量
    private _monsterLeaderCount: number = 0;


    public getMonsterCount() {
        return this._monsterCount;
    }

    createMonster() {

    }

}