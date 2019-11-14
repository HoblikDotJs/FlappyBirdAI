let players = [];
let gravity = 2;
let pipes = [];
let offset = 250;
let savedPlayers = [];
let NUMBEROFPLAYERS = 200;

function setup() {
	createCanvas(1800, 900);
	for (let i = 0; i < NUMBEROFPLAYERS; i++) {
		players.push(new Player(floor(random(i))));
	}
	setInterval(() => {
		pipes.push(new Pipe(true));
	}, 500)
}

function draw() {
	if (!keyIsDown(32)) {
		background(0);
		for (let i = players.length - 1; i >= 0; i--) {
			players[i].show();
		}
		for (let i = pipes.length - 1; i >= 0; i--) {
			pipes[i].show();
		}
	}
	for (let i = 0; i < 5; i++) {
		for (let i = players.length - 1; i >= 0; i--) {
			players[i].update();
			players[i].collide(pipes);
			if (players[i].dead) {
				savedPlayers.push(players.splice(i, 1)[0]);
			}
		}
		for (let i = pipes.length - 1; i >= 0; i--) {
			pipes[i].update();
			if (pipes[i].x + 60 <= 0) {
				pipes.splice(i, 1);
				if (players.length == 0) {
					newgen();
				}
			}
		}
	}
}

function pickOne() {
	let index = 0;
	let r = random(1);
	while (r > 0) {
		r = r - savedPlayers[index].percentige;
		index++
	}
	index--;
	let player = savedPlayers[index];
	let child = new Player(player.hidden, player.brain.copy());
	child.brain.mutate(0.1);
	return child;
}

function mousePressed() {
	for (let i = 0; i < players.length; i++) {
		players[i].jump();
	}
}

function newgen() {
	// Compute the sum of all
	let sum = 0;
	for (let i = 0; i < savedPlayers.length; i++) {
		sum += savedPlayers[i].fitness;
	}
	// Make their percentige
	for (let i = 0; i < savedPlayers.length; i++) {
		savedPlayers[i].percentige = savedPlayers[i].fitness / sum;
	}
	for (let i = 0; i < NUMBEROFPLAYERS; i++) {
		players.push(pickOne());
	}
	savedPlayers = [];
}

class Player {
	constructor(h, brain) {
		this.hidden = h;
		this.x = 160;
		this.y = 450;
		this.r = 26;
		this.vel = 0;
		this.dead = false;
		this.brain = brain || new NeuralNetwork(5, this.hidden, 1);
		this.fitness = 0;
		this.score = 0;
		this.percentige = 0;
	}

	jump() {
		this.vel += -45;
	}

	update() {
		this.vel += gravity;
		this.vel *= 0.9;
		this.vel = constrain(this.vel, -25, 45);
		this.y += this.vel;
		this.y = constrain(this.y, 0, height);
		if (pipes[0]) {
			let inputs = [this.y / height, pipes[1].x / height, abs(this.y - pipes[1].y), pipes[1].x / height, abs(this.y - pipes[1].y)];
			let prediction = this.brain.predict(inputs);
			if (prediction[0] > 0.5) {
				this.jump();
			}
		}
		this.fitness++;
	}

	show() {
		noFill();
		strokeWeight(3);
		stroke(255, 51);
		ellipse(this.x, this.y, this.r * 2, this.r * 2)
	}

	collide(pipes) {
		for (let i = 0; i < pipes.length; i++) {
			let pp = pipes[i];
			if (p5.prototype.collideRectCircle(pp.x, pp.y, 60, pp.h, this.x, this.y, this.r * 2)) {
				this.dead = true;
			}
		}
	}
}

class Pipe {
	constructor(bottom, y) {
		this.bottom = bottom;
		this.x = width;
		this.y = y || random(offset, height - offset);
		if (bottom) {
			this.h = height - this.y
			pipes.push(new Pipe(false, this.y));
		} else {
			this.h = this.y - offset;
			this.y = -1;
		}
	}

	show() {
		fill(200);
		if (this.bottom) {
			rect(this.x, this.y, 60, this.h);
		} else {
			rect(this.x, this.y, 60, this.h);
		}
	}
	update() {
		this.x -= 5;
	}
}