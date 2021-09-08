import * as Matrix from "./gl-matrix.js";
import MouseController from "./MouseController.js";

////

const CubeData = () => {
  const positions = new Float32Array([
    // front
    -1, -1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1,

    // right
    1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,

    // back
    -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1,

    // left
    -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, 1,

    // top
    -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, -1, -1, 1, 1,

    // bottom
    -1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
  ]);

  const colors = new Float32Array([
    // front - blue
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    // right - red
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    //back - yellow
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,

    //left - aqua
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,

    // top - green
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

    // bottom - fuchsia
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  ]);

  const normals = new Float32Array([
    // front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    // right
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    // back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

    // left
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

    // top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

    // bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
  ]);

  return {
    positions,
    colors,
    normals,
  };
};

const Shaders = () => {
  let li = {};
  // define default input values:
  li.color = "(1.0, 0.0, 0.0)";
  li.ambientIntensity = "0.2";
  li.diffuseIntensity = "0.8";
  li.specularIntensity = "0.4";
  li.shininess = "30.0";
  li.specularColor = "(1.0, 1.0, 1.0)";
  li.isPhong = "0";

  const vertex =
    //`
    //         [[block]] struct Uniforms {
    //             viewProjectionMatrix : mat4x4<f32>;
    //             modelMatrix : mat4x4<f32>;
    //             normalMatrix : mat4x4<f32>;
    //         };
    //         [[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

    //         struct Output {
    //             [[builtin(position)]] Position : vec4<f32>;
    //             [[location(0)]] vPosition : vec4<f32>;
    //             [[location(1)]] vNormal : vec4<f32>;
    //         };

    //         [[stage(vertex)]]
    //         fn main([[location(0)]] position: vec4<f32>, [[location(1)]] normal: vec4<f32>) -> Output {
    //             var output: Output;
    //             let mPosition:vec4<f32> = uniforms.modelMatrix * position;
    //             output.vPosition = mPosition;
    //             output.vNormal =  uniforms.normalMatrix*normal;
    //             output.Position = uniforms.viewProjectionMatrix * mPosition;
    //             return output;
    //         }`;
    `[[stage(vertex)]]
        fn main([[builtin(vertex_index)]] VertexIndex : u32)
             -> [[builtin(position)]] vec4<f32> {
          var pos = array<vec2<f32>, 3>(
              vec2<f32>(0.0, 0.5),
              vec2<f32>(-0.5, -0.5),
              vec2<f32>(0.5, -0.5));
        
          return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
        }`;

  const fragment =
    //    `
    //         [[block]] struct Uniforms {
    //             lightPosition : vec4<f32>;
    //             eyePosition : vec4<f32>;
    //         };
    //         [[binding(1), group(0)]] var<uniform> uniforms : Uniforms;

    //         [[stage(fragment)]]
    //         fn main([[location(0)]] vPosition: vec4<f32>, [[location(1)]] vNormal: vec4<f32>) ->  [[location(0)]] vec4<f32> {
    //             let N:vec3<f32> = normalize(vNormal.xyz);
    //             let L:vec3<f32> = normalize(uniforms.lightPosition.xyz - vPosition.xyz);
    //             let V:vec3<f32> = normalize(uniforms.eyePosition.xyz - vPosition.xyz);
    //             let H:vec3<f32> = normalize(L + V);
    //             let diffuse:f32 = ${li.diffuseIntensity} * max(dot(N, L), 0.0);
    //             var specular:f32;
    //             var isp:i32 = ${li.isPhong};
    //             if(isp == 1){
    //                 specular = ${li.specularIntensity} * pow(max(dot(V, reflect(-L, N)),0.0), ${li.shininess});
    //             } else {
    //                 specular = ${li.specularIntensity} * pow(max(dot(N, H),0.0), ${li.shininess});
    //             }
    //             let ambient:f32 = ${li.ambientIntensity};
    //             let finalColor:vec3<f32> = vec3<f32>${li.color}*(ambient + diffuse) + vec3<f32>${li.specularColor}*specular;
    //             return vec4<f32>(finalColor, 1.0);
    //         }`;
    `[[stage(fragment)]]
fn main() -> [[location(0)]] vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}`;

  return {
    vertex,
    fragment,
  };
};
////

export default class View {
  static color = {
    1: "cyan",
    2: "blue",
    3: "orange",
    4: "yellow",
    5: "green",
    6: "purple",
    7: "red",
  };

