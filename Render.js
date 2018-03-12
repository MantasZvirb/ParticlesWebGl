var MeshVertexBuffer = 0;
var MeshIndexBuffer = 0;
var MeshNormalBuffer = 0;
var IndexNum = 0;

var gl = 0;

var VertexShader = 0;
var FragmentShader = 0;
var LinkedShader = 0;

var VertexAttrib = 0;
var NormalAttrib = 0;

var MvpUniform = 0;
var ColorUniform = 0;
var NormalMatrixUniform = 0;
var WorldViewMatrixUniform = 0;


var ViewMatrix = mat4.create();
var ProjectionMatrix = mat4.create();

function StrToDataArray(TextData,IntOrFloat)
{
	let WorkStr = "";
	let OAI = 0;//OutArrayIndex
	let OutArray = [];
	let Func;
	if(IntOrFloat == 0)
	{
		Func = function(StrData){return parseInt(StrData);};
	}
	else
	{
		Func = function(StrData){return parseFloat(StrData);};
	}

	for(var i = 0;i < TextData.length;i++)
	{
		if(TextData[i] != '\n' && TextData[i] != '\r' && TextData[i] !='\t' && TextData[i] != ' ')
		{
			WorkStr+=TextData[i];
		}
		else
		{
			if(WorkStr != "")
			{
				OutArray[OAI] = Func(WorkStr);
				OAI++;
				WorkStr = "";
			}
		}
	}
	return OutArray;
}

function Interlope(VertexData,NormalData)
{
	let Buffer = [];
	let Index = 0;
	for(let i = 0;i < VertexData.length;i+=3)
	{
		for(let a = 0;a < 3;a++)
		{
			Buffer[Index] = VertexData[i+a];
			Index++;
		}
		for(let a = 0;a < 3;a++)
		{
			Buffer[Index] = NormalData[i+a];
			Index++;
		}
	}
	return Buffer;
}

function InitWebGl()
{
	let CanvasContext = document.getElementById("RenderCanvas");
	gl = CanvasContext.getContext("webgl", {alpha:1,deph:1,antialias:true});
	if(gl == 0)
	{
		let Message = "Cant create WebGl context";
		alert(Message);
		throw new Error ([Message])
	}
	
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0,0,0,1);
	gl.depthFunc(gl.LEQUAL);

	VertexShader = gl.createShader(gl.VERTEX_SHADER);
	let ShaderSource = document.getElementById("VertexShaderSource").text;
	gl.shaderSource(VertexShader,ShaderSource);
	gl.compileShader(VertexShader);
	let CompileResult = gl.getShaderParameter(VertexShader,gl.COMPILE_STATUS);
	if(!CompileResult)
	{
		alert(gl.getShaderInfoLog(VertexShader));
		throw new Error (["Cant compile vertex shader"]);
	}
	FragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	ShaderSource = document.getElementById("FragmentShaderSource").text;
	gl.shaderSource(FragmentShader,ShaderSource);
	gl.compileShader(FragmentShader);
	CompileResult = gl.getShaderParameter(FragmentShader,gl.COMPILE_STATUS);
	if(!CompileResult)
	{
		alert(gl.getShaderInfoLog(FragmentShader));
		throw new Error (["Cant compile Fragment shader"]);
	}
	LinkedShader = gl.createProgram();
	gl.attachShader(LinkedShader,VertexShader);
	gl.attachShader(LinkedShader,FragmentShader);
	gl.linkProgram(LinkedShader);
	CompileResult = gl.getProgramParameter(LinkedShader,gl.LINK_STATUS);
	if(!CompileResult)
	{
		alert(gl.getProgramInfoLog(LinkedShader));
		throw new Error (["Cant link shader"]);
	}
	gl.useProgram(LinkedShader);
	mat4.perspective(ProjectionMatrix,20,gl.drawingBufferWidth/gl.drawingBufferHeight,0.1,1000);
	mat4.identity(ViewMatrix);	
	mat4.translate(ViewMatrix,ViewMatrix,[0,0,-5]);


	let MeshIndexText = document.getElementById("IsoIndex").text;
	let MeshVertexText = document.getElementById("IsoVertex").text;
	let MeshNormalText = document.getElementById("IsoNormal").text;
	let IndexData = new Uint16Array(StrToDataArray(MeshIndexText,0));
	IndexNum = IndexData.length;
	let VertexData = StrToDataArray(MeshVertexText,1);
	let NormalData = StrToDataArray(MeshNormalText,1);
	let VertexNormalData = new Float32Array(Interlope(VertexData,NormalData));
	
	
	MeshIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,MeshIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,IndexData,gl.STATIC_DRAW);
	
	MeshVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,MeshVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,VertexNormalData,gl.STATIC_DRAW);

	VertexAttrib = gl.getAttribLocation(LinkedShader,"Vertex");
	NormalAttrib = gl.getAttribLocation(LinkedShader,"Normal");

	MvpUniform = gl.getUniformLocation(LinkedShader,"MVP");
	ColorUniform = gl.getUniformLocation(LinkedShader,"Color");
	WorldViewMatrixUniform = gl.getUniformLocation(LinkedShader,"WorldViewMatrix");	
	NormalMatrixUniform = gl.getUniformLocation(LinkedShader,"NormalMatrix");
	
	gl.vertexAttribPointer(VertexAttrib,3,gl.FLOAT,false,4*6,0);
	gl.vertexAttribPointer(NormalAttrib,3,gl.FLOAT,false,4*6,4*3);
	gl.enableVertexAttribArray(VertexAttrib);
	gl.enableVertexAttribArray(NormalAttrib);
}


