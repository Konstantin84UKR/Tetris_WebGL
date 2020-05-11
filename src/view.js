export default class View {
    static color = {
        '1': 'cyan',
        '2': 'blue',
        '3': 'orange',
        '4': 'yellow',
        '5': 'green',
        '6': 'purple',
        '7': 'red'
    }

    constructor(element, width, heigh, rows, coloms) {
        this.element = element;
        this.width = width;
        this.heigh = heigh;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.heigh;
        this.context = this.canvas.getContext('2d');

        this.playfildBorderWidth = 4;
        this.playfildX = this.playfildBorderWidth + 1;
        this.playfildY = this.playfildBorderWidth + 1;
        this.playfildWidth = this.width * 2 / 3;
        this.playfildHeight = this.heigh;
        this.playfildInnerWidth = this.playfildWidth - (this.playfildBorderWidth * 2);
        this.playfildInnerHeight = this.playfildHeight - (this.playfildBorderWidth * 2) - 2;

        this.blockWidth = this.playfildInnerWidth / coloms;
        this.blockHeight = this.playfildInnerHeight / rows;

        this.panelX = this.playfildWidth + 10;
        this.panelY = 0;
        this.panelWidth = this.width / 3;
        this.panelHeight = this.heigh;


        this.element.appendChild(this.canvas);



    }

    renderMainScreen(state) {
        this.clearScreen();
        this.renderPlayfild(state);
        this.renderPanel(state);
    }

    clearScreen() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    renderStartScreen() {
        this.context.fillStyle = 'white';
        this.context.font = '18px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to Start', this.width / 2, this.heigh / 2);
    }

    renderPauseScreen() {

        this.context.fillStyle = 'rgba(0.0,0.0,0.0,0.75)';
        this.context.fillRect(0, 0, this.width, this.heigh);

        this.context.fillStyle = 'white';
        this.context.font = '18px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to Resume', this.width / 2, this.heigh / 2);
    }


    renderEndScreen({ score }) {

        this.clearScreen();
        this.context.fillStyle = 'white';
        this.context.font = '22px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('GAME OVER', this.width / 2, this.heigh / 2 - 96);
        this.context.font = '14px "Press Start 2P"';
        //this.context.fillText('Press ENTER to Resume', this.width / 2, this.heigh / 2 - 48);
        this.context.fillText(`Score: ${score} `, this.width / 2, this.heigh / 2 - 48);
        this.context.fillText('Press ENTER to Resume', this.width / 2, this.heigh / 2 + 24);
    }


    renderPlayfild({ playfield }) {

        for (let y = 0; y < playfield.length; y++) {
            const lines = playfield[y];

            for (let x = 0; x < lines.length; x++) {
                const block = lines[x];

                if (block) {
                    this.renderBlock(
                        (x * this.blockWidth) + this.playfildX,
                        (y * this.blockHeight) + this.playfildY,
                        this.blockWidth,
                        this.blockHeight, View.color[block]);
                }
            }

        }
    }

    renderPanel({ level, score, lines, nextPiece }) {
        this.context.textAlign = 'start';
        this.context.textBaseline = 'top';
        this.context.fillStyle = 'white';
        this.context.font = '14px "Press Start 2P"';

        this.context.fillText(`Score: ${score}`, this.panelX, this.panelY + 0);
        this.context.fillText(`Lines: ${lines}`, this.panelX, this.panelY + 24);
        this.context.fillText(`Level: ${level}`, this.panelX, this.panelY + 48);
        this.context.fillText('Next:', this.panelX, this.panelY + 96);

        for (let y = 0; y < nextPiece.blocks.length; y++) {
            for (let x = 0; x < nextPiece.blocks[y].length; x++) {
                const block = nextPiece.blocks[y][x];

                if (block) {
                    this.renderBlock(
                        this.panelX + (x * this.blockWidth * 0.5),
                        this.panelY + 115 + (y * this.blockHeight * 0.5),
                        this.blockWidth * 0.5,
                        this.blockHeight * 0.5,
                        View.color[block]
                    )
                }
            }

        }

        this.context.strokeStyle = 'white';
        this.context.lineWidth = this.playfildBorderWidth;
        this.context.strokeRect(
            this.playfildBorderWidth / 2,
            this.playfildBorderWidth / 2,
            this.playfildInnerWidth + this.playfildBorderWidth + 2,
            this.playfildInnerHeight + this.playfildBorderWidth + 2);

    }

    renderBlock(x, y, wigth, height, color) {
        this.context.fillStyle = color;
        this.context.strokeStyle = 'black';

        this.context.lineWidth = 2;

        this.context.strokeRect(x, y, wigth, height);
        this.context.fillRect(x, y, wigth, height);
    }

}