  static colorWebGL = {
    1: [0.0, 1.0, 1.0],
    2: [0.0, 0.0, 1.0],
    3: [1.0, 0.5, 0.0],
    4: [1.0, 1.0, 0.0],
    5: [0.0, 1.0, 0.0],
    6: [0.5, 0.0, 0.5],
    7: [1.0, 0.0, 0.0],
  };

  constructor(element, width, heigh, rows, coloms) {
    this.element = element;
    this.width = width;
    this.heigh = heigh;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.heigh;
    this.context = this.canvas.getContext("2d");

    this.canvasWebGL = document.createElement("canvas");
    this.canvasWebGL.width = this.width;
    this.canvasWebGL.height = this.heigh;
    this.ctxWebGPU = this.canvasWebGL.getContext("webgpu", {
      antialias: false,
    });
    this.isWebGPU = this.CheckWebGPU();

    this.playfildBorderWidth = 4;
    this.playfildX = this.playfildBorderWidth + 1;
    this.playfildY = this.playfildBorderWidth + 1;
    this.playfildWidth = (this.width * 2) / 3;
    this.playfildHeight = this.heigh;
    this.playfildInnerWidth = this.playfildWidth - this.playfildBorderWidth * 2;
    this.playfildInnerHeight =
      this.playfildHeight - this.playfildBorderWidth * 2 - 2;

    this.blockWidth = this.playfildInnerWidth / coloms;
    this.blockHeight = this.playfildInnerHeight / rows;

    this.panelX = this.playfildWidth + 10;
    this.panelY = 0;
    this.panelWidth = this.width / 3;
    this.panelHeight = this.heigh;

    // this.element.appendChild(this.canvas);
    this.element.appendChild(this.canvasWebGL);

    // this.mouseController = new MouseController(this.gl);
    // this.AMORTIZATION = 0.8;

    // this.loadJSON(this.gl, "res/Box2.json");
    // this.ModelMain = this.loadBuffer(this.gl, this.gl.model.meshes[0]);

    //this.shaderProgram = this.createPromiseShaderProgram(this.gl, './res/shaders/vs.glsl', './res/shaders/fs.glsl');
    // this.gl.useProgram(this.shaderProgram);
    this.preRender();
  }

  renderMainScreen(state) {
    this.clearScreen(state);
    this.renderPlayfild(state);
    // this.renderPlayfild_WebGl(state);
    this.renderPanel(state);
  }