var PhysicsObject = [];
var POI = 0;//Physics Object Index

var CubeSideLenght = 100;
var ElectricConst = 10000000;
var GravConst = 0.5;

function PhysicsObjectCreate(Cords,Charge,Mass,Speed)
{
	PhysicsObject[POI] = [];
	PhysicsObject[POI].Cords = Cords;
	PhysicsObject[POI].Charge = Charge;
	PhysicsObject[POI].Mass = Mass;
	PhysicsObject[POI].Speed = Speed;
	PhysicsObject[POI].Swich = 0;
	let a = POI;
	POI++;
	return PhysicsObject[a];
}


function PhysicsSetAllObjectSpeed(Speed)
{
	for(let i = 0; i < POI;i++)
	{
		for(let a = 0; a < 3;a++)
		{
			PhysicsObject[i].Speed[a] = Speed;
		}
	}
}

function PhysicsRunStep(TimeStep)
{
	for(let i = 0; i < POI;i++)
	{
		let ForceX = 0;
		let ForceY = 0;
		let ForceZ = 0;

		let X = PhysicsObject[i].Cords[0];
		let Y = PhysicsObject[i].Cords[1];
		let Z = PhysicsObject[i].Cords[2];
		let M1 = PhysicsObject[i].Mass;
		let C1 = PhysicsObject[i].Charge;

		for(let i2 = 0;i2 < POI;i2++)
		{
			if(i != i2)
			{
				let X2 = PhysicsObject[i2].Cords[0];
				let Y2 = PhysicsObject[i2].Cords[1];
				let Z2 = PhysicsObject[i2].Cords[2];

				let DistX = X-X2;
				let DistY = Y-Y2;
				let DistZ = Z-Z2;

				let M2 = PhysicsObject[i2].Mass;
				let C2 = PhysicsObject[i2].Charge;
				let DistancePow2 = Math.pow(DistX,2) + Math.pow(DistY,2) + Math.pow(DistZ,2);
				let Distance = Math.sqrt(DistancePow2);
				let Force = (ElectricConst*C1*C2)/DistancePow2;
				if(Distance < 1)
				{
					if(C1*C2 < 0)
					{
						Force*=-1	
					}
				}
				ForceX += (DistX/Distance)*Force;
				ForceY += (DistY/Distance)*Force;
				ForceZ += (DistZ/Distance)*Force;
			}
		}
		PhysicsObject[i].Speed[0] += ForceX/M1*TimeStep;
		PhysicsObject[i].Speed[1] += ForceY/M1*TimeStep;
		PhysicsObject[i].Speed[2] += ForceZ/M1*TimeStep;	
	}

	for(let i = 0; i < POI;i++)
	{
		let nX = PhysicsObject[i].Cords[0] + PhysicsObject[i].Speed[0]*TimeStep;
		let nY = PhysicsObject[i].Cords[1] + PhysicsObject[i].Speed[1]*TimeStep;
		let nZ = PhysicsObject[i].Cords[2] + PhysicsObject[i].Speed[2]*TimeStep;
		
		if(nX > CubeSideLenght || nX < -CubeSideLenght)
		{
			if(PhysicsObject[i].Swich == 0)
			{
				PhysicsObject[i].Speed[0]*=-1;
				PhysicsObject[i].Swich = 1;
			}
		}
		else
		{
			PhysicsObject[i].Swich = 0;
		}

		if(nY > CubeSideLenght || nY < -CubeSideLenght)
		{
			if(PhysicsObject[i].Swich == 0)
			{
				PhysicsObject[i].Speed[1]*=-1;
				PhysicsObject[i].Swich = 1;
			}
		}
		else
		{
			PhysicsObject[i].Swich = 0;
		}

		if(nZ > CubeSideLenght || nZ < -CubeSideLenght)
		{
			if(PhysicsObject[i].Swich == 0)
			{
				PhysicsObject[i].Speed[2]*=-1;
				PhysicsObject[i].Swich = 1;
			}
		}
		else
		{
			PhysicsObject[i].Swich = 0;
		}
	}

	for(let i = 0;i < POI;i++)
	{
		PhysicsObject[i].Cords[0] += PhysicsObject[i].Speed[0]*TimeStep;
		PhysicsObject[i].Cords[1] += PhysicsObject[i].Speed[1]*TimeStep;
		PhysicsObject[i].Cords[2] += PhysicsObject[i].Speed[2]*TimeStep; 
	}


}

