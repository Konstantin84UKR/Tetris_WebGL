export default class Controller {


    constructor(game, view, viewWebGL) {

        this.game = game;
        this.view = view;
        this.viewWebGL = viewWebGL;
        this.isPlaying = false;
        this.gameLoopID = null;
        this.intervalID = null;
        // this.intervalID = setInterval(() => {
        //     this.update();
        // }, 1000);

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.view.renderStartScreen();
        this.play();
    }

    update() {

        game.movePieceDown();
        this.updateView();
    }

    play() {
        this.isPlaying = true;
        this.startTimer();
        this.updateView();
        this.gameLoop(this);

    }

    pause() {
        this.isPlaying = false;
        this.stopTimer();
        this.updateView();
        // this.gameLoop(this);
    }

    startTimer() {

        const speed = 1000 - this.game.getState().level * 100;

        if (!this.intervalID) {
            this.intervalID = setInterval(() => {
                this.update();
            }, speed > 0 ? speed : 100);
        }
    }

    stopTimer() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    updateView() {
        const state = this.game.getState();

        if (state.isGameOwer) {
            this.view.renderEndScreen(state);
            this.isPlaying = false;
        }

        else if (!this.isPlaying) {
            this.view.renderPauseScreen(state);
        }
        else {
            this.view.renderMainScreen(state);
            //  this.view.renderPlayfild_WebGl(state);
        }
    }

    reset() {
        this.game.reset();
        this.play();
    }

    handleKeyDown(event) {
        const state = this.game.getState();

        switch (event.keyCode) {
            case 13: // ENTER 
                if (state.isGameOwer) {
                    this.reset();
                }
                else if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }

                break;
            case 37:
                this.game.movePieceLeft();
                this.updateView();
                break;
            case 38:
                this.game.rotatePiece();
                //this.view.renderMainScreen(state);
                this.updateView();
                break;
            case 39:
                this.game.movePieceRight();
                //this.view.renderMainScreen(state);
                this.updateView();
                break;
            case 40:
                this.game.movePieceDown();
                //  this.view.renderMainScreen(state);
                this.updateView();
                break;


        }
    }



    gameLoop(thisRL) {

        let dt = 0;
        let old_time = 0;

        const animate = function (time) {
            if (!old_time) old_time = time;
            if (Math.abs(time - old_time) >= 1000 / 30) {
                //update();
                const stateForWebGL = thisRL.game.getState();
                thisRL.viewWebGL.renderPlayfild_WebGl(stateForWebGL);
                old_time = time;
            }
            if (thisRL.isPlaying == false) {
                return 0;
            }
            window.requestAnimationFrame(animate);
        }
        animate(0);
    }


}