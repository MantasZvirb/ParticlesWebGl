function KeyDownEventHandler(event)
{
	if(event.keyCode == '38')//UpArrow
	{
		TranslateCamera(0,0.5,0);
		return;
	}
	if(event.keyCode == '40')//DownArrow
	{
		TranslateCamera(0,-0.5,0);
		return;
	}
	if(event.keyCode == '37')//LeftArrow
	{
		TranslateCamera(0.5,0,0);
		return;
	}
	if(event.keyCode == '39')//RightArrow
	{
		TranslateCamera(-0.5,0,0);
		return;
	}
	if(event.keyCode == '107')//add
	{
		TranslateCamera(0,0,0.5);
		return;
	}
	if(event.keyCode == '109')//subtract
	{	
		TranslateCamera(0,0,-0.5);
		return;
	}


	if(event.keyCode == '100')//NUM4
	{
		PhysicsSetAllObjectSpeed(0);
		return;
	} 
	if(event.keyCode == '102')//NUM6
	{
		return;
	}
	if(event.keyCode == '98')//NUM2
	{
		return;
	}
	if(event.keyCode == '104')//NUM8
	{
		return;
	}
}

function TimeSimulate(Duration,TimeStep)
{
	let Runs = Duration/TimeStep
	for(let i = 0;i < Runs;i++)
	{
		PhysicsRunStep(TimeStep);
	}
}

function FrameRenderCallback(Timestamp)
{
	RenderFrame();
	PhysicsRunStep(0.00001)
	window.requestAnimationFrame(FrameRenderCallback);
}

function Rand(MinValue,MaxValue)
{
	return Math.random() * (MinValue-MaxValue) + MaxValue;
}

function RandInt(MinValue,MaxValue)
{
	return Math.floor((Math.random() * (MinValue-MaxValue)+MaxValue));
}

//Entry
//PhysicsObjectCreate([X,Y,Z],Charge,Mass,[SpeedX,SpeedY,SpeedZ]);

let e = Math.pow(1.61*10,-19);
let me = Math.pow(9.1*10,-31);
let mp = Math.pow(1.27*10,-27);

for(let i = 0; i < 50;i++)
{
	let X = Rand(-50,50);
	let Y = Rand(-50,50);
	let Z = Rand(-50,50);
	
	PhysicsObjectCreate([X,Y,Z],10,1000
	,[0,0,0]);
}

for(let i = 0; i < 200;i++)
{
	let X = Rand(-80,80);
	let Y = Rand(-80,80);
	let Z = Rand(-80,80);

	PhysicsObjectCreate([X,Y,Z],-1,1,[0,0,0]);
}

InitWebGl();

TranslateCamera(0,0,-40);

window.requestAnimationFrame(FrameRenderCallback);
document.addEventListener('keydown',KeyDownEventHandler);
