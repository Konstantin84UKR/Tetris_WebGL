import * as Matrix from './gl-matrix.js';
import MouseController from './MouseController.js';

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

    static colorWebGL = {
        '1': [0.0, 1.0, 1.0],
        '2': [0.0, 0.0, 1.0],
        '3': [1.0, 0.5, 0.0],
        '4': [1.0, 1.0, 0.0],
        '5': [0.0, 1.0, 0.0],
        '6': [0.5, 0.0, 0.5],
        '7': [1.0, 0.0, 0.0]
    }

    constructor(element, width, heigh, rows, coloms) {
        this.element = element;
        this.width = width;
        this.heigh = heigh;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.heigh;
        this.context = this.canvas.getContext('2d');

        this.canvasWebGL = document.createElement('canvas');
        this.canvasWebGL.width = this.width;
        this.canvasWebGL.height = this.heigh;
        this.gl = this.canvasWebGL.getContext("webgl", { antialias: false });


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


        // this.element.appendChild(this.canvas);
        this.element.appendChild(this.canvasWebGL);

        this.mouseController = new MouseController(this.gl);
        this.AMORTIZATION = 0.8;

        this.loadJSON(this.gl, 'res/Box2.json');
        this.ModelMain = this.loadBuffer(this.gl, this.gl.model.meshes[0]);

        //this.shaderProgram = this.createPromiseShaderProgram(this.gl, './res/shaders/vs.glsl', './res/shaders/fs.glsl');
        // this.gl.useProgram(this.shaderProgram);
        this.preRender()
    }

    renderMainScreen(state) {
        this.clearScreen();
        this.renderPlayfild(state);
        // this.renderPlayfild_WebGl(state);
        this.renderPanel(state);
    }

    clearScreen() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let info = document.querySelector('#info1');
        info.innerHTML = '';
        let info2 = document.querySelector('#info2');
        info2.innerHTML = '';
        let info3 = document.querySelector('#info3');
        info3.innerHTML = '';
    }


    renderStartScreen() {
        this.context.fillStyle = 'white';
        this.context.font = '18px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to Start', this.width / 2, this.heigh / 2);

        let info = document.querySelector('#info1');
        info.innerHTML = 'Press ENTER to Start';
        let info2 = document.querySelector('#info2');
        info2.innerHTML = '';
        let info3 = document.querySelector('#info3');
        info3.innerHTML = '';
    }

    renderPauseScreen() {

        this.context.fillStyle = 'rgba(0.0,0.0,0.0,0.75)';
        this.context.fillRect(0, 0, this.width, this.heigh);

        this.context.fillStyle = 'white';
        this.context.font = '18px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to Resume', this.width / 2, this.heigh / 2);

        let info = document.querySelector('#info1');
        info.innerHTML = 'Press ENTER to Resume';
        let info2 = document.querySelector('#info2');
        info2.innerHTML = '';
        let info3 = document.querySelector('#info3');
        info3.innerHTML = '';
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

        let info = document.querySelector('#info1');
        info.innerHTML = 'GAME OVER';
        let info2 = document.querySelector('#info2');
        info2.innerHTML = '';
        let info3 = document.querySelector('#info3');
        info3.innerHTML = 'Press ENTER to Resume';
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

    async renderPlayfild_WebGl({ playfield }) {

        glMatrix.mat4.identity(this.MODELMATRIX_2);

        glMatrix.mat4.rotateX(this.MODELMATRIX_2, this.MODELMATRIX_2, Math.sin(Date.now() * 0.0001) * 0.1);
        glMatrix.mat4.rotateY(this.MODELMATRIX_2, this.MODELMATRIX_2, Math.sin(Date.now() * 0.0001) * 0.2);

        this.gl.useProgram(this.shaderProgram);

        this.gl.enableVertexAttribArray(this.shaderProgram.a_Position);
        this.gl.enableVertexAttribArray(this.shaderProgram.a_normal);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearDepth(1.0);

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT || this.gl.DEPTH_BUFFER_BIT);

        this.gl.uniformMatrix4fv(this.shaderProgram.u_Pmatrix, false, this.PROJMATRIX);
        this.gl.uniformMatrix4fv(this.shaderProgram.u_Vmatrix, false, this.VIEWMATRIX);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ModelMain.TRIANGLE_VERTEX);
        this.gl.vertexAttribPointer(this.shaderProgram.a_Position, 3, this.gl.FLOAT, false, 4 * (3), 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ModelMain.TRIANGLE_NORMAL);
        this.gl.vertexAttribPointer(this.shaderProgram.a_normal, 3, this.gl.FLOAT, false, 4 * (3), 0);


        //DROW row 
        for (let row = 0; row < 20; row++) {

            glMatrix.mat4.identity(this.MODELMATRIX);
            glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [-6.0, row, 0.0]);
            glMatrix.mat4.multiply(this.MODELMATRIX, this.MODELMATRIX_2, this.MODELMATRIX);
            this.gl.uniformMatrix4fv(this.shaderProgram.u_Mmatrix, false, this.MODELMATRIX);
            this.gl.uniform3fv(this.shaderProgram.u_color, [0.5, 0.5, 0.5]);
            this.gl.drawElements(this.gl.TRIANGLES, this.ModelMain.ModelIndiceslength, this.gl.UNSIGNED_SHORT, 0);

            glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [11.0, 0.0, 0.0]);
            this.gl.uniformMatrix4fv(this.shaderProgram.u_Mmatrix, false, this.MODELMATRIX);
            this.gl.drawElements(this.gl.TRIANGLES, this.ModelMain.ModelIndiceslength, this.gl.UNSIGNED_SHORT, 0);

        }
        //DROW coloms
        for (let coloms = 0; coloms < 12; coloms++) {
            glMatrix.mat4.identity(this.MODELMATRIX);

            glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [coloms - 6, -1.0, 0.0]);
            glMatrix.mat4.multiply(this.MODELMATRIX, this.MODELMATRIX_2, this.MODELMATRIX);
            this.gl.uniformMatrix4fv(this.shaderProgram.u_Mmatrix, false, this.MODELMATRIX);
            this.gl.drawElements(this.gl.TRIANGLES, this.ModelMain.ModelIndiceslength, this.gl.UNSIGNED_SHORT, 0);

            glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [0.0, 21.0, 0.0]);
            this.gl.uniformMatrix4fv(this.shaderProgram.u_Mmatrix, false, this.MODELMATRIX);
            this.gl.drawElements(this.gl.TRIANGLES, this.ModelMain.ModelIndiceslength, this.gl.UNSIGNED_SHORT, 0);

        }


        for (let y = 0; y < playfield.length; y++) {
            const lines = playfield[y];

            for (let x = 0; x < lines.length; x++) {
                const block = lines[x];

                if (block) {

                    let y_invert = 19 - y;

                    glMatrix.mat4.identity(this.MODELMATRIX);
                    glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [-5.0, 0., 0.0]);
                    glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [x, y_invert, 0.0]);
                    glMatrix.mat4.multiply(this.MODELMATRIX, this.MODELMATRIX_2, this.MODELMATRIX);

                    this.gl.uniformMatrix4fv(this.shaderProgram.u_Mmatrix, false, this.MODELMATRIX);
                    this.gl.uniform3fv(this.shaderProgram.u_color, View.colorWebGL[block]);

                    this.gl.drawElements(this.gl.TRIANGLES, this.ModelMain.ModelIndiceslength, this.gl.UNSIGNED_SHORT, 0);


                }
            }

        }

    }


    getShader(id, str) {


        var shader;
        if (id == 'vs') {
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);

        } else if (id == 'fs') {
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        } else {
            return null;
        }

        this.gl.shaderSource(shader, str);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;

    }

    getShader(gl, id, str) {

        var shader;
        if (id == 'vs') {
            shader = gl.createShader(gl.VERTEX_SHADER);

        } else if (id == 'fs') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            return null;
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;

    }

    getProgram(gl, vShader, fShader) {

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vShader);
        gl.attachShader(shaderProgram, fShader);
        gl.linkProgram(shaderProgram);
        //gl.useProgram(shaderProgram);

        return shaderProgram;

    }

    async createDomShaderProgram(gl, vectId, fragId) {

        var vShaderTxt = document.getElementById(vectId).text; if (!vShaderTxt) return null;
        var fShaderTxt = document.getElementById(fragId).text; if (!fShaderTxt) return null;
        var vShader = this.getShader(gl, 'vs', vShaderTxt); if (!vShader) return null;
        var fShader = this.getShader(gl, 'fs', fShaderTxt); if (!fShader) return null;

        if (!fShader) { gl.deleteShader(vShader); return null; }

        var shaderProgram = getProgram(gl, vShader, fShader);

        return shaderProgram;
    }

    //--- Promise ---//
    async LoadShaderTextUsingPromise(URL) {

        let promise = new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', URL, true);
            xhr.onload = () => resolve(xhr.responseText);
            xhr.onerror = () => resolve(console.log(xhr.statusText));
            xhr.send();
        });

        return promise;
    }

    async createPromiseShaderProgram(gl, URL_vs, URL_fs) {

        let vertex_shader_promise = await this.LoadShaderTextUsingPromise(URL_vs);
        let fragment_shader_promise = await this.LoadShaderTextUsingPromise(URL_fs);

        let shaderProgram = await Promise.all([vertex_shader_promise,
            fragment_shader_promise
        ]).then(data => {

            let vShaderTxt = data[0];
            let fShaderTxt = data[1];
            let vShader = this.getShader(gl, 'vs', vShaderTxt); if (!vShader) return null;
            let fShader = this.getShader(gl, 'fs', fShaderTxt); if (!fShader) return null;

            if (!fShader) { gl.deleteShader(vShader); return null; }
            let shaderProgram = this.getProgram(gl, vShader, fShader);
            return shaderProgram;

        }).catch(e => console.log(e));

        return shaderProgram;
    }

    async loadJSON(gl, modelURL) {
        var xhr = new XMLHttpRequest();
        var model;

        xhr.open('GET', modelURL, false);
        xhr.onload = function () {
            if (xhr.status != 200) {

                alert('LOAD' + xhr.status + ': ' + xhr.statusText);
            } else {

                gl.model = JSON.parse(xhr.responseText);
                // model = JSON.parse(xhr.responseText);
                // return true;
            }
        }
        xhr.send();
    }


    loadBuffer(gl, meshes) {

        let modelbuffer = {

            TRIANGLE_VERTEX: 0,
            TRIANGLE_UV: 0,
            TRIANGLE_NORMAL: 0,
            TRIANGLE_TANGENT: 0,
            TRIANGLE_BITANGENT: 0,
            TRIANGLE_FACES: 0,
            ModelIndiceslength: 0,
        };

        let ModelVertices = meshes.vertices;
        let ModelIndices = [].concat.apply([], meshes.faces);
        let ModelTexCoords = meshes.texturecoords[0];
        let ModelNormal = meshes.normals;
        let ModelTangent = meshes.tangents;
        let ModelBiTangent = meshes.bitangents;
        modelbuffer.ModelIndiceslength = ModelIndices.length;

        modelbuffer.TRIANGLE_VERTEX = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_VERTEX);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelVertices), gl.DYNAMIC_DRAW);

        // modelbuffer.TRIANGLE_VERTEX = TRIANGLE_VERTEX;

        modelbuffer.TRIANGLE_UV = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_UV);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelTexCoords), gl.DYNAMIC_DRAW);

        modelbuffer.TRIANGLE_NORMAL = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_NORMAL);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelNormal), gl.DYNAMIC_DRAW);

        modelbuffer.TRIANGLE_TANGENT = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_TANGENT);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelTangent), gl.DYNAMIC_DRAW);

        modelbuffer.TRIANGLE_BITANGENT = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_BITANGENT);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelBiTangent), gl.DYNAMIC_DRAW);

        modelbuffer.TRIANGLE_FACES = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelbuffer.TRIANGLE_FACES);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ModelIndices), gl.DYNAMIC_DRAW);

        gl.modelbufferPlane = modelbuffer;
        return modelbuffer;

    }

    async preRender() {

        this.shaderProgram = await this.createPromiseShaderProgram(this.gl, './res/shaders/vs.glsl', './res/shaders/fs.glsl');

        this.MODELMATRIX = glMatrix.mat4.create();
        glMatrix.mat4.identity(this.MODELMATRIX);

        this.MODELMATRIX_2 = glMatrix.mat4.create();
        glMatrix.mat4.identity(this.MODELMATRIX_2);

        this.VIEWMATRIX = glMatrix.mat4.create();
        glMatrix.mat4.identity(this.VIEWMATRIX);
        glMatrix.mat4.lookAt(this.VIEWMATRIX, [-5.0, 15.0, 40.0], [-1.0, 10.0, 0.0], [0.0, 1.0, 0.0]);

        this.PROJMATRIX = glMatrix.mat4.create();
        glMatrix.mat4.identity(this.PROJMATRIX);
        let fovy = 40 * Math.PI / 180;
        glMatrix.mat4.perspective(this.PROJMATRIX, fovy, this.canvasWebGL.width / this.canvasWebGL.height, 1, 150);

        this.shaderProgram.a_Position = this.gl.getAttribLocation(this.shaderProgram, 'a_position');
        this.shaderProgram.a_normal = this.gl.getAttribLocation(this.shaderProgram, 'a_normal');

        this.shaderProgram.u_Pmatrix = this.gl.getUniformLocation(this.shaderProgram, 'u_Pmatrix');
        this.shaderProgram.u_Mmatrix = this.gl.getUniformLocation(this.shaderProgram, 'u_Mmatrix');
        this.shaderProgram.u_Vmatrix = this.gl.getUniformLocation(this.shaderProgram, 'u_Vmatrix');
        this.shaderProgram.u_color = this.gl.getUniformLocation(this.shaderProgram, 'u_color');

    }
}