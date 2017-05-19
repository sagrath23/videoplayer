"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var auth_service_1 = require("../auth/auth.service");
var TrackmanagerComponent = (function () {
    function TrackmanagerComponent(authService) {
        this.authService = authService;
        this.images = ['white', 'blue', 'red', 'orange', 'yellow', 'green'];
        //images: string[] = ['blue'];
        this.faces = new Array(6);
        this.cubies = new Array(6);
        this.baseState = ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL', 'UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR'];
        this.currentState = new Array(20);
        /*Las combinaciones son iguales para Up-down, front-back y left-right */
        this.combinations = {
            'white': { 'blue': 'UF', 'orange': 'UR', 'red': 'UL', 'green': 'UB' },
            'blue': { 'white': 'UF', 'yellow': 'DF', 'red': 'FL', 'orange': 'FR' },
            'orange': { 'white': 'UR', 'yellow': 'DR', 'green': 'BR', 'blue': 'FR' },
            'red': { 'white': 'UL', 'yellow': 'DL', 'green': 'BL', 'blue': 'FL' },
            'yellow': { 'blue': 'DF', 'orange': 'DR', 'red': 'DL', 'green': 'DB' },
            'green': { 'white': 'UB', 'yellow': 'DB', 'red': 'BL', 'orange': 'BR' }
        };
        /*
        combinaciones de las esquinas
        */
        this.edgesCombinations = {
            'white': { 'blue': { 'red': 'ULF', 'orange': 'UFR' }, 'green': { 'red': 'UBL', 'orange': 'URB' } },
            'yellow': { 'blue': { 'red': 'DFL', 'orange': 'DRF' }, 'green': { 'red': 'DLB', 'orange': 'DBR' } }
        };
    }
    TrackmanagerComponent.prototype.ngOnInit = function () {
        console.log('loading trackers...');
    };
    /*
    //Estado objetivo
    UF = Blanco-azul
    UR = Blanco-naranja
    UB = Blanco-verde
    UL = Blanco-rojo
    DF = Amarillo-azul
    DR = Amarillo-naranja
    DB = Amarillo-verde
    DL = Amarillo-rojo
    FR = Azul-naranja
    FL = Azul-rojo
    BR = Verde-naranja
    BL = Verde-rojo
    UFR = Blanco-azul-naranja
    URB = Blanco-naranja-verde
    UBL = Blanco-verde-rojo
    ULF = Blanco-rojo-azul
    DRF = Amarillo-naranja-azul
    DFL = Amarillo-azul-rojo
    DLB = Amarillo-rojo-verde
    DBR = Amarillo-verde-naranja
     */
    TrackmanagerComponent.prototype.resolveCube = function () {
        var me = this;
        //Estado objetivo UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR
        //estado actual : DB UF FR FL UR DF BL UB BR UL DL DR UFL FDR RDB RDB FRU DFL URB UBL
        var state = 'BR DF UR LB BD FU FL DL RD FR LU BU UBL FDR FRU BUR ULF LDF RDB DLB';
        //enviamos el estado al back para que sea procesado y retorne los movimientos necesarios
        //para resolver
        me.authService.solveCube(state)
            .then(function (data) {
            me.result = data;
        });
        return me.result;
    };
    /*
    función que se ejecuta cuando se detecta la cara que se enceuntra en la imágen
    */
    TrackmanagerComponent.prototype.setFaceId = function (event) {
        var me = this;
        me.faces[me.images.indexOf(event.imageName)] = event.faceId;
        me.cubies[me.images.indexOf(event.imageName)] = event.cubies;
        if (me.check()) {
            var result = me.findUpCross() + me.findDownCross() + me.findFrontLine() + me.findBackLine() + me.findUpEdges() + me.findDownEdges();
        }
    };
    /*
    función que verifica que se hayan identificado todas las caras del cubo en las imágenes
    */
    TrackmanagerComponent.prototype.check = function () {
        var me = this;
        for (var i = 0; i < me.faces.length; i++) {
            if (typeof me.faces[i] === 'undefined') {
                return false;
            }
        }
        return true;
    };
    /*
    función que identifica qué cubies están en las posiciones UF,UR,UL,UB

    Alternativas
    Azul:     Azul-blanco
              Azul-amarillo
              Azul-naranja
              Azul-rojo
    Blanco:   Blanco-rojo
              Blanco-naranja
              Blanco-verde
    Amarillo: Amarillo-rojo
              Amarillo-naranja
              Amarillo-verde
    Verde:    Verde-rojo
              Verde-naranja

     */
    /*
    las fotos se tomaron de girando en sentido antihorario
    */
    TrackmanagerComponent.prototype.findUpCross = function () {
        var me = this, upFaceIndex = -1, frontFaceIndex = -1, leftFaceIndex = -1, rightFaceIndex = -1, backFaceIndex = -1;
        //busco la cara de arriba
        for (var i = 0; i < me.faces.length; i++) {
            if (me.faces[i] === 'U') {
                upFaceIndex = i;
            }
            if (me.faces[i] === 'F') {
                frontFaceIndex = i;
            }
            if (me.faces[i] === 'L') {
                leftFaceIndex = i;
            }
            if (me.faces[i] === 'R') {
                rightFaceIndex = i;
            }
            if (me.faces[i] === 'B') {
                backFaceIndex = i;
            }
        }
        //ahora, procedemos a identificar las caras de los cubies que están en las posiciones
        //de la cara superior
        //saco las 4 posiciones de cruz de la cara
        var upCross = me.getCross(upFaceIndex);
        var frontCross = me.getCross(frontFaceIndex);
        var leftCross = me.getCross(leftFaceIndex);
        var rightCross = me.getCross(rightFaceIndex);
        var backCross = me.getCross(backFaceIndex);
        var result = "";
        //con las cruces, y conociendo el sentido en que se rotaron las caras, puedo calcular las posiciones de
        //la cruz superior
        //UF => up-left & front-right
        result += me.combinations[upCross[3].color][frontCross[1].color] + " ";
        //UR => up-bottom & right-top
        result += me.combinations[upCross[0].color][rightCross[2].color] + " ";
        //UB => up-right & bottom-left
        result += me.combinations[upCross[1].color][backCross[3].color] + " ";
        //UL => up-top & left-bottom
        result += me.combinations[upCross[2].color][leftCross[0].color] + " ";
        console.log(result);
        return result;
    };
    /*
    función que identifica qué cubies están en las posiciones DF,DR,DL,DB
    */
    TrackmanagerComponent.prototype.findDownCross = function () {
        var me = this, downFaceIndex = -1, frontFaceIndex = -1, leftFaceIndex = -1, rightFaceIndex = -1, backFaceIndex = -1;
        //busco la cara de arriba
        for (var i = 0; i < me.faces.length; i++) {
            if (me.faces[i] === 'D') {
                downFaceIndex = i;
            }
            if (me.faces[i] === 'F') {
                frontFaceIndex = i;
            }
            if (me.faces[i] === 'L') {
                leftFaceIndex = i;
            }
            if (me.faces[i] === 'R') {
                rightFaceIndex = i;
            }
            if (me.faces[i] === 'B') {
                backFaceIndex = i;
            }
        }
        //ahora, procedemos a identificar las caras de los cubies que están en las posiciones
        //de la cara superior
        //saco las 4 posiciones de cruz de la cara
        var downCross = me.getCross(downFaceIndex);
        var frontCross = me.getCross(frontFaceIndex);
        var leftCross = me.getCross(leftFaceIndex);
        var rightCross = me.getCross(rightFaceIndex);
        var backCross = me.getCross(backFaceIndex);
        var result = "";
        //Estado objetivo UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR
        //estado actual : DB UF FR FL UR DF BL UB RB UR DL DR UFL FDR RDB RDB FRU DFL URB UBL
        //con las cruces, y conociendo el sentido en que se rotaron las caras, puedo calcular las posiciones de
        //la cruz superior
        //DF => 
        result += me.combinations[downCross[1].color][frontCross[3].color] + " ";
        //DR => 
        result += me.combinations[downCross[0].color][rightCross[0].color] + " ";
        //DB => down-right & back-left
        result += me.combinations[downCross[3].color][backCross[1].color] + " ";
        //DL => down bottom & left-top
        result += me.combinations[downCross[2].color][leftCross[2].color] + " ";
        console.log(result);
        return result;
    };
    /*
    funcion que identifica que cubies están en las posiciones FR y FL
    */
    TrackmanagerComponent.prototype.findFrontLine = function () {
        var me = this, frontFaceIndex = -1, leftFaceIndex = -1, rightFaceIndex = -1;
        //busco la cara del frente
        for (var i = 0; i < me.faces.length; i++) {
            if (me.faces[i] === 'F') {
                frontFaceIndex = i;
            }
            if (me.faces[i] === 'L') {
                leftFaceIndex = i;
            }
            if (me.faces[i] === 'R') {
                rightFaceIndex = i;
            }
        }
        //ahora, procedemos a identificar las caras de los cubies que están en las posiciones
        //de la cara superior
        //saco las 4 posiciones de cruz de la cara
        var frontCross = me.getCross(frontFaceIndex);
        var leftCross = me.getCross(leftFaceIndex);
        var rightCross = me.getCross(rightFaceIndex);
        var result = "";
        //con las cruces, y conociendo el sentido en que se rotaron las caras, puedo calcular las posiciones de
        //la cruz superior
        //FR => up-left & front-right
        result += me.combinations[frontCross[0].color][rightCross[3].color] + " ";
        //FL => up-bottom & right-top
        result += me.combinations[frontCross[2].color][leftCross[3].color] + " ";
        console.log(result);
        return result;
    };
    /*
    funcion que identifica que cubies están en las posiciones BR y BL
    */
    TrackmanagerComponent.prototype.findBackLine = function () {
        var me = this, backFaceIndex = -1, leftFaceIndex = -1, rightFaceIndex = -1;
        //busco la cara del frente
        for (var i = 0; i < me.faces.length; i++) {
            if (me.faces[i] === 'B') {
                backFaceIndex = i;
            }
            if (me.faces[i] === 'L') {
                leftFaceIndex = i;
            }
            if (me.faces[i] === 'R') {
                rightFaceIndex = i;
            }
        }
        //ahora, procedemos a identificar las caras de los cubies que están en las posiciones
        //de la cara superior
        //saco las 4 posiciones de cruz de la cara
        var backCross = me.getCross(backFaceIndex);
        var leftCross = me.getCross(leftFaceIndex);
        var rightCross = me.getCross(rightFaceIndex);
        var result = "";
        //con las cruces, y conociendo el sentido en que se rotaron las caras, puedo calcular las posiciones de
        //la cruz superior
        //BR => up-left & front-right
        result += me.combinations[backCross[0].color][rightCross[1].color] + " ";
        //BL => up-bottom & right-top
        result += me.combinations[backCross[2].color][leftCross[1].color] + " ";
        console.log(result);
        return result;
    };
    TrackmanagerComponent.prototype.findUpEdges = function () {
        var me = this, upFaceIndex = -1, frontFaceIndex = -1, leftFaceIndex = -1, rightFaceIndex = -1, backFaceIndex = -1;
        //busco la cara de arriba
        for (var i = 0; i < me.faces.length; i++) {
            if (me.faces[i] === 'U') {
                upFaceIndex = i;
            }
            if (me.faces[i] === 'F') {
                frontFaceIndex = i;
            }
            if (me.faces[i] === 'L') {
                leftFaceIndex = i;
            }
            if (me.faces[i] === 'R') {
                rightFaceIndex = i;
            }
            if (me.faces[i] === 'B') {
                backFaceIndex = i;
            }
        }
        //ahora, procedemos a identificar las caras de los cubies que están en las posiciones
        //de la cara superior
        //saco las 4 posiciones de cruz de la cara
        var upEdges = me.getEdges(upFaceIndex);
        var frontEdges = me.getEdges(frontFaceIndex);
        var leftEdges = me.getEdges(leftFaceIndex);
        var rightEdges = me.getEdges(rightFaceIndex);
        var backEdges = me.getEdges(backFaceIndex);
        var result = "";
        //con las cruces, y conociendo el sentido en que se rotaron las caras, puedo calcular las posiciones de
        //la cruz superior
        //UF => up-left & front-right
        result += me.combinations[upEdges[3].color][frontEdges[1].color][leftEdges[1].color] + " ";
        //UR => up-bottom & right-top
        result += me.combinations[upEdges[3].color][frontEdges[1].color][rightEdges[1].color] + " ";
        //UB => up-right & bottom-left
        result += me.combinations[upEdges[3].color][backEdges[1].color][leftEdges[1].color] + " ";
        //UL => up-top & left-bottom
        result += me.combinations[upEdges[3].color][backEdges[1].color][rightEdges[1].color] + " ";
        console.log(result);
        return result;
    };
    TrackmanagerComponent.prototype.findDownEdges = function () {
        return "";
    };
    TrackmanagerComponent.prototype.isValidCombination = function (faceOne, faceTwo) {
        var me = this;
        //verifico que la combinación sea possible
        if (typeof me.combinations[faceOne.color][faceTwo.color] != 'undefined') {
            //es una posible combinación
            return true;
        }
        return false;
    };
    TrackmanagerComponent.prototype.getCross = function (index) {
        var me = this;
        return [
            me.getMiddleCubie(me.cubies[index][1], false),
            me.getBorderCubie(me.cubies[index][2]),
            me.getMiddleCubie(me.cubies[index][1], true),
            me.getBorderCubie(me.cubies[index][0]) //left
        ];
    };
    TrackmanagerComponent.prototype.getEdges = function (index) {
        var me = this;
        return [
            me.getEdgeCubie(me.cubies[index][0], true),
            me.getEdgeCubie(me.cubies[index][0], false),
            me.getEdgeCubie(me.cubies[index][2], true),
            me.getEdgeCubie(me.cubies[index][2], false) //right-bottom
        ];
    };
    /*
    Retorna el cubie superior o inferior de la fila del medio  dependiendo del valor de
    getUpCubie
    */
    TrackmanagerComponent.prototype.getMiddleCubie = function (cubies, getUpCubie) {
        var me = this;
        if (getUpCubie) {
            //obtenemos el cubo del medio que esta más arriba
            var index = -1, minY = Number.MAX_VALUE;
            for (var i = 0; i < cubies.length; i++) {
                if (cubies[i].y < minY) {
                    index = i;
                    minY = cubies[i].y;
                }
            }
            return cubies[index];
        }
        else {
            //obtenemos el cubo que está al medio en la parte inferior
            var index = -1, maxY = Number.MIN_VALUE;
            for (var i = 0; i < cubies.length; i++) {
                if (cubies[i].y > maxY) {
                    index = i;
                    maxY = cubies[i].y;
                }
            }
            return cubies[index];
        }
    };
    /*
    retorna el cubie del medio de la fila
    */
    TrackmanagerComponent.prototype.getBorderCubie = function (cubies) {
        var me = this, minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE, minIndex = -1, maxIndex = -1, centerIndex = -1;
        //extraemos los míninos y máximos de los cubies del medio
        for (var i = 0; i < cubies.length; i++) {
            if (cubies[i].y < minY) {
                minIndex = i;
                minY = cubies[i].y;
            }
            if (cubies[i].y > maxY) {
                maxIndex = i;
                maxY = cubies[i].y;
            }
        }
        //con estos valores identificados, se determina el cubie del medio
        for (var i = 0; i < cubies.length; i++) {
            if (i != minIndex && i != maxIndex) {
                centerIndex = i;
                break;
            }
        }
        return cubies[centerIndex];
    };
    TrackmanagerComponent.prototype.getEdgeCubie = function (cubies, top) {
        var me = this, minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE, minIndex = -1, maxIndex = -1, centerIndex = -1;
        //extraemos los míninos y máximos de los cubies del medio
        for (var i = 0; i < cubies.length; i++) {
            if (cubies[i].y < minY) {
                minIndex = i;
                minY = cubies[i].y;
            }
            if (cubies[i].y > maxY) {
                maxIndex = i;
                maxY = cubies[i].y;
            }
        }
        if (top) {
            return cubies[minIndex];
        }
        else {
            return cubies[maxIndex];
        }
    };
    return TrackmanagerComponent;
}());
TrackmanagerComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'trackmanager',
        templateUrl: 'trackmanager.component.html',
        providers: [auth_service_1.AuthService]
    }),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], TrackmanagerComponent);
exports.TrackmanagerComponent = TrackmanagerComponent;
//# sourceMappingURL=trackmanager.component.js.map