  clearScreen({ lines, score }) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let info = document.querySelector("#info1");
    info.innerHTML = "Line :" + lines + " Score :" + score;
    let info2 = document.querySelector("#info2");
    info2.innerHTML = "-----------------------------";
    let info3 = document.querySelector("#info3");
    info3.innerHTML = "https://github.com/Konstantin84UKR/Tetris_WebGL";
  }

  renderStartScreen() {
    this.context.fillStyle = "white";
    this.context.font = '10px "Press Start 2P"';
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(
      "Press ENTER to Start",
      this.width / 2,
      this.heigh / 2
    );

    let info = document.querySelector("#info1");
    info.innerHTML = "Press ENTER to Start";
    let info2 = document.querySelector("#info2");
    info2.innerHTML = "-----------------------------";
    let info3 = document.querySelector("#info3");
    info3.innerHTML = "https://github.com/Konstantin84UKR/Tetris_WebGL";
  }

  renderPauseScreen() {
    this.context.fillStyle = "rgba(0.0,0.0,0.0,0.75)";
    this.context.fillRect(0, 0, this.width, this.heigh);

    this.context.fillStyle = "white";
    this.context.font = '10px "Press Start 2P"';
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(
      "Press ENTER to Resume",
      this.width / 2,
      this.heigh / 2
    );

    let info = document.querySelector("#info1");
    info.innerHTML = "Press ENTER to Resume";
    let info2 = document.querySelector("#info2");
    info2.innerHTML = "-----------------------------";
    let info3 = document.querySelector("#info3");
    info3.innerHTML = "https://github.com/Konstantin84UKR/Tetris_WebGL";
  }

  renderEndScreen({ score }) {
    //this.clearScreen();
    this.context.fillStyle = "white";
    this.context.font = '10px "Press Start 2P"';
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText("GAME OVER", this.width / 2, this.heigh / 2 - 96);
    this.context.font = '10px "Press Start 2P"';
    //this.context.fillText('Press ENTER to Resume', this.width / 2, this.heigh / 2 - 48);
    this.context.fillText(
      `Score: ${score} `,
      this.width / 2,
      this.heigh / 2 - 48
    );
    this.context.fillText(
      "Press ENTER to Resume",
      this.width / 2,
      this.heigh / 2 + 24
    );

    let info = document.querySelector("#info1");
    info.innerHTML = "GAME OVER  Score :" + score;
    let info2 = document.querySelector("#info2");
    info2.innerHTML = "Press ENTER to Resume";
    let info3 = document.querySelector("#info3");
    info3.innerHTML = "https://github.com/Konstantin84UKR/Tetris_WebGL";
  }

  renderPlayfild({ playfield }) {
    for (let y = 0; y < playfield.length; y++) {
      const lines = playfield[y];

      for (let x = 0; x < lines.length; x++) {
        const block = lines[x];

        if (block) {
          this.renderBlock(
            x * this.blockWidth + this.playfildX,
            y * this.blockHeight + this.playfildY,
            this.blockWidth,
            this.blockHeight,
            View.color[block]
          );
        }
      }
    }
  }

  renderPanel({ level, score, lines, nextPiece }) {
    this.context.textAlign = "start";
    this.context.textBaseline = "top";
    this.context.fillStyle = "white";
    this.context.font = '10px "Press Start 2P"';

    this.context.fillText(`Score: ${score}`, this.panelX, this.panelY + 0);
    this.context.fillText(`Lines: ${lines}`, this.panelX, this.panelY + 24);
    this.context.fillText(`Level: ${level}`, this.panelX, this.panelY + 48);
    this.context.fillText("Next:", this.panelX, this.panelY + 96);

    for (let y = 0; y < nextPiece.blocks.length; y++) {
      for (let x = 0; x < nextPiece.blocks[y].length; x++) {
        const block = nextPiece.blocks[y][x];

        if (block) {
          this.renderBlock(
            this.panelX + x * this.blockWidth * 0.5,
            this.panelY + 115 + y * this.blockHeight * 0.5,
            this.blockWidth * 0.5,
            this.blockHeight * 0.5,
            View.color[block]
          );
        }
      }
    }

    this.context.strokeStyle = "white";
    this.context.lineWidth = this.playfildBorderWidth;
    this.context.strokeRect(
      this.playfildBorderWidth / 2,
      this.playfildBorderWidth / 2,
      this.playfildInnerWidth + this.playfildBorderWidth + 2,
      this.playfildInnerHeight + this.playfildBorderWidth + 2
    );
  }

  renderBlock(x, y, wigth, height, color) {
    this.context.fillStyle = color;
    this.context.strokeStyle = "black";

    this.context.lineWidth = 2;

    this.context.strokeRect(x, y, wigth, height);
    this.context.fillRect(x, y, wigth, height);
  }

  async renderPlayfild_WebGl({ playfield }) {
    glMatrix.mat4.identity(this.MODELMATRIX_2);

    glMatrix.mat4.rotateX(
      this.MODELMATRIX_2,
      this.MODELMATRIX_2,
      Math.sin(Date.now() * 0.0001) * 0.1
    );
    glMatrix.mat4.rotateY(
      this.MODELMATRIX_2,
      this.MODELMATRIX_2,
      Math.sin(Date.now() * 0.0001) * 0.2
    );

    this.gl.useProgram(this.shaderProgram);

    this.gl.enableVertexAttribArray(this.shaderProgram.a_Position);
    this.gl.enableVertexAttribArray(this.shaderProgram.a_normal);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clearDepth(1.0);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT || this.gl.DEPTH_BUFFER_BIT);

    this.gl.uniformMatrix4fv(
      this.shaderProgram.u_Pmatrix,
      false,
      this.PROJMATRIX
    );
    this.gl.uniformMatrix4fv(
      this.shaderProgram.u_Vmatrix,
      false,
      this.VIEWMATRIX
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ModelMain.TRIANGLE_VERTEX);
    this.gl.vertexAttribPointer(
      this.shaderProgram.a_Position,
      3,
      this.gl.FLOAT,
      false,
      4 * 3,
      0
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ModelMain.TRIANGLE_NORMAL);
    this.gl.vertexAttribPointer(
      this.shaderProgram.a_normal,
      3,
      this.gl.FLOAT,
      false,
      4 * 3,
      0
    );

    //DROW row
    for (let row = 0; row < 20; row++) {
      glMatrix.mat4.identity(this.MODELMATRIX);
      glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [
        -6.0,
        row,
        0.0,
      ]);
      glMatrix.mat4.multiply(
        this.MODELMATRIX,
        this.MODELMATRIX_2,
        this.MODELMATRIX
      );
      this.gl.uniformMatrix4fv(
        this.shaderProgram.u_Mmatrix,
        false,
        this.MODELMATRIX
      );
      this.gl.uniform3fv(this.shaderProgram.u_color, [0.5, 0.5, 0.5]);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.ModelMain.ModelIndiceslength,
        this.gl.UNSIGNED_SHORT,
        0
      );

      glMatrix.mat4.translate(
        this.MODELMATRIX,
        this.MODELMATRIX,
        [11.0, 0.0, 0.0]
      );
      this.gl.uniformMatrix4fv(
        this.shaderProgram.u_Mmatrix,
        false,
        this.MODELMATRIX
      );
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.ModelMain.ModelIndiceslength,
        this.gl.UNSIGNED_SHORT,
        0
      );
    }
    //DROW coloms
    for (let coloms = 0; coloms < 12; coloms++) {
      glMatrix.mat4.identity(this.MODELMATRIX);

      glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [
        coloms - 6,
        -1.0,
        0.0,
      ]);
      glMatrix.mat4.multiply(
        this.MODELMATRIX,
        this.MODELMATRIX_2,
        this.MODELMATRIX
      );
      this.gl.uniformMatrix4fv(
        this.shaderProgram.u_Mmatrix,
        false,
        this.MODELMATRIX
      );
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.ModelMain.ModelIndiceslength,
        this.gl.UNSIGNED_SHORT,
        0
      );

      glMatrix.mat4.translate(
        this.MODELMATRIX,
        this.MODELMATRIX,
        [0.0, 21.0, 0.0]
      );
      this.gl.uniformMatrix4fv(
        this.shaderProgram.u_Mmatrix,
        false,
        this.MODELMATRIX
      );
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.ModelMain.ModelIndiceslength,
        this.gl.UNSIGNED_SHORT,
        0
      );
    }

    for (let y = 0; y < playfield.length; y++) {
      const lines = playfield[y];

      for (let x = 0; x < lines.length; x++) {
        const block = lines[x];

        if (block) {
          let y_invert = 19 - y;

          glMatrix.mat4.identity(this.MODELMATRIX);
          glMatrix.mat4.translate(
            this.MODELMATRIX,
            this.MODELMATRIX,
            [-5.0, 0, 0.0]
          );
          glMatrix.mat4.translate(this.MODELMATRIX, this.MODELMATRIX, [
            x,
            y_invert,
            0.0,
          ]);
          glMatrix.mat4.multiply(
            this.MODELMATRIX,
            this.MODELMATRIX_2,
            this.MODELMATRIX
          );

          this.gl.uniformMatrix4fv(
            this.shaderProgram.u_Mmatrix,
            false,
            this.MODELMATRIX
          );
          this.gl.uniform3fv(
            this.shaderProgram.u_color,
            View.colorWebGL[block]
          );

          this.gl.drawElements(
            this.gl.TRIANGLES,
            this.ModelMain.ModelIndiceslength,
            this.gl.UNSIGNED_SHORT,
            0
          );
        }
      }
    }
  }

  getShader(id, str) {
    var shader;
    if (id == "vs") {
      shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    } else if (id == "fs") {
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
    if (id == "vs") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (id == "fs") {
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
    var vShaderTxt = document.getElementById(vectId).text;
    if (!vShaderTxt) return null;
    var fShaderTxt = document.getElementById(fragId).text;
    if (!fShaderTxt) return null;
    var vShader = this.getShader(gl, "vs", vShaderTxt);
    if (!vShader) return null;
    var fShader = this.getShader(gl, "fs", fShaderTxt);
    if (!fShader) return null;

    if (!fShader) {
      gl.deleteShader(vShader);
      return null;
    }

    var shaderProgram = getProgram(gl, vShader, fShader);

    return shaderProgram;
  }

  //--- Promise ---//
  async LoadShaderTextUsingPromise(URL) {
    let promise = new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", URL, true);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => resolve(console.log(xhr.statusText));
      xhr.send();
    });

    return promise;
  }

  async createPromiseShaderProgram(gl, URL_vs, URL_fs) {
    let vertex_shader_promise = await this.LoadShaderTextUsingPromise(URL_vs);
    let fragment_shader_promise = await this.LoadShaderTextUsingPromise(URL_fs);

    let shaderProgram = await Promise.all([
      vertex_shader_promise,
      fragment_shader_promise,
    ])
      .then((data) => {
        let vShaderTxt = data[0];
        let fShaderTxt = data[1];
        let vShader = this.getShader(gl, "vs", vShaderTxt);
        if (!vShader) return null;
        let fShader = this.getShader(gl, "fs", fShaderTxt);
        if (!fShader) return null;

        if (!fShader) {
          gl.deleteShader(vShader);
          return null;
        }
        let shaderProgram = this.getProgram(gl, vShader, fShader);
        return shaderProgram;
      })
      .catch((e) => console.log(e));

    return shaderProgram;
  }

  async loadJSON(gl, modelURL) {
    var xhr = new XMLHttpRequest();
    var model;

    xhr.open("GET", modelURL, false);
    xhr.onload = function () {
      if (xhr.status != 200) {
        alert("LOAD" + xhr.status + ": " + xhr.statusText);
      } else {
        gl.model = JSON.parse(xhr.responseText);
        // model = JSON.parse(xhr.responseText);
        // return true;
      }
    };
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
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(ModelVertices),
      gl.DYNAMIC_DRAW
    );

    // modelbuffer.TRIANGLE_VERTEX = TRIANGLE_VERTEX;

    modelbuffer.TRIANGLE_UV = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_UV);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(ModelTexCoords),
      gl.DYNAMIC_DRAW
    );

    modelbuffer.TRIANGLE_NORMAL = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_NORMAL);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(ModelNormal),
      gl.DYNAMIC_DRAW
    );

    modelbuffer.TRIANGLE_TANGENT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_TANGENT);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(ModelTangent),
      gl.DYNAMIC_DRAW
    );

    modelbuffer.TRIANGLE_BITANGENT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelbuffer.TRIANGLE_BITANGENT);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(ModelBiTangent),
      gl.DYNAMIC_DRAW
    );

    modelbuffer.TRIANGLE_FACES = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelbuffer.TRIANGLE_FACES);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(ModelIndices),
      gl.DYNAMIC_DRAW
    );

    gl.modelbufferPlane = modelbuffer;
    return modelbuffer;
  }

  async preRender() {
    const adapter = await navigator.gpu.requestAdapter();
    this.device = await adapter.requestDevice();

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
      this.canvasWebGL.width * devicePixelRatio,
      this.canvasWebGL.height * devicePixelRatio,
    ];
    const presentationFormat = this.ctxWebGPU.getPreferredFormat(adapter);

    this.ctxWebGPU.configure({
      device: this.device,
      format: presentationFormat,
      size: presentationSize,
    });

    const shader = Shaders();
    const cubeData = CubeData();

    this.pipeline = this.device.createRenderPipeline({
      vertex: {
        module: this.device.createShaderModule({
          code: shader.vertex,
        }),
        entryPoint: "main",
      },
      fragment: {
        module: this.device.createShaderModule({
          code: shader.fragment,
        }),
        entryPoint: "main",
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    this.Frame();
  }

  CheckWebGPU = () => {
    let result = "Great, your current browser supports WebGPU!";
    if (!navigator.gpu) {
      result = `Your current browser does not support WebGPU! Make sure you are on a system 
                         with WebGPU enabled. Currently, SPIR-WebGPU is only supported in  
                         <a href="https://www.google.com/chrome/canary/">Chrome canary</a>
                         with the flag "enable-unsafe-webgpu" enabled. See the 
                         <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status"> 
                         Implementation Status</a> page for more details.                   
                        `;
    }
    return result;
  };

  Frame = () => {
    // Sample is no longer the active page.
    //if (!this.canvasWebGL.current) return;

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.ctxWebGPU.getCurrentTexture().createView();

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          loadValue: { r: 0.0, g: 0.2, b: 0.2, a: 1.0 },
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(this.pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.endPass();

    this.device.queue.submit([commandEncoder.finish()]);
    //requestAnimationFrame(this.Frame);

    //requestAnimationFrame(this.Frame);
  };
}
