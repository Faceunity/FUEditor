(function(){ 
	/*
	以下的注释用来给编辑器提供参数。格式为：
		gparam或mparam 名字 控件信息
	gparam代表全局参数，mparam代表材质参数。
	控件信息是用JSON写的，一共有三大类控件：
		{"type":"edit"}：字符串参数用的编辑框，可以用"default_value"提供默认值
		{"type":"texture"}：贴图参数用的按钮，可以用"default_value"提供默认值
		{"type":"slider"}：数值参数用的条儿，可以用"default_value"提供默认值，"min"和"max"提供最小/最大值
	参数名称其实是可以用中文的，但是改了参数名的话原先调的值就没了，所以最好还是用“代码状”的名字比较好，
	一旦写定就不要随便改，宁可在旁边加注释。
	*/
	//物体名，别忘了设哦～ 千万别忘了设哦～～ 如果设成了"unnamed"可是会打警告的哦～～～
	//@#gparam name {"type":"edit","default_value":"unnamed"}
	///////////////////////////
	/*
	以下是光源参数。出于节省起见，现在只用了两个光。主光L0负责主要的照明，补光L1把侧面补亮。只有主光会产生高光。
	将来有需求的话可以把shader里L2的注释去掉，加个背光什么的。
	现在的光源都没有产生阴影。有需求请联系我们，在系统里加一下。
	*/
	//高光颜色r
	//@gparam ambient_light_intensity {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam tex_light_probe {"type":"texture","default_value":"beach_1_4.jpg"}
	//@gparam light_probe_intensity {"type":"slider","min":0,"max":1,"default_value":0.1}
	//@gparam envmap_shift {"type":"slider","min":0,"max":1,"default_value":0.75}
	//@gparam envmap_fov {"type":"slider","min":0.5,"max":5,"default_value":1.0}

	//主光的航向角，也就是左右转的那个角
	//@gparam L0_yaw {"type":"slider","min":0,"max":1,"default_value":0}
	//主光的俯仰角，也就是上下转的那个角
	//@gparam L0_pitch {"type":"slider","min":-1,"max":1,"default_value":0}
	//主光的颜色，三个通道
	//@gparam L0 {"type": "color","default_r": 1,"default_g": 1,"default_b": 1}
	//主光的强度，用对数调还是为了方便
	//@gparam L0Intensity {"type":"slider","min":-4,"max":4,"default_value":0}
	//@gparam hasShadow {"type":"slider","min":0,"max":1,"default_value":0.0}
	//@gparam shadow_bias {"type":"slider","min":0,"max":1,"default_value":0.2}

	//半透明算法阈值，设为1.0适合普通简单的半透明物体，设为0.5适合头发
	//@gparam alphaThreshold {"type":"edit","default_value":"1.0"}
	//是否固定位置,不跟随人脸运动，固定位置如下fixed_x/y/z
	//在没有人脸的时候的固定位置
	//@gparam is_fix_x {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam is_fix_y {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam is_fix_z {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam fixed_x {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_y {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_z {"type":"slider","min":0,"max":4000,"default_value":1036}
	//在没有人脸的时候是否绘制
	//@gparam isnofacerender {"type":"slider","min":0,"max":1,"default_value":1}

	//@gparam use_fov {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam camera_fov {"type":"slider","min":5,"max":90,"default_value":20}
	//控制旋转的幅度，rot_weight=1完全按照人头旋转，rot_weight=0不跟人头旋转
	//@gparam rot_weight {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam expr_clamp {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam follow {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam follow_withbg {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam tongue {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam enable_physics {"type":"slider","min":0,"max":1,"default_value":1}
	///////////////////////////
	//以下是材质参数
	/*物体的类型,一是镂空,[0,0.25]；
				二是会完全随着脑袋旋转和缩放,(0.25,0.5]；
				三是权重控制旋转的幅度（前提是有对应主obj的weight.png,例如aa.obj对应的权重贴图是aa_weight.png）,(0.5,0.75]；
				四是只会跟着脑袋位移变化和大小的缩放，例如身体(0.75,1]。
	*/
	//@mparam obj_type {"type":"slider","min":0,"max":1,"default_value":0.3}

	//@mparam tex_albedo {"type":"texture","default_value":"white.png","isTex":1}
	//@mparam tex_normal {"type":"texture","default_value":"grey.png"}
	//@mparam tex_ao {"type":"texture","default_value":"white.png"}
	//@mparam tex_specular {"type":"texture","default_value":"black.png"}
	//@mparam tex_emission {"type":"texture","default_value":"black.png"}

	// param
	//@mparam normal_strength {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam ao_intensity  {"type":"slider","min":0,"max":1,"default_value":1.0}
	//@mparam diffuse_intensity  {"type":"slider","min":0,"max":2,"default_value":1.0}
	//@mparam diffuse_wrap       {"type":"slider","min":0,"max":1,"default_value":0.0}
	//@mparam diffuse_light_add  {"type":"slider","min":-1,"max":1,"default_value":0.0}
	//@mparam specular_intensity {"type":"slider","min":0,"max":2,"default_value":1.0}
	//@mparam material_shiness_max {"type":"slider","min":0,"max":200,"default_value":100}
	//@mparam material_shiness_min {"type":"slider","min":0,"max":200,"default_value":15}
	//@mparam emission_intensity {"type":"slider","min":0,"max":2,"default_value":0.0}

	//@mparam is_eye {"type":"slider","min":0,"max":1,"default_value":0}
	//这个材质是不是头发的标记
	//@mparam is_hair {"type":"slider","min":0,"max":1,"default_value":0}
	
	//@mparam multi_skel {"type":"slider","min":0,"max":1,"default_value":1}


	/*
	编辑器保存的结果会存放在"globals.json"和"materials.json"两个文件中。
	但在保存之前这两个文件是不存在的，所以要考虑到ReadFromCurrentItem失败的情况。
	"globals.json"直接就是把所有的全局参数放一起的一个对象：
		{
			"参数名":"值",
			……
		}
	"materials.json"的结构是：
		{
			"材质名":{
				"参数名":"值",
				……
			},
			"材质名":{
				……
			},
			……
		}
	"材质名"和blendshape.drawcalls[i].name是一一对应的。
	*/
    /////////////////////////util
    var CopySign = function (a, b) {
        var sign = 1;
        if (b < 0) sign = -1;
        return Math.abs(a) * sign;
    }

    var Quat2Euler = function (quat) {
        var x = quat[0]; var y = quat[1]; var z = quat[2]; var w = quat[3];
        // x-axis rotation
        var sinr = 2.0 * (w * x + y * z);
        var cosr = 1.0 - 2.0 * (x * x + y * y);
        var rx = Math.atan2(sinr, cosr);

        // y-axis rotation
        var sinp = 2.0 * (w * y - z * x);
        var ry = 0;
        if (Math.abs(sinp) >= 1)
            ry = CopySign(Math.PI * 0.5, sinp); // use 90 degrees if out of range
        else
            ry = Math.asin(sinp);

        // z-axis rotation
        var siny = 2.0 * (w * z + x * y);
        var cosy = 1.0 - 2.0 * (y * y + z * z);
        var rz = Math.atan2(siny, cosy);

        var rta = 180.0 / Math.PI;
        rx *= rta; ry *= rta; rz *= rta;
        return [rx, ry, rz];
    }
	
	//ex 16,
	var swaplst = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,  17,18,  20,22,  23,24,  25,26,  27,28,  29,30,  31,32,  44,45,
		47,49, 50,52, 53,55 ];

    // axis = 0 is x, axis = 1 is y, axis = 2 is z
    // opt = 0 means less, opt = 1 means greater
    var isRotationTriggered = function (axis, value, opt, params) {
        var quat = params.rotation;
        var degree = Quat2Euler(quat)[axis];
        switch (opt) {
            case 0:
                if (degree < value)
                    return true;
                break;
            case 1:
                if (degree > value)
                    return true;
                break;
        }
        return false;
    }

	var isActionTriggered=function (actionname, params){
		if(params.expression==undefined || params.rotation==undefined)return false;
		switch (actionname){

			case "taimei":
				return params.expression[16] >= 0.4 || params.expression[17] >= 0.4 || params.expression[18] >= 0.4;
				break;

			case "taizuijiao_zuo":
				return params.expression[24] >= 0.4 || params.expression[28] >= 0.4;
				break;

			case "taizuijiao_you":
				return params.expression[23] >= 0.4 || params.expression[27] >= 0.4;
				break;

			case "nu":
				return params.expression[42] >= 0.5;
				break;

			case "zuixing_o":
				return params.expression[38] >= 0.4;
				break;

			case "zuixing_a":
				return params.expression[21] >= 0.3;
				break;

			case "zuixing_du":
				return params.expression[39] >= 0.5;
				break;

			case "zuixing_min":
				return params.expression[33] >= 0.5 || params.expression[34] >= 0.5;
				break;

			case "zuixing_guqi":
				return params.expression[43] >= 0.5;
				break;

			case "biyan_zuo":
				return params.expression[1] >= 0.5;
				break;

			case "biyan_you":
				return params.expression[0] >= 0.5;
				break;

			case "zhuantou_zuo":
				return params.rotation[1] >= 0.1;
				break;

			case "zhuantou_you":
				return params.rotation[1] >= 0.1;
				break;

			default:
				return false;
				break;
		}
	};
	var quaterionSlerp=function(p,q,t){
		var sum = 0;
		for(var i =0;i<4;i++)sum+=p[i]*q[i];
		var theta = Math.acos(sum);
		var ws = Math.sin(theta);
		var w1 = Math.sin((1.0 - t)*theta)/ws;
		var w2 = Math.sin(t * theta)/ws;
		var qret = new Array();
		sum = 0;
		for(var i =0; i < 4; i++){
			qret[i] = w1 * p[i] + w2 * q[i];
			sum += qret[i] * qret[i];
		}
		sum = Math.sqrt(sum);
		for(var i =0; i < 4; i++)qret[i]/=sum;
		return qret;
	}
	var AddVec3 = function (a, b) {
	    var ret = [0, 0, 0];
	    ret[0] = a[0] + b[0];
	    ret[1] = a[1] + b[1];
	    ret[2] = a[2] + b[2];
	    return ret;
	}
	var SubVec3 = function (a, b) {
	    var ret = [0, 0, 0];
	    ret[0] = a[0] - b[0];
	    ret[1] = a[1] - b[1];
	    ret[2] = a[2] - b[2];
	    return ret;
	}
	var InvVec3 = function (a) {
	    return [-a[0], -a[1], -a[2]];
	}
	//////////////////////////////
	
	var TextureMapping = {
		"grey.png":"vec3(0.5)",
		"white.png":"vec3(1.0)",
		"black.png":"vec3(0.0)",
		"blue.png":"vec3(0.0,0.0,1.0)",
		"zero.png":"vec3(0.0)"
	};
	
	function AttachTexture(matex,tex_map,name,uniform,macroname,defaulttex) {
		var marcro="#define "+macroname+"\n";
		for(var prop in TextureMapping) {
			if(defaulttex==prop) 
				marcro+="vec3 "+macroname.toLowerCase()+"="+TextureMapping[prop]+";\n";
		}
		if(matex[name]==undefined || tex_map[matex[name]]==undefined) {
			return marcro;
		} else {
			if(matex[name]==defaulttex)
				return marcro;
			else
				uniform[name]=tex_map[matex[name]];
		}
		return "";
	}

	var tracked = 0;

	var globals=JSON.parse(FaceUnity.ReadFromCurrentItem("globals.json")||"{}");
	var materials_json=JSON.parse(FaceUnity.ReadFromCurrentItem("materials.json")||"{}");
	//下面是正常的三维道具绘制流程
	var s_vert_shader=FaceUnity.ReadFromCurrentItem("3d_vert.glsl");
	var s_frag_shader = FaceUnity.ReadFromCurrentItem("3d_frag.glsl");

    //骨骼动画相关
	var a_vert_shader = FaceUnity.ReadFromCurrentItem("anim_dq_vert.glsl");
	var fbxmeshs = JSON.parse(FaceUnity.ReadFromCurrentItem("meshes.json"));
	
	//Shadow
	var shadowMap_fs = FaceUnity.ReadFromCurrentItem("shadow_map_fs.glsl");
	var screen_fs = FaceUnity.ReadFromCurrentItem("screen_fs.glsl");
	var L0_view = null;
	var L0_proj = null;
	var L0_mvp = null;
	var OrthoLH = function(left, right, bottom, top, zNear, zFar){
		var mat = [
			2.0 / (right - left), 0.0, 0.0, 0.0,
			0.0, 2.0 / (top - bottom), 0.0, 0.0,
			0.0, 0.0, 2.0 / (zFar - zNear), 0.0,
			(left + right) / (left - right), (top + bottom) / (bottom - top), (zFar + zNear) / (zNear - zFar), 1.0
		];
		return mat;
	}
	var Vec3Add = function(x, y){
		return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
	};
	var Vec3Sub = function(x, y){
		return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
	};
	var Vec3Normalize = function(x){
		var s = 1.0 / Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
		return [x[0] * s, x[1] * s, x[2] * s];
	}
	var Vec3Dot = function(x, y){
		return x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
	}
	var Vec3Cross = function(x, y){
		var z = [];
		z[0] = x[1] * y[2] - x[2] * y[1];
		z[1] = x[2] * y[0] - x[0] * y[2];
		z[2] = x[0] * y[1] - x[1] * y[0];
		return z;
	}
	var LookAtLH = function(eye, at, up)
	{
		var zaxis = [], xaxis = [], yaxis = [];
		var mat = [];
		zaxis = Vec3Normalize(Vec3Sub(at, eye));
		xaxis = Vec3Normalize(Vec3Cross(up, zaxis));
		yaxis = Vec3Normalize(Vec3Cross(zaxis, xaxis));

		mat[0] = xaxis[0]; mat[1] = yaxis[0]; mat[2] = zaxis[0]; mat[3] = 0.0;
		mat[4] = xaxis[1]; mat[5] = yaxis[1]; mat[6] = zaxis[1]; mat[7] = 0.0;
		mat[8] = xaxis[2]; mat[9] = yaxis[2]; mat[10] = zaxis[2]; mat[11] = 0.0;
		mat[12] = -Vec3Dot(xaxis, eye);
		mat[13] = -Vec3Dot(yaxis, eye);
		mat[14] = -Vec3Dot(zaxis, eye);
		mat[15] = 1.0;
		return mat;
	};

    //全局旋转和缩放
	var rot_delta = 0.0;
	var scale_delta = 0.0;
	var globalRotationQuat = [0.0, 0.0, 0.0, 1.0];
	var rot_ex = [1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1];
	var scale_ex = 1.0;
	
	var isFollow = globals.follow;
	var followWithBg = globals.follow_withbg;
	var nf_fixed_x = globals.is_fix_x;
	var nf_fixed_y = globals.is_fix_y;
	var nf_fixed_z = globals.is_fix_z;
	var nf_nface = globals.isnofacerender;
	var nf_usefov = globals.use_fov;
	var nf_cfov = globals.camera_fov;
	
	var bigtexjson = JSON.parse(FaceUnity.ReadFromCurrentItem("3d_bigtex_desc.json")||"{}");
	var bigtexcnt = 0;
	var bigtex = new Array();
	if(bigtexjson["bigtexs"]!=undefined){
		for(var i=0;i<bigtexjson["bigtexs"].length;i++){
			bigtex[bigtexcnt] = FaceUnity.LoadTexture(bigtexjson["bigtexs"][i],0);
			bigtexcnt++;
		}
	}
	console.log("bigtexcnt",bigtexcnt);
	var user_frame_id=0;
	var now = Date.now();
	var bsCount = 56;
	var expression=[]; for(var i=0; i<bsCount; i++) expression.push(0);
	var focal_length = 303.64581298828125;
	//背景动画
	//var bg_board=JSON.parse(FaceUnity.ReadFromCurrentItem("desc.json"));
	//var tex_bg=FaceUnity.LoadTexture("bg.jpg");
	//var tex_joker = FaceUnity.LoadTexture("joker.png");
	/*
	从这里开始开始涉及到编辑器中需要操作的参数。为了加快编辑速度，需要在script.js中提供动态重载的接口，
	所以这里在初始化时并没有设置参数值，而是抽象出了一个ReloadThingsForEditor函数供编辑器随时调用。
	*/
	var g_params={
		is3DFlipH: 0.0,
		weightOffset:[0.0,0.0,0.0],
		matp:[0.0,0.0,0.0,1.0],
		rotation_mode: -1,
		baked: 0,
		isFlipExpr: 0.0,
		fix_rotation: 0,
		use_vtf: 1,
		support_vtf:-1,
		isFlipTrack: 0.0,
		isFlipLight: 0.0
	};
	var faces = [];
	var tex_map={};
	var SCALE = 1;
	var tex_light_probe;
	var L0_dir,L1_dir,L0_color,L1_color;
	//接下来是一些工具函数
	/**
	* \brief 给每个参数提供默认值的辅助函数。注意注释里的"default_value"只在UI上起作用，现在真的默认值还得在JS里再写一次。
	* \param v0 参数值
	* \param v1 默认值
	*/
	var V=function(v0,v1){
		return v0==undefined?v1:v0;
	};
	var Vs = function (v0, v1) { return v0 == undefined ? v1 : v0.slice(); };
	/**
	* \brief 根据欧拉角计算方向向量的辅助函数。用来帮助调节光源方向
	* \param yaw 航向角
	* \param pitch 俯仰角
	*/
	var CreateDirection=function(yaw,pitch){
		yaw*=2.0*3.1415926;
		pitch*=0.5*3.1415926;
		return [Math.cos(pitch)*Math.sin(yaw),-Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)];
	};
	/**
	* \brief 把颜色三通道和对数光强搞在一起的辅助函数
	* \param R 红色
	* \param G 绿色
	* \param B 蓝色
	* \param log_intensity 对数光强
	*/
	var CreateColor=function(R,G,B,log_intensity){
		var L=Math.exp(log_intensity);
		return [L*R,L*G,L*B]
	};
	/// \brief 提供给编辑器，用来重新初始化参数的函数
	var ReloadThingsForEditor=function(){
		//基本就是一通乱算，把适合图形界面调节的参数转化为适合shader使用的参数
		SCALE=Math.exp(V(globals.log_scale,0));
		L0_dir=CreateDirection(V(globals.L0_yaw,0),V(globals.L0_pitch,0));
		L1_dir=CreateDirection(V(globals.L1_yaw,0),V(globals.L1_pitch,0));
		L0_color=CreateColor(V(globals.L0[0],1),V(globals.L0[1],1),V(globals.L0[2],1), V(globals.L0Intensity,0));
		L1_color=CreateColor(V(globals.L1_R,1),V(globals.L1_G,1),V(globals.L1_B,1), V(globals.L1Intensity,-2));
		//编辑器在改了贴图之后会自动把文件转换成webp拷贝到工作区里，但是并不会帮着调LoadTexture，所以这里要调一下
		tex_light_probe=FaceUnity.LoadTexture(V(globals.tex_light_probe,"beach_1_4.jpg"),0,gl.CLAMP_TO_EDGE);
	};
	//就算在没有编辑器的时候，总也还是要初始化一次的
	ReloadThingsForEditor();
	//背景不动
	var bg_board={
		"type":"billboard_ex2",
		"base_vertex":-1,
		"enable_depth_test":1,
		//"shader":FaceUnity.ReadFromCurrentItem("bg.glsl"),
	};

	var AnimCounter={
		names:{},
		count:0,
		total:0,
		finish:function(name){
			if(this.names[name])return;
			this.names[name] = 1;
			this.count++;
		},
		hasFinish:function(){
			console.log("3d finish cnt",this.count);
			return this.count >= 1 ? 1:0;
		},
		allFinish:function(){
			console.log("3d finish cnt",this.count);
			return (this.count >= this.total && this.total!=0) ? 1 : 0;
		}
	}

	var deepCopy =function(p, c){
		var c = c || {};
		for (var i in p) {
			if (typeof p[i] === 'object') {
				c[i] = (p[i].constructor === Array) ? [] : {};
				deepCopy(p[i], c[i]);
			} else {
				c[i] = p[i];
			}
		}
		return c;
	}

	var Mesh = function(dc,anim){
	    deepCopy(dc, this);
	    if (anim != null && anim != undefined)
	        deepCopy(anim, this);
		this.itemtype=3;
		if(this.betriggered==undefined)this.isActive = true;
		this.has_tex_albedo_frames = true;
		if(this.tex_albedo_frames==undefined){
			this.tex_albedo_frames = [{}];
			this.has_tex_albedo_frames = false;
		}
		this.isFinished = 0;
	}
	Mesh.prototype.switchState = function(lst,now){
		if(this.betriggered || this.isFinished)return;
		if(lst==0 && now==1){
			if(this.triggerstart=="newface")this.isActive = true;
		}
		if(lst==1 && now==0){
			if(this.triggerstart=="alwaysrender")this.isActive = true;
		}
	}
	Mesh.prototype.stopThis = function(now, animCounter){
		console.log("stopThis:",this.name);
		if(!this.triggered)return;
		this.triggered =0;
		this.frame_id = 0;
		this.last = now;
		this.activateNext();
		if(this.triggerstart=="newface"||this.triggerstart=="alwaysrender"){
			this.isActive = false;
		}
		if(this.isactiveonce==1){
			this.isFinished=1;
			animCounter.finish(this.name);
		}
	}
	Mesh.prototype.stop = function (now, animCounter) {
	    this.stopThis(now, animCounter);
	}
	Mesh.prototype.activateNext = function(){
		if(this.triggerNextNodesRef==undefined || this.triggerNextNodesRef.length==0)return;
		for(var idx in this.triggerNextNodesRef){
			if(this.triggerNextNodesRef[idx].isFinished==0){
				this.triggerNextNodesRef[idx].isActive=true;
			}
		}
	}
	Mesh.prototype.triggerThis=function(now){
		if(this.isFinished==1)return;
		this.triggered = 1;
		this.frame_id = 0;
		this.last = now;
		this.isActive = true;
		console.log("thriggerThis3d",this.name);
	}
	Mesh.prototype.triggerStartEvent = function (params, now, isNoneFace) {
		if(this.triggered || !this.isActive)return;
		if((!isNoneFace && (this.triggerstart=="newface" || (this.triggerstart=="faceaction" && isActionTriggered(this.startaction,params))))
			||(isNoneFace && this.triggerstart=="alwaysrender")){
				this.triggerThis(now);
		}
	}
	Mesh.prototype.updateEvent = function(params,now){
		var matex=(materials_json[this.name]||{});

		var rotation = params.rotation.slice();

		/*if(V(globals.rot_weight,1.0) < 0.05){
			rotation = [0,0,0,1];
		}else if(V(globals.rot_weight,1.0) < 0.95){
			var delta = [-rotation[0],-rotation[1],-rotation[2],1.0-rotation[3]];
			var w=1.0 - globals.rot_weight;
			rotation=[w*delta[0]+rotation[0],w*delta[1]+rotation[1],w*delta[2]+rotation[2],w*delta[3]+rotation[3]];
		}*/
		/*
		if(V(globals.rot_weight,1.0) < 0.01){
			rotation = [0,0,0,1];
		}else if(V(globals.rot_weight,1.0) < 0.99){
			if(Math.abs(rotation[0])<0.00001 && Math.abs(rotation[1])<0.00001 && Math.abs(rotation[2])<0.00001 && Math.abs(rotation[3] - 1.0)<0.00001){
				rotation = [0,0,0,1];
			}else{
				rotation = quaterionSlerp([0,0,0,1], rotation, V(globals.rot_weight,1.0)).slice();
			}
		}
		*/
		var L0_scale = -300.0;
		L0_view = LookAtLH([L0_scale * L0_dir[0], L0_scale * L0_dir[1], L0_scale * L0_dir[2]], L0_dir, [0.0, 1.0, 0.0]);
		var len = 210.0;
		L0_proj = OrthoLH(-len, len, -len, len, -100.0, 600);
		L0_mvp = FaceUnity.MatrixMul(L0_view, L0_proj);

		var trans = [0, 0, 0];
		trans[0] = this.translate[0];
		trans[1] = this.translate[1];
		trans[2] = -this.translate[2];

		var mat = FaceUnity.MatrixTranslate(AddVec3(params.translation, trans));
		mat = FaceUnity.MatrixMul(rot_ex, mat);
		mat = FaceUnity.MatrixMul(FaceUnity.MatrixTranslate(InvVec3(trans)), mat);

		var mat_cam = FaceUnity.MatrixTranslate(AddVec3(params.translation, trans));
		mat_cam = FaceUnity.MatrixMul(rot_ex, mat_cam);
		mat_cam = FaceUnity.MatrixMul(FaceUnity.MatrixTranslate(InvVec3(trans)), mat_cam);

		/*if(!params.animation){
			var mat_t = FaceUnity.CreateViewMatrix(
				[-rotation[0], -rotation[1], -rotation[2], rotation[3]],
				[0, 0, 0]);
			var mat_cam_t = FaceUnity.CreateViewMatrix(
				[0, 0, 0, 1],
				[0, 0, 0]);
	
			mat = FaceUnity.MatrixMul(mat_t, mat);
			mat_cam = FaceUnity.MatrixMul(mat_cam_t, mat_cam);
		}*/


		this.mat_eye = [1,0,0,0,
						0,1,0,0,
						0,0,1,0,
						0,0,0,1];
		if(V(matex.is_eye,this.is_eye)){
			this.mat_eye = FaceUnity.CreateEyeMatrix(
					[this.P_center[0]*SCALE,this.P_center[1]*SCALE,-this.P_center[2]*SCALE],
					[params.pupil_pos[0]*V(globals.eyeRscale,1.5),params.pupil_pos[1]]);
		}
		this.use_custom_gl_states=1;
		this.use_OIT_shader=1;

		if(V(matex.obj_type,0.3)>0.75){
			var center=[3.329,-90.223,-4.394];
			var mat2=FaceUnity.MatrixMul(
				[
					1,0,0,0,
					0,1,0,0,
					0,0,1,0,
					center[0],center[1],center[2],1
				],mat
			);
			mat=FaceUnity.CreateViewMatrix(
				[0,0,0,1],
				[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]]);
		}
		this.rotation = rotation;
		this.mat = mat;
		this.mat_cam = mat_cam;
		if(this.triggered){
			var elapse = now - this.last;
			this.frame_id = parseInt(elapse * this.fps / 1000);
			if(this.force_frame_id!=undefined && this.force_frame_id>=0)this.frame_id = this.force_frame_id;
		}
	}
	Mesh.prototype.triggerEndEvent = function (params, now, isNoneFace, animCounter) {
		if(this.triggered!=1)return;
		if(!isNoneFace){
			if(this.triggerend=="newface"){
			    this.stop(now, animCounter); return;
			}
			if(/*action end*/this.triggerend=="faceaction" && isActionTriggered(this.endaction,params)){
			    this.stop(now, animCounter);
			}
			if(this.triggerstart=="alwaysrender")return;

			if(/*action keep*/this.triggerstart=="faceaction" && this.needkeepfaceaction== 1 && !isActionTriggered(this.startaction,params)){
			    this.stop(now, animCounter);
			}
		}else{
			if(this.triggerstart!="alwaysrender")return;
		}

		if(/*loop end*/this.looptype=="loopcnt" && ((this.frame_id +1) >= this.tex_albedo_frames.length * this.loopcnt)){
		    this.stop(now, animCounter);
		}
	}

	Mesh.prototype.renderEvent = function (blendshape, params, pass, shader, animation, fid) {
	    if (!this.triggered || !this.isActive) return;
		var matex=(materials_json[this.name]||{});
		if(this.has_tex_albedo_frames==true){
			var albedo = bigtex[this.tex_albedo_frames[this.frame_id % this.tex_albedo_frames.length].bigtexidx];
			var lbrt = this.tex_albedo_frames[this.frame_id % this.tex_albedo_frames.length].lbrt;
		}else{
			var albedo = tex_map[V(matex.tex_albedo,this.mat.tex)];
			var lbrt = [0.0,0.0,1.0,1.0];
		}
		var shaderUse = s_vert_shader;
		var mat_proj;
		if(V(globals.use_fov,0)>0.5){
			mat_proj = FaceUnity.CreateProjectionMatrix_FOV(V(globals.camera_fov,20));
		}else{
			if(globals.follow)
				mat_proj = FaceUnity.CreateProjectionMatrix();
			else {
				mat_proj = FaceUnity.CreateProjectionMatrix_FOV(20,10,30000);
				if(tracked<0.5){
					//console.log("js: use rmode ", g_params["rotation_mode"]);
					var rmode = g_params["rotation_mode"];
					if (rmode == -1)
						rmode = 0;
					mat_proj = FaceUnity.CreateProjectionMatrix_FOV(20,10,30000,rmode);
				}
			}
		}

		var shaderParams = {
		    scales: [this.scales[0] * SCALE, this.scales[1] * SCALE, this.scales[2] * SCALE],
		    scale_e: scale_ex,
		    mat_view: this.mat,
		    mat_cam: this.mat_cam,
		    is_eye: V(matex.is_eye,this.is_eye),
		    mat_eye: this.mat_eye,
		    quatR1:[this.rotation[0],this.rotation[1],this.rotation[2],this.rotation[3]],
		    quatT1: [0, 0, 0],//[params.translation[0],params.translation[1],params.translation[2],1],
		    quatR2: [0, 0, 0, 1],
		    quatT2: [0, 0, 0],//[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]],
		    obj_type: V(matex.obj_type, 0.3),
		    mat_proj: mat_proj,
		    tex_albedo: albedo,
		    lbrt: lbrt,
			/*
			tex_mask: tex_map[V(matex.tex_mask, "grey.png")],
		    tex_normal: tex_map[V(matex.tex_normal, "grey.png")],
		    tex_smoothness: tex_map[V(matex.tex_smoothness, "grey.png")],
		    tex_ao: tex_map[V(matex.tex_ao, "grey.png")],
		    tex_specular: tex_map[V(matex.tex_specular, "black.png")],
		    tex_emission: tex_map[V(matex.tex_emission, "black.png")],
			*/
		    normal_strength: V(matex.normal_strength, 0.0),

		    ambient_intensity: V(matex.ambient_intensity, 0.0),
			ao_intensity: V(matex.ao_intensity, 1.0),
			diffuse_intensity: V(matex.diffuse_intensity, 1.0),
			diffuse_wrap: V(matex.diffuse_wrap, 0.0),
			diffuse_light_add: V(matex.diffuse_light_add, 0.0),
			shininess_wrap: V(matex.shininess_wrap, 0.0),
			specular_intensity: V(matex.specular_intensity, 1.0),
			normal_intensity: V(matex.normal_intensity, 1.0),
			emission_intensity: V(matex.emission_intensity, 0.0),
			selfillumination_intensity: V(matex.selfillumination_intensity, 0.0),
			reflective_intensity: V(matex.reflective_intensity, 0.0),
			multiply_intensity: V(matex.multiply_intensity, 1.0),
			transparent_intensity: V(matex.transparent_intensity, 1.0),

			material_shiness_max: V(matex.material_shiness_max, 128.0),
			material_shiness_min: V(matex.material_shiness_min, 15.0),
			fresnel_f0: V(matex.fresnel_f0, 0.04),
			fresnel_exponent: V(matex.fresnel_exponent, 5.0),

			enable_edge_dark: V(matex.enable_edge_dark, 0.0),
			SpecularColor: [V(matex.spec_r, 255.0)/255.0, V(matex.spec_g, 255.0)/255.0, V(matex.spec_b, 255.0)/255.0],
			EdgesDarkeningColor: [V(matex.EdgesDarkeningColor_r, 255.0)/255.0, V(matex.EdgesDarkeningColor_g, 255.0)/255.0, V(matex.EdgesDarkeningColor_b, 255.0)/255.0],
			edgeDark_rimLight: [V(matex.edgeDark_rimLight_x, 0.0), V(matex.edgeDark_rimLight_y, 0.0), V(matex.edgeDark_rimLight_z, 1.0), V(matex.edgeDark_rimLight_w, 1.0)],

			tex_light_probe: tex_light_probe,
		    light_probe_rotate: V(globals.light_probe_rotate, 0.25),
		    light_probe_intensity: V(globals.light_probe_intensity, 0.1),
		    envmap_shift: V(globals.envmap_shift, 0.75),
		    envmap_fov: V(globals.envmap_fov, 1.0),
			spec_color: [V(matex.spec_r, 255.0)/255.0, V(matex.spec_g, 255.0)/255.0, V(matex.spec_b, 255.0)/255.0],

		    Ka: V(matex.Ka, 0.0), Kd: V(matex.Kd, 0.3), Ks: V(matex.Ks, 0.2), Kr: V(matex.Kr, 0.0),
		    roughness: V(matex.roughness, 0.5),
		    has_tex_smoothness: V(matex.has_tex_smoothness, 0.0),
		    is_hair: pass > 0,
		    ior: V(matex.ior, 1.33),
		    F0: V(matex.F0, 1.0),

		    ambient_light_intensity: V(globals.ambient_light_intensity, 0.0),
		    L0_dir: L0_dir, L0_color: L0_color,
		    L1_dir: L1_dir, L1_color: L1_color,
		    isFlipH: g_params['is3DFlipH'],
		    weightOffset: g_params['weightOffset'],
		    //L2_dir:[0.25,0,-1],L2_color:[2.0,2.0,2.0],
		    HasShadow: globals.hasShadow > 0.5 ? 1.0 : 0.0,
		    L0_MVP: L0_mvp,
		    tex_shadowMap0: globals.hasShadow > 0.5 ? FaceUnity.GetShadowMap() : 0,
			SHADOWMAP_SIZE:FaceUnity.GetShadowMapSize(),
			bias:globals.shadow_bias * 0.1,
		};
		
		
		shader = AttachTexture(matex,tex_map,"tex_mask",shaderParams,"TX_MASK","grey.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_normal",shaderParams,"TX_NORMAL","grey.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_smoothness",shaderParams,"TX_SMOOTH","grey.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_ao",shaderParams,"TX_AO","white.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_specular",shaderParams,"TX_SPEC","black.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_emission",shaderParams,"TX_EMIT","black.png") + shader;

		if (animation != null) {
		    shaderUse = a_vert_shader;
		    shaderParams.fid = fid;
		    shaderParams.animating = animation.animating;
		    if (animation.use_vtf == 1)
		        shaderParams.tex_deform = animation.tex_deform;
		    else {
		        shaderParams.arrvec4_deform = animation.arrvec4_deform;
		        shaderParams.cluster_num = animation.cluster_num;
		    }
		    shaderParams.deform_width = animation.tex_deform_width;
		    shaderParams.anim_head = animation.anim_head;
		    shaderParams.rootBone = animation.root / animation.cluster_num;
		    shaderParams.headTransMat=animation.HeadTransMat();
		    shaderParams.invHeadTransMat=animation.invHeadTransMat();
			shaderParams.multiSkel = V(matex.multi_skel,0.0);
		} else {
		    shaderUse = s_vert_shader;
		}
		if (this.translate != null && this.translate != undefined &&
            this.rotate != null && this.rotate != undefined &&
            this.transform != null && this.transform != undefined) {
		    shaderParams.trans_pos = this.translate;
		    shaderParams.head_rotation_quat = [-params.rotation[0], -params.rotation[1], -params.rotation[2],params.rotation[3]];
		    shaderParams.model_mat = this.transform;
		} else {
		    shaderParams.head_rotation_quat = [0, 0, 0, 1];
		    shaderParams.trans_pos = [0, 0, 0];
		    shaderParams.model_mat = [1, 0, 0, 0,
                                      0, 1, 0, 0,
                                      0, 0, 1, 0,
                                      0, 0, 0, 1];
		}
		if (animation != null) {
		    if (animation.use_vtf == 1)
		        shaderUse = "#define USE_VTF\n" + shaderUse;
		    if (animation.is_physics_init() == true)
				shaderUse = "#define USE_SKELETON\n" + shaderUse;
		}
		if(animation != null){
			FaceUnity.RenderBlendshapeComponent_new(blendshape, this, shaderUse, shader, shaderParams, "animation_"+pass);
		}else{
			FaceUnity.RenderBlendshapeComponent_new(blendshape, this, shaderUse, shader, shaderParams, pass);			
		}
	}

	Mesh.prototype.renderShadowMap = function (blendshape, params, pass, shader, animation, fid) {
	    if (!this.triggered || !this.isActive) return;
		var matex=(materials_json[this.name]||{});
		if(this.has_tex_albedo_frames==true){
			var albedo = bigtex[this.tex_albedo_frames[this.frame_id % this.tex_albedo_frames.length].bigtexidx];
			var lbrt = this.tex_albedo_frames[this.frame_id % this.tex_albedo_frames.length].lbrt;
		}else{
			var albedo = tex_map[V(matex.tex_albedo,this.mat.tex)];
			var lbrt = [0.0,0.0,1.0,1.0];
		}
		var shaderUse = s_vert_shader;
		if(V(globals.use_fov,0)>0.5){
			var mat_proj = FaceUnity.CreateProjectionMatrix_FOV(V(globals.camera_fov,20));
		}else{
			var mat_proj = FaceUnity.CreateProjectionMatrix_FOV();
			if(tracked<0.5){
				//console.log("js: use rmode ", g_params["rotation_mode"]);
				var rmode = g_params["rotation_mode"];
				if (rmode == -1)
					rmode = 0;
				mat_proj = FaceUnity.CreateProjectionMatrix_FOV(20,10,30000,rmode);
			}
		}
		var shaderParams = {
		    scales: [this.scales[0] * SCALE, this.scales[1] * SCALE, this.scales[2] * SCALE],
		    scale_e: scale_ex,
		    mat_view: L0_view,
		    is_eye: V(matex.is_eye,this.is_eye),
		    mat_eye: this.mat_eye,
		    quatR1:[this.rotation[0],this.rotation[1],this.rotation[2],this.rotation[3]],
		    mat_proj: L0_proj,
		    isFlipH: g_params['is3DFlipH'],
		};
		
		shader = AttachTexture(matex,tex_map,"tex_mask",shaderParams,"TX_MASK","grey.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_normal",shaderParams,"TX_NORMAL","grey.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_smoothness",shaderParams,"TX_SMOOTH","grey.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_ao",shaderParams,"TX_AO","white.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_specular",shaderParams,"TX_SPEC","black.png") + shader;
		shader = AttachTexture(matex,tex_map,"tex_emission",shaderParams,"TX_EMIT","black.png") + shader;

		if (animation != null) {
		    shaderUse = a_vert_shader;
		    shaderParams.fid = fid;
		    shaderParams.animating = animation.animating;
		    if (animation.use_vtf == 1)
		        shaderParams.tex_deform = animation.tex_deform;
		    else {
		        shaderParams.arrvec4_deform = animation.arrvec4_deform;
		        shaderParams.cluster_num = animation.cluster_num;
		    }
		    shaderParams.deform_width = animation.tex_deform_width;
		    shaderParams.anim_head = animation.anim_head;
		    shaderParams.rootBone = animation.root / animation.cluster_num;
		    shaderParams.headTransMat=animation.HeadTransMat();
		    shaderParams.invHeadTransMat=animation.invHeadTransMat();
		    shaderParams.multiSkel = V(matex.multi_skel,0.0);
		} else {
		    shaderUse = s_vert_shader;
		}
		if (this.translate != null && this.translate != undefined &&
            this.rotate != null && this.rotate != undefined &&
            this.transform != null && this.transform != undefined) {
		    shaderParams.trans_pos = this.translate;
		    shaderParams.head_rotation_quat = [-params.rotation[0], -params.rotation[1], -params.rotation[2],params.rotation[3]];
		    shaderParams.model_mat = this.transform;
		} else {
		    shaderParams.head_rotation_quat = [0, 0, 0, 1];
		    shaderParams.trans_pos = [0, 0, 0];
		    shaderParams.model_mat = [1, 0, 0, 0,
                                      0, 1, 0, 0,
                                      0, 0, 1, 0,
                                      0, 0, 0, 1];
		}
		if (animation != null) {
		    if (animation.use_vtf == 1)
		        shaderUse = "#define USE_VTF\n" + shaderUse;
		    if (animation.is_physics_init() == true)
				shaderUse = "#define USE_SKELETON\n" + shaderUse;
		}
		//FaceUnity.RenderBlendshapeComponent_new(blendshape, this, shaderUse, shader, shaderParams, pass);
		FaceUnity.SetShadowMapSize(1024);
		if(animation != null){
			FaceUnity.RenderShadowMap(blendshape, this, shaderUse, shader, shaderParams, 1);
		}else{
			FaceUnity.RenderShadowMap(blendshape, this, shaderUse, shader, shaderParams, 0);			
		}
	} 

	//meshgroup
	var MeshGroup = function (filename) {
	    this.meshName = filename;
	    //this.blendshape = FaceUnity.LoadBlendshape(filename + ".json", filename + ".bin");
	    this.BlendShapes = {};
	    this.meshlst = new Array();
	    this.last_state = 0;
	    this.facehack_mesh_ref_lst = null;
	    this.transparent_mesh_ref_lst = null;
	    this.opaque_mesh_ref_lst = null;
	    this.AnimCounter = AnimCounter;

	    this.ReloadThingsForEditor();
	    this.pushBlendshape2Meshlst();
	    this.reExtractSubLst();
	}
	MeshGroup.prototype.Getblendshape = function (id) {
        if(typeof this.BlendShapes[id] != 'object')
        {
        	//console.log("Getblendshape:",this.meshName,"id=",id);
            this.BlendShapes[id]=FaceUnity.LoadBlendshape(this.meshName + ".json", this.meshName + ".bin");
        }
        return this.BlendShapes[id];
	}
	MeshGroup.prototype.Clearblendshape = function (params) {
		var holdfirstbs=false;
		if(params.InstanceIDs.length==0)
			holdfirstbs=true;
		//var testdelete=false;
		for(var id in this.BlendShapes){
			if(holdfirstbs&&id==1)
			{
				continue;
			}
			var exist=false;
			for(var j=0;j<params.InstanceIDs.length;j++){
				if(params.InstanceIDs[j]==id)
				{
                    exist=true;
                    break;
                }
			}
			if(exist==false){	//至少保留1个
				delete this.BlendShapes[id];
				//testdelete=true;
				//console.log("*** delete BlendShapes id",id);
			}
		}
		/*if(testdelete){
			var l=0;
			for(var id in this.BlendShapes){
				l++;
			}
			console.log("InstanceIDs.length=",params.InstanceIDs.length,"BlendShapes.length=",l);
		}*/
	}
	MeshGroup.prototype.setDCHash = function () {
		for(var id in this.BlendShapes)
		{
		    this.BlendShapes[id].drawcalls.forEach(function (dc) {
		        dc.shader_hash_0 = undefined;
		        dc.shader_hash_1 = undefined;
		        dc.shader_hash_2 = undefined;
		    });
		}
	}
	MeshGroup.prototype.ReloadThingsForEditor = function () {
	    //因为用户可能什么参数都没设……obj导出的贴图也还是load一下吧
	    for(var id in this.BlendShapes)
		{
		    this.BlendShapes[id].drawcalls.forEach(function (dc) {
		        if (dc.mat.tex && !tex_map[dc.mat.tex]) {
		            tex_map[dc.mat.tex] = FaceUnity.LoadTexture(dc.mat.tex);
		        }
		    });
		}
	    //对每个物体
	    for (var sname in materials_json) {
	        //看一下是不是改过材质
	        var mat = materials_json[sname];
	        if (typeof (mat) == 'object') {
	            //然后在材质参数里面找tex_开头看着像贴图的
	            for (var skey in mat) {
	                if (skey.match(/^tex_.*/)) {
	                    //如果没有load过，就不管三七二十一load一下再说
	                    var fn = mat[skey];
	                    if (!tex_map[fn]) {
	                        tex_map[fn] = FaceUnity.LoadTexture(fn);
	                    }
	                }
	            }
	        }
	    }
	}
	MeshGroup.prototype.reExtractSubLst = function () {
	    this.facehack_mesh_ref_lst = this.meshlst.filter(function (mesh) { return V((materials_json[mesh.name] || {}).obj_type, 0) <= 0.25; });
	    this.transparent_mesh_ref_lst = this.meshlst.filter(function (mesh) { return V((materials_json[mesh.name] || {}).is_hair, 0) > 0.5; });
	    this.opaque_mesh_ref_lst = this.meshlst.filter(function (mesh) {
	        return (V((materials_json[mesh.name] || {}).obj_type, 0) > 0.25)
				&& (V((materials_json[mesh.name] || {}).is_hair, 0) < 0.5);
	    });
	}
	MeshGroup.prototype.calTriggerNextNodesRef = function (meshlst_2d) {
	    for (var i = 0; i < this.meshlst.length; i++) {
	        var nmesh = this.meshlst[i];
	        if (nmesh.triggerNextNodes.length != 0) nmesh.triggerNextNodesRef = new Array();
	        for (var j = 0; j < nmesh.triggerNextNodes.length; j++) {
	            var mesh3dref = this.meshlst[nmesh.triggerNextNodes[j]];
	            if (mesh3dref) { nmesh.triggerNextNodesRef.push(mesh3dref); }
	            else if (meshlst_2d) {
	                var mesh2dref = meshlst_2d[nmesh.triggerNextNodes[j]];
	                if (mesh2dref) { nmesh.triggerNextNodesRef.push(mesh2dref); }
	            }
	        }
	    }
	}
	MeshGroup.prototype.pushBlendshape2Meshlst = function () {
		var bs=this.Getblendshape(1);	//取第一个
	    for (var i = 0; i < bs.drawcalls.length; i++) {
	        var nmesh = new Mesh(bs.drawcalls[i], null);
	        if (materials_json[bs.drawcalls[i].name] != null &&
                materials_json[bs.drawcalls[i].name] != undefined)
	            nmesh = new Mesh(bs.drawcalls[i], materials_json[bs.drawcalls[i].name].anim);
	        this.meshlst.push(nmesh);
	        this.meshlst[nmesh.name] = nmesh;
	        if (nmesh.isactiveonce) this.AnimCounter.total++;
	    }
	}
	MeshGroup.prototype.renderMesh = function (params, pass, animation, fid) {
	    try {
	        //for tex animation
	        var now = Date.now();
	        if (this.last_state == 0) {
	            for (var i = 0; i < this.meshlst.length; i++) this.meshlst[i].switchState(this.last_state, 1);
	            this.last_state = 1;
	        }
	        var alphaThreshold = parseFloat(V(globals.alphaThreshold, "1.0"));
	        var shader = s_frag_shader + "vec4 shader_main_OIT(){vec4 c=shader_main();return vec4(c.rgb,1.0);}";
	        var parent = this;
	        var bs=this.Getblendshape(params.current_faceid==0?1:params.current_faceid);
	        this.Clearblendshape(params);
	        params.animation=animation;
	        //update for all mesh
	        this.meshlst.forEach(function (mesh) {
	            mesh.triggerStartEvent(params, now, false);
	            mesh.updateEvent(params, now);
	        });

	        if (pass == 0) {
   				FaceUnity.ComputeBlendshapeGeometry(bs, params, bsCount);
	        	var shadowMap_shader = shadowMap_fs + "vec4 shader_main_OIT(){vec4 c=shader_main();return vec4(c.rgba);}";
	        	this.facehack_mesh_ref_lst.forEach(function (mesh) { mesh.renderShadowMap(bs, params, -1, shadowMap_shader, animation, fid); });
	        	this.opaque_mesh_ref_lst.forEach(function (mesh) { mesh.renderShadowMap(bs, params, 0, shadowMap_shader, animation, fid); });
	        	this.transparent_mesh_ref_lst.forEach(function (mesh) { mesh.renderShadowMap(bs, params, 1, shadowMap_shader, animation, fid); });
	        } else if (pass == 1) {
	            if(globals.hasShadow <= 0.5)
	            	FaceUnity.ComputeBlendshapeGeometry(bs, params, bsCount);
	            //for facehack
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthFunc(gl.LEQUAL);
	            gl.enable(gl.BLEND);
	            gl.blendFunc(gl.ZERO, gl.ONE);
	            this.facehack_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(bs, params, -1, shader, animation, fid); });
	            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	        } else if (pass == 2) {
	            //for opaque object
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthFunc(gl.LEQUAL);
	            gl.depthMask(true);
	            gl.disable(gl.BLEND);
	            this.opaque_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(bs, params, 0, shader, animation, fid); });

	            //for transport object, alpha cut pass one
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthMask(true);
	            shader = s_frag_shader + "vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a>=" + alphaThreshold.toFixed(3) + ") return vec4(c.rgb,1.0);else discard;}";
	            this.transparent_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(bs, params, 1, shader, animation, fid); });

	            //for transport object, alpha cut pass two
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthMask(false);
	            gl.enable(gl.BLEND);
	            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
	            shader = s_frag_shader + "vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a<=" + alphaThreshold.toFixed(3) + ") return vec4(c.rgb,c.a*" + (1.0 / alphaThreshold).toFixed(3) + ");else return vec4(c.rgb,0.0);}";
	            this.transparent_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(bs, params, 2, shader, animation, fid); });

	            gl.depthMask(true);
	            gl.disable(gl.DEPTH_TEST);

				 /*gl.disable(gl.BLEND);
				 FaceUnity.RenderScreenQuad(screen_fs, {
				 	NEARPLANE: 10,
				 	FARPLANE: 30000,
				 	tex_color: FaceUnity.GetShadowMap(),
				 });
	    			gl.enable(gl.BLEND);*/

	            this.meshlst.forEach(function (mesh) { mesh.triggerEndEvent(params, now, false, parent.AnimCounter); });
	        }
	        //console.log("current_faceid=",params.current_faceid,"pass=",pass,"expression=",params.expression,"\n");
	        FaceUnity.SimpleOITEnd();
	    } catch (err) {
	        console.log(err.stack)
	    }
	}

    //animation & mesh
	var AnimationMeshPair = function (meshFilename) {
	    this.meshName = meshFilename;
	    this.meshgroup = new MeshGroup(meshFilename);
	    this.animation = null;

	    this.initMeshAnimation = function () {
	        if (this.animation != null) {
	            this.animation.reset_anim_process(this.animation.anim_state);
	            this.animation.animating = 1;
	            this.animation.play_count = 0;
	        }
	    }
	    this.calculate_anim_fid = function (frame_id) {
	        return this.animation.animating ? this.animation.frame_id_callback(this.animation, frame_id) : 0;
	    }
	    this.AnalysisInstanceID = function(params) {
	    	if (this.animation != null)
	        	this.animation.AnalysisInstanceID(params);
	    }
	    this.updateAnim = function(params) {
	    	if (this.animation != null)
	        	this.animation.updateAnim(this.animation, params);
	    }
	    this.updatePhysics = function(params) {
	    	if (this.animation != null)
	        	this.animation.updatePhysics(this.animation, params);
	    }
	    this.DoRender = function (params, pass) {
	        if (this.animation != null) {
	            if (params.frame_id==0) return;
	            this.animation.upload(this.animation, params);
	            this.meshgroup.renderMesh(params, pass, this.animation, 0);
	        } else
	            this.meshgroup.renderMesh(params, pass, null, 0);
	    }
	}


	var AnimMeshs = {};
	var avatarJson = JSON.parse(FaceUnity.ReadFromCurrentItem("avatar.json")||"{}");
	if(avatarJson["drawcalls"] && avatarJson["drawcalls"].length>0)
		AnimMeshs["avatar"] = new AnimationMeshPair("avatar");
	
	var fMeshs = fbxmeshs.meshes;
	for (var i = 0; i < fMeshs.length; i++) {
	    var meshName = fMeshs[i];
	    AnimMeshs[meshName] = new AnimationMeshPair(meshName);
	}

	var animations = require("anim_dq_script.js");
	var animlist = animations.Anims;

    //animations trigger
	var UpdateAnimation = function (anim, params, noface) {
	    if (anim != undefined && anim != null && "meshName" in anim) {
	        var istriggerd = false;
	        if (anim.triggerstart == "alwaysrender" && !anim.betriggered) {
	            var pair = AnimMeshs[anim.meshName];
	            if (pair.animation != anim) {
	                istriggerd = true;
	                anim.bind(pair);
	            }
	        } else if (((anim.triggerstart == "faceaction" && isActionTriggered(anim.startaction, params)) ||
                    (anim.triggerstart == "newface")) && !noface &&
                    (!anim.betriggered || anim.startaction == "null")) {
	            var pair = AnimMeshs[anim.meshName];
	            if (pair.animation != anim) {
	                istriggerd = true;
	                anim.bind(pair);
	            }
	        } else if (anim.triggerend == "faceaction" && isActionTriggered(anim.endaction, params)) {
	            var pair = AnimMeshs[anim.meshName];
	            if (pair.animation == anim) {
	                istriggerd = true;
	                anim.unbind(pair);
	                TriggerNext(anim);
	            }
	        }
	        if (anim.startaction != "null" && anim.needkeepfaceaction == 1 && !isActionTriggered(anim.startaction, params)) {
	            var pair = AnimMeshs[anim.meshName];
	            if (pair.animation == anim) {
	                istriggerd = true;
	                anim.unbind(pair);
	                TriggerNext(anim);
	            }
	        }
	        if (anim.looptype == "loopcnt" && anim.play_count >= anim.loopcnt) {
	            var pair = AnimMeshs[anim.meshName];
	            if (pair.animation == anim) {
	                istriggerd = true;
	                anim.unbind(pair);
	                TriggerNext(anim);
	            }
	        } else if (anim.looptype == "loop1stay" && anim.play_count >= 1) {
	            var pair = AnimMeshs[anim.meshName];
	            if (pair.animation == anim) {
	                istriggerd = true;
	                anim.unbind(pair);
	                TriggerNext(anim);
	            }
	        }
	        if (anim.isactiveonce == 1 && anim.play_count >= 1) {
	            var pair = AnimMeshs[anim.meshName];
	            if (pair.animation == anim) {
	                istriggerd = true;
	                anim.unbind(pair);
	                TriggerNext(anim);
	            }
	        }
	        if (istriggerd) {
	            var pair = AnimMeshs[anim.meshName];
	            var meshgrp = pair.meshgroup;
	            var meshlst = meshgrp.meshlst;
	            for (var i = 0; i < meshlst.length; i++) {
	                var mesh = meshlst[i];
	                for (var j = 0; j < 4; j++) {
	                    mesh["shader_hash_" + j] = undefined;
	                }
	            }
	        }
	    }
	}

	var TriggerNext = function (anim) {
	    if (anim != null && anim != undefined) {
	        var triggerList = anim.triggerNextNodes;
	        if (triggerList.length <= 0) return;
	        for (var i = 0; i < triggerList.length; i++) {
	            var nextName = triggerList[i];
	            var animNext = animlist[nextName];
	            if (animNext != null && animNext != undefined) {
	                var pair = AnimMeshs[animNext.meshName];
	                if (pair.animation != animNext) {
	                    animNext.bind(pair);
	                }
	            }
	        }
	    }
	}
	if(AnimMeshs["avatar"])
		AnimMeshs["avatar"].meshgroup.calTriggerNextNodesRef(undefined);
	
	return {
	    CalRef: AnimMeshs[0] ? AnimMeshs[0].meshgroup.calTriggerNextNodesRef:undefined,
	    meshlst: AnimMeshs[0] ? AnimMeshs[0].meshgroup.meshlst:undefined,
		animCounter: AnimCounter,
		//接下来就是道具对象的内容了
		/// \brief 处理编辑器发起的参数修改
		GetHasShadow:function(){
			return globals.hasShadow > 0.5 ? 1 : 0;
		},
		FollowState:function() {
			return isFollow;
		},
		FollowWithBGState:function() {
			return followWithBg;
		},
		TongueState:function() {
			return globals.tongue;
		},
		SetParam:function(name,value){
			//特殊参数名'@refresh'表示“刷新一下”
			if(name=='@refresh'){
			    ReloadThingsForEditor();
			    for (var prop in AnimMeshs)
			        AnimMeshs[prop].meshgroup.ReloadThingsForEditor();
				return 1;
			}
			if(name=='is3DFlipH'){
				g_params[name] = value;
				return 1;
			}
			if(name=='isFlipExpr'){ 
				g_params[name] = value;
				return 1;
			}
			if(name=='isFlipTrack'){ 
				g_params[name] = value;
				return 1;
			}
			if(name=='isFlipLight'){ 
				g_params[name] = value;
				return 1;
			}
			if(name=="weightOffset"){
				g_params[name]=value;
				return 1;
			}
			if(name=="rotationAngle3d"){
				if(Math.abs(value - g_params["rotationAngle3d"])>1){
					tracked = 0;
				}
				if(Math.abs(value-0) < 0.01){
					g_params["matp"] = [0,0,0,1];
				}else if(Math.abs(value-90) < 0.01){
					g_params["matp"] = [0,0,1,1];
				}else if(Math.abs(value-180) < 0.01){
					g_params["matp"] = [0,0,1,0];
				}else if(Math.abs(value-270) < 0.01){
					g_params["matp"] = [0,0,-1,1];
				}else return;
				g_params["rotationAngle3d"] = value;
				console.log("")
				return 1;
			}
			if (name=="fixed_x") {
				globals.fixed_x = value;
				return 1;
			}
			if (name=="fixed_y") {
				globals.fixed_y = value;
				return 1;
			}
			if (name=="fixed_z") {
				globals.fixed_z = value;
				return 1;
			}
			if (name=="fix_rotation") {
				g_params["fix_rotation"] = value;
				return 1;
			}
			if (name=="rotation_mode"){
				if (g_params["rotation_mode"]==-1 || g_params["fix_rotation"]){
					g_params["rotation_mode"] = value;
					//console.log("js: setparam set rmode to ", value);
				}
				return 1;
			}
			if (name == "camera_change"){
				g_params["rotation_mode"] = -1;
				/*
				if (value > 0){
					//g_params["rotation_mode"] = (g_params["rotation_mode"] + 2) % 4; // wtf just goes wrong
					var rmode0 = g_params["rotation_mode"];
					var rmode2;
					if (rmode0==0)
						rmode2 = 2;
					else if(rmode0 == 1)
						rmode2 = 3;
					else if(rmode0 == 2)
						rmode2 = 0;
					else
						rmode2 = 1;
					g_params["rotation_mode"] = rmode2;
					//console.log("js: change rmode from ", rmode0, " to ", g_params["rotation_mode"]);
				}
				*/
			}
			if(name=="reset"){
				tracked = 0;
			}
			if(name=="use_vtf"){
				g_params["use_vtf"] = value;
				return 1;
			}
			
			/*
			否则的话，name里面就是一个JSON对象：{"name":"材质名或<global>"，"param":"参数名"}
			接着就是根据不同情况找到参数的位置设上值。考虑到每个部分都可能写错，处理一下异常会安全一些。
			有特殊需求的话，可以在这里进行一定的合法性检查。
			*/
			try{
				var desc;
				try{
					desc=JSON.parse(name);
				}catch(err){console.log("non json 3d param");return undefined;}
				if(desc.thing=="<global>"){
					globals[desc.param]=value;
					if (desc.param == "alphaThreshold") {
					    for (var prop in AnimMeshs)
					        AnimMeshs[prop].meshgroup.setDCHash();
					}
					if (desc.param == "is_fix_x") {
						nf_fixed_x = value;
					}
					if (desc.param == "is_fix_y") {
						nf_fixed_y = value;
					}
					if (desc.param == "is_fix_z") {
						nf_fixed_z = value;
					}
					if (desc.param == "isnofacerender") {
						nf_nface = value;
					}
					if (desc.param == "use_fov") {
						nf_usefov = value;
					}
					if (desc.param == "camera_fov") {
						nf_cfov = value;
					}
					if (desc.param == "follow") {
						if(value<0.5) {
							globals["is_fix_x"] = nf_fixed_x;
							globals["is_fix_y"] = nf_fixed_y;
							globals["is_fix_z"] = nf_fixed_z;
							globals["isnofacerender"] = nf_nface;
						} else {
							//globals["use_fov"] = nf_usefov;
							//globals["camera_fov"] = nf_cfov;
						}
						isFollow = value;
					}
					if (desc.param == "follow_withbg") {
						followWithBg = value;
					}
					return 1;
				}else{
					var dc=materials_json[desc.thing];
					if(!dc){
						console.log("3d mesh not found");
						return undefined;
					}
					dc[desc.param]=value;
					if (desc.param == "obj_type" || desc.param == "is_hair") {
					    for (var prop in AnimMeshs)
					        AnimMeshs[prop].meshgroup.reExtractSubLst();
					}
					return 1;
				}
			}catch(err){console.log(err.stack);}
			return undefined;
		},
		/// \brief 给编辑器提供用来在界面上显示的参数值，或者将需要保存的东西返回给编辑器
		GetParam:function(name){
			//前面两个是保存用的
		    if (name == "hasFinish") return AnimCounter.hasFinish();
		    if (name == "allFinish") return AnimCounter.allFinish();
			if(name=='@global_json'){
				return JSON.stringify(globals,null,2);
			}
			if(name=='@materials_json'){
				return JSON.stringify(materials_json,null,2);
			}
			/*
			编辑器本身并不会记忆修改的参数值，而是每次都会过来取。
			如果编辑器上什么东西怎么拽都不动弹的话，那么多半就是这个文件里什么地方写错了。
			*/
			try{
				var desc=JSON.parse(name);
				if(desc.thing=="<global>"){
					return globals[desc.param];
				}else{
					var dc=materials_json[desc.thing];
					if(dc){
						return dc[desc.param];
					}
				}
			}catch(err){console.log(err.stack);}
			return undefined;
		},
		/// \brief 主要的绘制逻辑
		Render: function (params, pass) {
			if(!g_params["fix_rotation"])
				tracked = 1;
			else
				tracked = 0;

			if (g_params.support_vtf == -1) { //check vtf
	            var ret = 1;
	            if (FaceUnity.TestVTF != undefined)
	                ret = FaceUnity.TestVTF();
				//if(gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)<=8)
				//	ret = 0; //check image slot
				if(!g_params["use_vtf"])
					ret = 0;
	            g_params.support_vtf = ret;
	        }

			var rotation = params.rotation.slice();
			var L0_dir_src=L0_dir[0];
			//g_params.isFlipExpr=1;
			//g_params.is3DFlipH=1;
			//g_params.isFlipTrack=1;
			//g_params.isFlipLight=1;
			if(g_params.isFlipLight>0.5){
				L0_dir[0]=-L0_dir_src;
			}
			params.isFlipTrack=g_params.isFlipTrack;
			if(g_params.isFlipTrack>0.5){
				//filp rotation
				//console.log("before rotation hack:",rotation);
				//params.rotation[0] = rotation[0];
				params.rotation[1] = -rotation[1];
				params.rotation[2] = -rotation[2];
				//params.rotation[3] = rotation[3];
			}
			if(g_params.isFlipExpr>0.5){
				//filp exp
				for (var i = 0;i<swaplst.length;i+=2){
					var tmp = params.expression[swaplst[i]];
					params.expression[swaplst[i]] = params.expression[swaplst[i+1]];
					params.expression[swaplst[i+1]] = tmp;
				}
				// fack eye rot
				params.pupil_pos[0] = -params.pupil_pos[0];
			}
			
			if(globals.follow) {
				globals["is_fix_x"] = 0;
				globals["is_fix_y"] = 0;
				globals["is_fix_z"] = 0;
				globals["isnofacerender"] = 0;
			} 
			
			if(V(globals.is_fix_x,0)>0.5){
				params.translation[0] = V(globals.fixed_x,0);
			}
			if(V(globals.is_fix_y,0)>0.5){
				params.translation[1] = V(globals.fixed_y,0);
			}
			if(V(globals.is_fix_z,0)>0.5){
				params.translation[2] = V(globals.fixed_z,0);
			}
			if (!params.focal_length) params.focal_length = focal_length;
			if(V(globals.expr_clamp,0)>0.5){
				for(var i =0;i<bsCount;i++){
					if(params.expression[i]==undefined) params.expression[i] = 0.0;
					params.expression[i] = Math.max(Math.min(params.expression[i],1.0),0.0);
				}
			}

			if(!g_params["fix_rotation"])
				g_params["rotation_mode"] = params.rotation_mode;
			g_params["bk_translation"] = params.translation;
			g_params["bk_rotation"] = params.rotation;
			g_params["bk_pupil_pos"] = params.pupil_pos;
			g_params["bk_expression"] = params.expression;
			g_params["baked"] = 1;

			//animation trigger
			for (var prop in animlist) {
			    UpdateAnimation(animlist[prop], params, false);
			}

			//update animation
			var animesh=undefined;
			for (var prop in AnimMeshs) {
				animesh=AnimMeshs[prop];
				if (animesh.animation != null && params.frame_id!=0) {
		            if (animesh.animation.support_vtf == -1) {
		                animesh.animation.support_vtf = g_params.support_vtf;
		                animesh.animation.use_vtf = g_params.support_vtf;
		            }
		            animesh.AnalysisInstanceID(params);
		            if (params.NeedUpdateBoneMap) {
		            	animesh.updateAnim(params);
		            }
	        	}
			}

			//update physics
			if (params.NeedUpdateBoneMap&&animesh!=undefined) {
		        animesh.updatePhysics(params);
		    }

			//upload bonemap & DoRender
			for (var prop in AnimMeshs) {
			    AnimMeshs[prop].DoRender(params, pass);
			}

			L0_dir[0]=L0_dir_src;
			params.rotation = rotation;
			
		},
		RenderNonFace: function (params, pass) {
			if(globals.follow) {
				globals["is_fix_x"] = 0;
				globals["is_fix_y"] = 0;
				globals["is_fix_z"] = 0;
				globals["isnofacerender"] = 0;
			} 
			
		    ////fixed section
		    if (params.face_count > 0) return;
			tracked = 0;
			var isNoFace = V(globals.isnofacerender, 0) > 0.5;
		    if (isNoFace) {
		        for (var ap in animlist)
		            UpdateAnimation(animlist[ap], params, true);
		        
		        var L0_dir_src=L0_dir[0];
				if(g_params.isFlipLight>0.5){	//is3DFlipH的时候光照也需要镜像
					L0_dir[0]=-L0_dir_src;
				}
				if (g_params["baked"]>0){
		        	params.translation = g_params["bk_translation"];
					params.rotation = g_params["bk_rotation"];
					params.pupil_pos = g_params["bk_pupil_pos"];
			        params.expression = g_params["bk_expression"];
					
					params.translation = [V(globals.fixed_x, 0), V(globals.fixed_y, 0), V(globals.fixed_z, 350), 1];
		        }else{
		        	params.translation = [V(globals.fixed_x, 0), V(globals.fixed_y, 0), V(globals.fixed_z, 350), 1];
					params.rotation = [0,0,0,1];
					params.pupil_pos = [0, 0];
			    	params.expression = expression;
		        }
		        if (!params.focal_length) params.focal_length = focal_length;

		        //update animation
				var animesh=undefined;
				for (var prop in AnimMeshs) {
					animesh=AnimMeshs[prop];
					var meshgrp = animesh.meshgroup;
			        if (meshgrp.last_state == 1 && !params.face_count) {
			            for (var i = 0; i < meshgrp.meshlst.length; i++) meshgrp.meshlst[i].switchState(meshgrp.last_state, 0);
			            meshgrp.last_state = 0;
			        }
					if (animesh.animation != null && params.frame_id!=0) {
			            if (animesh.animation.support_vtf == -1) {
			                animesh.animation.support_vtf = g_params.support_vtf;
			                animesh.animation.use_vtf = g_params.support_vtf;
			            }
			            animesh.AnalysisInstanceID(params);
			            if (params.NeedUpdateBoneMap) {
			            	animesh.updateAnim(params);
			            }
		        	}
				}

				//update physics
				if (animesh!=undefined&&params.NeedUpdateBoneMap&&animesh.animation!=null&&params.frame_id!=0) {
			        animesh.updatePhysics(params);
			    }

				//upload bonemap & DoRender
			    for (var prop in AnimMeshs) {
			        AnimMeshs[prop].DoRender(params, pass);
			    }

			    if(g_params.isFlipLight>0.5){
					L0_dir[0]=L0_dir_src;
				}
		    }

		},
		name:V(globals.name,"unnamed"),
	};
})()
