import { Component, Input, OnInit } from '@angular/core';

import { ActivatedRoute, Params } from '@angular/router';

import { Location } from '@angular/common';

import 'rxjs/add/operator/switchMap';

import { AuthService } from '../auth/auth.service';

/*
interface RubiksCube{
	RubiksCube: Function;
}

declare var rubiksCube: RubiksCube;
*/

declare var RubiksCube: Function;
declare var FlatCube: Function;
declare var RubiksCubeControls: Function;
declare var requestAnimationFrame: Function;


@Component({
	moduleId: module.id,
	selector: 'response-component',
	templateUrl: 'response.component.html',
	providers: [AuthService]
})

export class ResponseComponent implements OnInit {
	@Input()
	state: string;

	@Input()
	response: string;

	@Input()
	colors: any;

	cube: any;

	flatCube: any;

	controls: any;

	oldWidth: number;

	constructor(private authService: AuthService, private route: ActivatedRoute, private location: Location) { }

	ngOnInit(): void {
		console.log("Mostrando respuesta");
		console.log(this.state);

		var me = this;
		var down = false;
		var parent = document.getElementById('cube').parentElement;
		var width = Math.min(parent.offsetWidth / 2 - 30, parent.offsetHeight / 5 * 3);
		if (width < 250) {
			width = window.innerWidth / 2 - 30;
		}
		if (width < 250) {
			width = window.innerWidth - 30;
			down = true;
		}
		me.oldWidth = width;
		//llamamos a la librería que dibuja el cubo y las caras
		//cubo 3D
		me.cube = new (Function.prototype.bind.apply(RubiksCube, [null, 'cube', width]));
		//cubo plano (vista de desarrollo)
		me.flatCube = new (Function.prototype.bind.apply(FlatCube, [null, 'flat-cube', width, down]));
		//controles de navegación
		me.controls = new (Function.prototype.bind.apply(RubiksCubeControls, [null, 'controls', me.cube, width]));

		//referencio las instancias del cubo plano y el cubo 3D
		me.cube.flatCube = me.flatCube;
		me.flatCube.cube = me.cube;

		//dibujo el cubo 3D;
		me.cube.tick();
		me.cube.render();
		//asigno el estado actual del cubo
		me.flatCube.setCurrentState(me.colors);
		//dejo la animación ejecutandose
		requestAnimationFrame(() => me.run());
	}

	run(): void {
		let me = this;
		console.log(me);
		me.cube.tick();
		me.cube.render();
		// dejo la animación ejecutandose
		requestAnimationFrame(() => me.run());
	}

	goBack(): void {
		this.location.back();
	}
}