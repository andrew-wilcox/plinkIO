function PlinkoEngine() {
    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Vertices = Matter.Vertices
        Body = Matter.Body,
        Common = Matter.Common;

    this.bits = [];

    WORLD_HEIGHT = 600;
    WORLD_WIDTH = 400;
    PEG_RADIUS = 5;
    BUFFER_X = 14;
    BUFFER_Y = 60;
    STATIC_COLOR = '#8800c6';
    DARK_STATIC_COLOR = '#8800ff'

    this.engine = Engine.create();

    this.init = function(){
        // create a renderer
        var render = Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: WORLD_WIDTH,
                height: WORLD_HEIGHT,
                wireframes: false,
            }
        });

        // create ground
        var ground = Bodies.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT, WORLD_HEIGHT, 10, { isStatic: true, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR } });
        var wallLeft = Bodies.rectangle(5, WORLD_HEIGHT / 2, 10, WORLD_HEIGHT, { isStatic: true, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} });
        var wallRight = Bodies.rectangle(WORLD_WIDTH - 5, WORLD_HEIGHT / 2, 10, WORLD_HEIGHT, { isStatic: true, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} });

        var bucketLeft = Bodies.rectangle(150, WORLD_HEIGHT, 5, 150, { isStatic: true, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} });
        var bucketRight = Bodies.rectangle(250, WORLD_HEIGHT, 5, 150, { isStatic: true, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} });

        var bonusLeft = Bodies.rectangle(175, WORLD_HEIGHT, 5, 75, { isStatic: true, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} });
        var bonusRight = Bodies.rectangle(225, WORLD_HEIGHT, 5, 75, { isStatic: true, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} });
        Body.rotate(bonusRight, -60);
        Body.rotate(bonusLeft, 60);

        // add the walls
        World.add(this.engine.world, [ground, wallLeft, wallRight, bucketLeft, bucketRight, bonusLeft, bonusRight]);
        this.generatePegs(14, 11);

        // run the engine
        Engine.run(this.engine);

        this.engine.world.gravity.y = .6;

        render.options.background = '#e0e0e0'

        // run the renderer
        Render.run(render);
    }

    this.generateRandomBit = function(){
        this.generateBit(Common.choose([1, 100, 1000, 5000, 10000, 100000]));
    }

    this.generateBit = function(amount){
        var texture;

        if(amount > 99999){
            texture = './textures/gold.gif';
        }
        else if(amount > 9999){
            texture = './textures/red.gif';
        }
        else if(amount > 4999){
            texture = './textures/blue.gif';
        }
        else if(amount > 999){
            texture = './textures/green.gif';
        }
        else if(amount > 99){
            texture = './textures/purple.gif';
        }
        else{
            texture = './textures/gray.gif';
        }

        this.bits.push(Bodies.circle(Math.random() * WORLD_WIDTH, 15, 9.1, 
            {friction: 0, render: {
                                strokeStyle: '#ffffff',
                                sprite: {
                                    texture: texture,
                                    xScale: .2,
                                    yScale: .2
                                }
                            }}));
        World.add(this.engine.world, this.bits[this.bits.length-1]);
    }

    this.spawnBit = function(amount, userName){
        console.log("In plinko engine with amount: " + amount + " and username: " + userName);
        var texture;

        if(amount > 99999){
            texture = './textures/gold.gif';
        }
        else if(amount > 9999){
            texture = './textures/red.gif';
        }
        else if(amount > 4999){
            texture = './textures/blue.gif';
        }
        else if(amount > 999){
            texture = './textures/green.gif';
        }
        else if(amount > 99){
            texture = './textures/purple.gif';
        }
        else{
            texture = './textures/gray.gif';
        }

        console.log("Texture: " + texture);

        this.bits.push(Bodies.circle(Math.random() * WORLD_WIDTH, 15, 9.1, 
            {friction: 0, render: {
                                strokeStyle: '#ffffff',
                                sprite: {
                                    texture: texture,
                                    xScale: .2,
                                    yScale: .2
                                }
                            }}));
        World.add(this.engine.world, this.bits[this.bits.length-1]);
    }

    this.generatePegs = function(rows, ppr){
        var pegs = [];
        var blockers = [];
        var xDelim = (WORLD_WIDTH - (BUFFER_X * 2) ) / ppr - 2;
        var yDelim = (WORLD_HEIGHT - BUFFER_Y * 2 - 40) / rows;

        for(var i=0; i<rows; i++){
            for(var j=0; j<ppr; j++){
                pegs.push(Bodies.circle( (j * xDelim) + (i % 2 * xDelim / 2) + 20 + BUFFER_X, i * yDelim + BUFFER_Y, PEG_RADIUS, { isStatic: true, friction: 0.02, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR}}))
            }
            if(i%2 == 0){
                blockers.push(Bodies.polygon( (WORLD_WIDTH) - 14, i*yDelim + BUFFER_Y, 3, 8, { isStatic: true, friction: 0.02, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} }));
            }
            else{
                blockers.push(Bodies.polygon(14, i*yDelim + BUFFER_Y, 3, 8, { isStatic: true, friction: 0.02, render: { fillStyle: STATIC_COLOR, strokeStyle: DARK_STATIC_COLOR} }));   
            }
        }

        for(var k = 0; k < blockers.length; k++){
            if(k % 2 == 1){
                Body.rotate(blockers[k], 24.1);
            }
            else{
                Body.rotate(blockers[k], 10.5);
            }
        }

        World.add(this.engine.world, blockers);
        World.add(this.engine.world, pegs);
    }

    this.bump = function(){
        for(var i in this.bits){
            Body.applyForce(this.bits[i], this.bits[i].position, {x: 0, y: -.008});
        }
    }

    this.resetBits = function(){
        for(var i in this.bits){
            Body.setPosition(this.bits[i], {x: 200, y: 30});
        }
    }

    this.clearBits = function(){
        for(var i in this.bits){
            World.remove(this.engine.world, this.bits[i], true);
            delete(this.bits[i]);
        }
    }
}

var PlinkoEngine = new PlinkoEngine();