export default abstract class IBaseGame {

    abstract onGameEnter(): void

    abstract onGameExit(): void

    abstract onGamePause(): void

    abstract onGameResume(): void
}