function PhysicsRun(Time,TimeSlice)
{
	for(let i = 0; i < Time/TimeSlice;i++)
	{
		PhysicsRunStep(TimeSlice);
	}
}


var MVP = mat4.create();
var ProjectionViewMatrix = mat4.create();
var WorldMatrix = mat4.create();
var WorldViewMatrix = mat4.create();
var NormalMatrix = mat3.create();

var CameraEye = [0,0,0];
var CameraCenter = [0,0,-1];
var CameraUp = [0,1,0];

function TranslateCamera(X,Y,Z)
{
	CameraEye[0] += X;
	CameraEye[1] += Y;
	CameraEye[2] += Z;
	CameraCenter[0] +=X;
	CameraCenter[1] +=Y;
}

var MaxCharge = 0;
var MinCharge = 0;

var MaxMass = 0;

function FindMinMax()
{
	for(let i = 0; i < POI;i++)
	{
		if(MaxCharge < PhysicsObject[i].Charge)
		{
			MaxCharge = PhysicsObject[i].Charge;
		}
		if(MinCharge > PhysicsObject[i].Charge)
		{
			MinCharge = PhysicsObject[i].Charge;
		}

		if(MaxMass < PhysicsObject[i].Mass)
		{
			MaxMass = PhysicsObject[i].Mass;
		}

	}
}

function RenderFrame()
{
	mat4.lookAt(ViewMatrix,CameraEye,CameraCenter,CameraUp);
	mat4.multiply(ProjectionViewMatrix,ProjectionMatrix,ViewMatrix);
	gl.clear(gl.COLOR_BUFFER_BIT);
	FindMinMax();

	for(let i = 0; i < POI;i++)
	{
		mat4.identity(WorldMatrix);

		mat4.translate(WorldMatrix,WorldMatrix,[PhysicsObject[i].Cords[0],
		PhysicsObject[i].Cords[1],PhysicsObject[i].Cords[2]]);
	
		mat4.multiply(WorldViewMatrix,WorldMatrix,ViewMatrix);
		mat3.fromMat4(NormalMatrix,WorldViewMatrix);
		
		mat4.multiply(MVP,ProjectionViewMatrix,WorldMatrix);


		
		gl.uniformMatrix4fv(MvpUniform,false,MVP);
		
		let RedVal = 0;
		let BlueVal = 0;
		if(PhysicsObject[i].Charge < 0)
		{
			BlueVal = (PhysicsObject[i].Charge/MinCharge);
		}
		else
		{
			RedVal = PhysicsObject[i].Charge/MaxCharge
		}

		gl.uniform3f(ColorUniform,RedVal,0,BlueVal);
		
		gl.uniformMatrix4fv(WorldViewMatrixUniform,false,WorldViewMatrix);
		gl.uniformMatrix3fv(NormalMatrixUniform,false,NormalMatrix);
		gl.drawElements(gl.TRIANGLES,IndexNum,gl.UNSIGNED_SHORT,0);
	}
}







