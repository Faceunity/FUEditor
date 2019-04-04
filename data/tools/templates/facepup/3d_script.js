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
	//环境图
	//@gparam tex_light_probe {"type":"texture","default_value":"beach_1_4.jpg"}
	//环境图的旋转角度
	//@gparam envmap_shift {"type":"slider","min":0,"max":1,"default_value":0.75}
	//环境图的视角
	//@gparam envmap_fov {"type":"slider","min":0.5,"max":5,"default_value":1.0}
	//道具整体缩放的比例，用对数调节是为了方便
	//@gparam log_scale {"type":"slider","min":-5,"max":5,"default_value":0}
	//眼球左右旋转的倍率
	//@gparam eyeRscale {"type":"slider","min":0.0,"max":3.0,"default_value":1.5}
	///////////////////////////
	/*
	以下是光源参数。出于节省起见，现在只用了两个光。主光L0负责主要的照明，补光L1把侧面补亮。只有主光会产生高光。
	将来有需求的话可以把shader里L2的注释去掉，加个背光什么的。
	现在的光源都没有产生阴影。有需求请联系我们，在系统里加一下。
	*/
	//主光的航向角，也就是左右转的那个角
	//@gparam L0_yaw {"type":"slider","min":0,"max":1,"default_value":0}
	//主光的俯仰角，也就是上下转的那个角
	//@gparam L0_pitch {"type":"slider","min":-1,"max":1,"default_value":0}
	//主光的颜色，三个通道
	//@gparam L0_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_B {"type":"slider","min":0,"max":1,"default_value":1}
	//主光的强度，用对数调还是为了方便
	//@gparam L0Intensity {"type":"slider","min":-4,"max":4,"default_value":0}
	//补光的参数，和主光一样的。再次重申，补光不产生高光。
	//@gparam L1_yaw {"type":"slider","min":-0.5,"max":0.5,"default_value":0}
	//@gparam L1_pitch {"type":"slider","min":-1,"max":1,"default_value":0}
	//@gparam L1_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_B {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1Intensity {"type":"slider","min":-4,"max":4,"default_value":-2}
	//半透明算法阈值，设为1.0适合普通简单的半透明物体，设为0.5适合头发
	//@gparam alphaThreshold {"type":"edit","default_value":"1.0"}
	//是否固定位置,不跟随人脸运动，固定位置如下fixed_x/y/z
	//在没有人脸的时候的固定位置
	//@gparam is_fix_x {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam is_fix_y {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam is_fix_z {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam fixed_x {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_y {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_z {"type":"slider","min":0,"max":2000,"default_value":350}
	//在没有人脸的时候是否绘制
	//@gparam isnofacerender {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam fixed_nx {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_ny {"type":"slider","min":-600,"max":600,"default_value":0}
	//@gparam fixed_nz {"type":"slider","min":0,"max":2000,"default_value":350}
	
	//@gparam use_fov {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam camera_fov {"type":"slider","min":5,"max":90,"default_value":20}
	//控制旋转的幅度，rot_weight=1完全按照人头旋转，rot_weight=0不跟人头旋转
	//@gparam rot_weight {"type":"slider","min":0,"max":1,"default_value":1}	
	//@gparam expr_clamp {"type":"slider","min":0,"max":1,"default_value":0}	
	///////////////////////////
	//以下是材质参数
	/*物体的类型,一是镂空,[0,0.25]；
				二是会完全随着脑袋旋转和缩放,(0.25,0.5]；
				三是权重控制旋转的幅度（前提是有对应主obj的weight.png,例如aa.obj对应的权重贴图是aa_weight.png）,(0.5,0.75]；
				四是只会跟着脑袋位移变化和大小的缩放，例如身体(0.75,1]。
	*/
	//@mparam obj_type {"type":"slider","min":0,"max":1,"default_value":0.3}
	
	//法向贴图，就是蓝了吧唧的那种，不是bump map哦～bump map要先转一下哦～～ 默认的grey.png等于没有贴图
	//@mparam tex_normal {"type":"texture","default_value":"grey.png"}
	//法向贴图的强度，为了照顾没有法向贴图的模型，强度默认是0，所以设了法向贴图之后要把强度拽高点才能看到效果
	//@mparam normal_strength {"type":"slider","min":0,"max":1,"default_value":0}
	//颜色贴图，默认的white.png是白的。建议先弄好贴图再去调光哦。
	//@mparam tex_albedo {"type":"texture","default_value":"white.png","isTex":1}
	//@mparam tex_changemask {"type":"texture","default_value":"grey.png"}
	//@mparam enable_change {"type":"slider","min":0.0,"max":1.0,"default_value":1.0}
	//@mparam color_change {"type": "color","default_r": 1.0,"default_g": 1.0,"default_b": 1.0}
	//@mparam satura_scale {"type":"slider","min":0.0,"max":3.0,"default_value":1.0}
	//@mparam bright_scale {"type":"slider","min":0.0,"max":3.0,"default_value":1.0}
	//自发光强度
	//@mparam Ka {"type":"slider","min":0,"max":1,"default_value":0}
	//漫反射强度
	//@mparam Kd {"type":"slider","min":0,"max":1,"default_value":0.3}
	//高光强度，注意高光不受颜色贴图影响
	//@mparam Ks {"type":"slider","min":0,"max":1,"default_value":0.2}
	//环境图反射强度
	//@mparam Kr {"type":"slider","min":0,"max":1,"default_value":0.0}
	//表面粗糙度。越大高光越分散，越小高光越集中
	//@mparam roughness {"type":"slider","min":0.02,"max":1,"default_value":0.5}
	//高光强度贴图，应为灰度图，越大表示越亮。
	//@mparam tex_smoothness {"type":"texture","default_value":"grey.png"}
	//高光强度贴图的整体强度（有些拗口……），为了照顾到大多数没有高光强度贴图的模型，默认是0。设了贴图之后要把强度拽高哦～
	//@mparam has_tex_smoothness {"type":"slider","min":0,"max":1,"default_value":0}
	//环境图反射的折射率。折射率越小，反射从正面到边光的亮度变化越明显，整体强度越小。
	//@mparam ior {"type":"slider","min":1.01,"max":2.00,"default_value":1.33}
	//高光的金属度。越高越接近金属，越低越接近塑料。
	//@mparam F0 {"type":"slider","min":0,"max":1,"default_value":1.0}
	//这个材质是不是眼睛的标记
	//@mparam is_eye {"type":"slider","min":0,"max":1,"default_value":0}
	//这个材质是不是头发的标记
	//@mparam is_hair {"type":"slider","min":0,"max":1,"default_value":0}
	//这个是需不需要背面剔除的标记
	//@mparam back_cull {"type":"slider","min":0,"max":1,"default_value":1}
	
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
	
	var RGB2HSV=function(rgb){
		var r = rgb[0], g = rgb[1], b = rgb[2];
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, v = max;

		var d = max - min;
		s = max == 0 ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
			case r: h = (g - b) / d + 0; break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
			}

			h = h >= 0 ? h : h + 6;
			h /= 6;
		}

		return [ h, s, v ];
	}
	
	//ex 16,
	var swaplst = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,  17,18,  20,22,  23,24,  25,26,  27,28,  29,30,  31,32,  44,45];
	
	var PI = Math.PI;
	var RAD2DEG = 180.0 / PI;
	var DEG2RAD = PI / 180.0;

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
			//#action
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
	var globals=JSON.parse(FaceUnity.ReadFromCurrentItem("globals.json")||"{}");
	var materials_json=JSON.parse(FaceUnity.ReadFromCurrentItem("materials.json")||"{}");
	//下面是正常的三维道具绘制流程
	var s_vert_shader=FaceUnity.ReadFromCurrentItem("3d_vert.glsl");
	var s_frag_shader = FaceUnity.ReadFromCurrentItem("3d_frag.glsl");

    //骨骼动画相关
	var a_vert_shader = FaceUnity.ReadFromCurrentItem("anim_dq_vert.glsl");
	var fbxmeshs = JSON.parse(FaceUnity.ReadFromCurrentItem("meshes.json"));

    //物理效果相关
	var rigidBody_json_string = FaceUnity.ReadFromCurrentItem("bodies.json") || "{}";
	var joint_json_string = FaceUnity.ReadFromCurrentItem("joints.json") || "{}";
	var bones_json_string = FaceUnity.ReadFromCurrentItem("bones.json") || "{}";
	var canUsePhysical = rigidBody_json_string != "{}" && joint_json_string != "{}" && bones_json_string != "{}";

    //全局旋转和缩放
	var rot_delta = 0.0;
	var scale_delta = 0.0;
	var globalRotationQuat = [0.0, 0.0, 0.0, 1.0];
	var rot_ex = [1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1];
	var scale_ex = 1.0;

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
	//var filter_array = new Array();
	var now = Date.now();
	var bsCount = 46;
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
		isFlipExpr: 0.0,
		weightOffset:[0.0,0.0,0.0],
		fix_rotation_mode: 0,
		fix_rotation: 0,
		flip_wh: 0.0
	};
	var faces = [];
	var tex_map={};
	var SCALE = 1;
	var tex_light_probe;
	var L0_dir,L1_dir,L0_color,L1_color;
	
	var need_recompute_facepup = 1;
	var computeonce = 0;
	var facepup_mode = 1;
	var facepup_expr = [];
	
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
		L0_color=CreateColor(V(globals.L0_R,1),V(globals.L0_G,1),V(globals.L0_B,1), V(globals.L0Intensity,0));
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

	var QueueArray = function(size) {
		this.data = new Array(size);
		this.first = 0;
		this.last = size-1;
		this.count = 0;
		this.push = function(value) {
			if(this.count<size) {
				this.data[this.first+this.count] = value;
				this.count++;
			} else {
				this.first = (this.first+1)%this.count;
				this.last = (this.last+1)%this.count;
				this.data[this.last] = value;
			}
		}
		this.get = function(i) {
			if(this.count<=size)
				return this.data[i];
			else {
				var id = (this.first + i)%this.count;
				return this.data[id];
			}
		}
	}
	
	var filter_array = new QueueArray(10);

	function filterAct(params) {
	    //filter
	    var filter_num = 10;
	    var l0, l1, l2, l3;
	    if (user_frame_id > filter_num) {
	        //filter_array.shift();
	        filter_array.push(params.rotation);
	        //calculate
	        l0 = l1 = l2 = l3 = 0.0;
	        // var start_time =  (new Date()).getMilliseconds();
	        for (var i = filter_array.count - 1; i >= 0; i--) {
	            l0 += filter_array.get(i)[0];
	            l1 += filter_array.get(i)[1];
	            l2 += filter_array.get(i)[2];
	            l3 += filter_array.get(i)[3];
	        }
	        // var delta_time=(new Date()).getMilliseconds()-start_time;
	        // console.log("delta_time",delta_time);
	        l0 /= filter_array.count;
	        l1 /= filter_array.count;
	        l2 /= filter_array.count;
	        l3 /= filter_array.count;

	        params.smooth_rotation = [l0, l1, l2, l3];
	    } else {
	        filter_array.push(params.rotation);
	    }
		//ease
	    // var input_rot_weight = [0.5, 0.3, 0.1, 0.5];
	    var input_rot_weight = [1.0, 1.0, 0.3, 1.0];


	    if (FaceUnity.m_n_valid_faces == 1) {
	    	 g_dde_rot=params.smooth_rotation;
	    }
	    else
	    {
	    	params.smooth_rotation=g_dde_rot;
	    }
	    var w = input_rot_weight;
	    params.smooth_rotation = [w[0] * params.rotation[0], w[1] * params.rotation[1], w[2] * params.rotation[2], w[3] * params.rotation[3]];
	    //ease end
	    user_frame_id++;
	    //hack end
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
		this.paused = false;
		this.pauseTime = 0;
		this.pauseSum = 0;
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
		
		if(V(globals.rot_weight,1.0) < 0.05){
			rotation = [0,0,0,1];
		}else if(V(globals.rot_weight,1.0) < 0.95){
			var delta = [-rotation[0],-rotation[1],-rotation[2],1.0-rotation[3]];
			var w=1.0 - globals.rot_weight;
			rotation=[w*delta[0]+rotation[0],w*delta[1]+rotation[1],w*delta[2]+rotation[2],w*delta[3]+rotation[3]];
		}
		
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
		
		var trans = [0, 0, 0];
		trans[0] = this.translate[0];
		trans[1] = this.translate[1];
		trans[2] = -this.translate[2];
		
		var mat = FaceUnity.MatrixTranslate(AddVec3(params.translation, trans));
		mat = FaceUnity.MatrixMul(rot_ex, mat);
		mat = FaceUnity.MatrixMul(FaceUnity.MatrixTranslate(InvVec3(trans)), mat);
		
		if(globals["use_fov"] > 0.5)
			mat = FaceUnity.CreateViewMatrix([0,0,0,1],[params.translation[0],params.translation[1],AdjustZFov(params.translation[2])*2]);

		var mat_cam = FaceUnity.MatrixTranslate(AddVec3(params.translation, trans));
		mat_cam = FaceUnity.MatrixMul(rot_ex, mat_cam);
		mat_cam = FaceUnity.MatrixMul(FaceUnity.MatrixTranslate(InvVec3(trans)), mat_cam);

		var mat_t = FaceUnity.CreateViewMatrix(
			[-rotation[0], -rotation[1], -rotation[2], rotation[3]],
			[0, 0, 0]);
		var mat_cam_t = FaceUnity.CreateViewMatrix(
			[0, 0, 0, 1],
			[0, 0, 0]);

		mat = FaceUnity.MatrixMul(mat_t, mat);
		mat_cam = FaceUnity.MatrixMul(mat_cam_t, mat_cam);


		if(V(matex.is_eye,this.is_eye)){
			var temp_mat = FaceUnity.CreateEyeMatrix(
					[this.P_center[0]*SCALE,this.P_center[1]*SCALE,-this.P_center[2]*SCALE],
					[params.pupil_pos[0]*V(globals.eyeRscale,1.5),params.pupil_pos[1]]);
			if (g_params['is3DFlipH']) {

				temp_mat = FaceUnity.CreateEyeMatrix(
					[(-this.P_center[0]-7.364)*SCALE,this.P_center[1]*SCALE,-this.P_center[2]*SCALE],
					[params.pupil_pos[0]*V(globals.eyeRscale,1.5),params.pupil_pos[1]]);
			}
			mat=FaceUnity.MatrixMul(
				temp_mat,
				mat);
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
					center[0],center[1],center[2],1],
				mat
			);
			mat=FaceUnity.CreateViewMatrix(
				[0,0,0,1],
				[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]]);
		}
		this.rotation = rotation;
		this.mat = mat;
		this.mat_cam = mat_cam;
		if(this.triggered){
			var elapse = now - this.last - this.pauseSum;
			if(!this.paused) 
				this.frame_id = parseInt(elapse * this.fps / 1000);
			if(this.force_frame_id!=undefined && this.force_frame_id>=0)this.frame_id = this.force_frame_id;
		}
	}
	Mesh.prototype.resetThis=function(now) {
		this.last = now;
		this.pauseSum = 0;
	}
	Mesh.prototype.pauseThis=function(now) {
		if(!this.paused) {
			this.pauseTime = now;
			this.paused = true;
		}
	}
	Mesh.prototype.resumeThis=function(now) {
		if(this.paused) {
			this.pauseSum += now - this.pauseTime;
			this.paused = false;
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
		
		if(g_params["fix_rotation"]>0.5) {
			if(g_params["flip_wh"]<0.5 && params.w > params.h) {
				var rmode = g_params["fix_rotation_mode"];
				FaceUnity.SetRotationMode(rmode);
			}
			if(g_params["flip_wh"]>0.5 && params.w < params.h) {
				var rmode = g_params["fix_rotation_mode"];
				FaceUnity.SetRotationMode(rmode);
			}
		}
		
		if(V(globals.use_fov,0)>0.5){
			mat_proj = FaceUnity.CreateProjectionMatrix_FOV(V(globals.camera_fov,20));
		}else{
			mat_proj = FaceUnity.CreateProjectionMatrix();
		}
		var shaderParams = {
		    scales: [this.scales[0] * SCALE, this.scales[1] * SCALE, this.scales[2] * SCALE],
		    scale_e: scale_ex,
		    mat_view: this.mat,
		    mat_cam: this.mat_cam,
		    quatR1:[this.rotation[0],this.rotation[1],this.rotation[2],this.rotation[3]],
		    quatT1: [0, 0, 0],//[params.translation[0],params.translation[1],params.translation[2],1],
		    quatR2: [0, 0, 0, 1],
		    quatT2: [0, 0, 0],//[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]],
		    obj_type: V(matex.obj_type, 0.3),
		    mat_proj: mat_proj,
		    tex_albedo: albedo,
		    lbrt: lbrt,
			tex_mask: tex_map[V(matex.tex_changemask, "grey.png")],
			enable_change: V(matex.enable_change, 0.0),
			color_change: RGB2HSV(V(matex.color_change, [1,1,1])),
			satura_scale: V(matex.satura_scale,1.0),
			bright_scale: V(matex.bright_scale,1.0),
		    tex_normal: tex_map[V(matex.tex_normal, "grey.png")],
		    tex_smoothness: tex_map[V(matex.tex_smoothness, "grey.png")],
		    normal_strength: V(matex.normal_strength, 0.0),
		    tex_light_probe: tex_light_probe,
		    envmap_shift: V(globals.envmap_shift, 0.75),
		    envmap_fov: V(globals.envmap_fov, 1.0),
		    Ka: V(matex.Ka, 0.0), Kd: V(matex.Kd, 0.3), Ks: V(matex.Ks, 0.2), Kr: V(matex.Kr, 0.0),
		    roughness: V(matex.roughness, 0.5),
		    has_tex_smoothness: V(matex.has_tex_smoothness, 0.0),
		    is_hair: pass > 0,
		    ior: V(matex.ior, 1.33),
		    F0: V(matex.F0, 1.0),
		    L0_dir: L0_dir, L0_color: L0_color,
		    L1_dir: L1_dir, L1_color: L1_color,
		    isFlipH: g_params['is3DFlipH'],
		    weightOffset: g_params['weightOffset'],
		    //L2_dir:[0.25,0,-1],L2_color:[2.0,2.0,2.0],
		};

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
		} else {
		    shaderUse = s_vert_shader;
		}
		if (this.translate != null && this.translate != undefined &&
            this.rotate != null && this.rotate != undefined &&
            this.transform != null && this.transform != undefined &&
			this.scale != null && this.scale != undefined) {
		    shaderParams.trans_pos = this.translate;
		    shaderParams.rot_mat1 = [this.rotate[0], this.rotate[1], this.rotate[2]];
		    shaderParams.rot_mat2 = [this.rotate[3], this.rotate[4], this.rotate[5]];
		    shaderParams.rot_mat3 = [this.rotate[6], this.rotate[7], this.rotate[8]];
		    shaderParams.model_mat = this.transform;
			shaderParams.scale = this.scale;
		} else {
		    shaderParams.rot_mat1 = [1, 0, 0];
		    shaderParams.rot_mat2 = [0, 1, 0];
		    shaderParams.rot_mat3 = [0, 0, 1];
		    shaderParams.trans_pos = [0, 0, 0];
		    shaderParams.model_mat = [1, 0, 0, 0,
                                      0, 1, 0, 0,
                                      0, 0, 1, 0,
                                      0, 0, 0, 1];
			shaderParams.scale = [1, 1, 1];
		}
		if (animation != null) {
		    if (animation.use_vtf == 1) 
		        shaderUse = "#define USE_VTF\n" + shaderUse;
		}
		var cull = V((materials_json[this.name] || {}).back_cull, 0);
		var glcullface=gl.getParameter(gl.CULL_FACE);
		var glfrontface=gl.getParameter(gl.FRONT_FACE);
		var glcullfacemode=gl.getParameter(gl.CULL_FACE_MODE);
		if(cull>0.5){
			gl.enable(gl.CULL_FACE);
			gl.frontFace(gl.CCW);
			if(g_params['is3DFlipH']<0.5)
				gl.cullFace(gl.BACK); 
			else
				gl.cullFace(gl.FRONT);
		}
		else
			gl.disable(gl.CULL_FACE);
		
		FaceUnity.RenderBlendshapeComponent_new2(blendshape, this, shaderUse, shader, shaderParams, pass);

		if(glcullface)
			gl.enable(gl.CULL_FACE);
		else
			gl.disable(gl.CULL_FACE);
		gl.frontFace(glfrontface);
		gl.cullFace(glcullfacemode);

	}

	//meshgroup
	var MeshGroup = function (filename) {
	    this.meshName = filename;
	    this.blendshape = FaceUnity.LoadBlendshapeFacePupFloat(filename + ".json", filename + ".bin");
		////P noly
		this.blendshape.drawcalls.forEach(function (dc) {
	        dc.ofs_PNbk = dc.ofs_PN;
	        dc.ofs_PN = dc.ofs_PN ;
	    });
		////
		
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
	MeshGroup.prototype.setDCHash = function () {
	    this.blendshape.drawcalls.forEach(function (dc) {
	        dc.shader_hash_0 = undefined;
	        dc.shader_hash_1 = undefined;
	        dc.shader_hash_2 = undefined;
	    });
	}
	MeshGroup.prototype.ReloadThingsForEditor = function () {
	    //因为用户可能什么参数都没设……obj导出的贴图也还是load一下吧
	    this.blendshape.drawcalls.forEach(function (dc) {
	        if (dc.mat.tex && !tex_map[dc.mat.tex]) {
	            tex_map[dc.mat.tex] = FaceUnity.LoadTexture(dc.mat.tex);
	        }
	    });
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
	    for (var i = 0; i < this.blendshape.drawcalls.length; i++) {
	        var nmesh = new Mesh(this.blendshape.drawcalls[i], null);
	        if (materials_json[this.blendshape.drawcalls[i].name] != null &&
                materials_json[this.blendshape.drawcalls[i].name] != undefined)
	            nmesh = new Mesh(this.blendshape.drawcalls[i], materials_json[this.blendshape.drawcalls[i].name].anim);
	        this.meshlst.push(nmesh);
	        this.meshlst[nmesh.name] = nmesh;
	        if (nmesh.isactiveonce) this.AnimCounter.total++;
	    }
	}
	MeshGroup.prototype.resetMesh = function () {
		var now = Date.now();
		this.meshlst.forEach(function(mesh) {
			mesh.resetThis(now);
		});
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
	        //update for all mesh
	        this.meshlst.forEach(function (mesh) {
				if(params.isPause) mesh.pauseThis(now);
				else mesh.resumeThis(now);
	            mesh.triggerStartEvent(params, now, false);
	            mesh.updateEvent(params, now);
	        });
	        if (pass == 1) {
				//var expr = [1,0];
				
				//var expression = params.expression.slice();
				//params.expression = expr;
				
				
				if(need_recompute_facepup){
					params["facepup_expr"] = facepup_expr;
					var datenow = Date.now();
					//console.log("==>FacePupWithCoefFloat");
					//facepup_expr[1]=1.0;
					//facepup_expr[2]=1.0;
					var scales = FaceUnity.FacePupWithCoefFloat(this.blendshape, undefined,params,1);
					for(var di = 0; di < this.blendshape.drawcalls.length; di++){
						this.blendshape.drawcalls[di].scales[0] = scales[di*3 + 0];
						this.blendshape.drawcalls[di].scales[1] = scales[di*3 + 1];
						this.blendshape.drawcalls[di].scales[2] = scales[di*3 + 2];
						this.meshlst[di].scales[0] = scales[di*3 + 0];
						this.meshlst[di].scales[1] = scales[di*3 + 1];
						this.meshlst[di].scales[2] = scales[di*3 + 2];
					}
					//console.log("FacePupWithCoefFloat:scales:",scales);
					console.log("recompute cost:",(Date.now()-datenow),"ms");
					need_recompute_facepup = 0;
					facepup_mode = 0;
					computeonce = 1;
				}
				//params.expression = expression;
				//for(var i=0;i<params.expression.length;i++)params.expression[i]=0;
				//params.expression[22] = 1.0;
				//params.expression[0] = 1.0;
				//params.expression[1] = 1.0;
				//for(var i=0;i<20;i++)params.expression[i]=1.0;
				if(facepup_mode){
					var expression = params.expression.slice();
					params.expression = facepup_expr;
					FaceUnity.ComputeBlendshapeGeometryRawFloat(this.blendshape,params,facepup_expr.length,1);
					params.expression = expression;
				}else{
					if(computeonce){
						FaceUnity.ComputeBlendshapeGeometryRawFloat(this.blendshape,params);
					}else{
						console.log("should need_recompute_facepup once");
						return;
					}
				}
	            //for facehack
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthFunc(gl.LEQUAL);
	            gl.enable(gl.BLEND);
	            gl.blendFunc(gl.ZERO, gl.ONE);
	            this.facehack_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(parent.blendshape, params, -1, shader, animation, fid); });
	            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	        } else if (pass == 2) {
	            //for opaque object
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthFunc(gl.LEQUAL);
	            gl.depthMask(true);
	            gl.disable(gl.BLEND);
	            this.opaque_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(parent.blendshape, params, 0, shader, animation, fid); });

	            //for transport object, alpha cut pass one
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthMask(true);
	            shader = s_frag_shader + "vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a>=" + alphaThreshold.toFixed(3) + ") return vec4(c.rgb,1.0);else discard;}";
	            this.transparent_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(parent.blendshape, params, 1, shader, animation, fid); });

	            //for transport object, alpha cut pass two
	            gl.enable(gl.DEPTH_TEST);
	            gl.depthMask(false);
	            gl.enable(gl.BLEND);
	            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
	            shader = s_frag_shader + "vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a<=" + alphaThreshold.toFixed(3) + ") return vec4(c.rgb,c.a*" + (1.0 / alphaThreshold).toFixed(3) + ");else return vec4(c.rgb,0.0);}";
	            this.transparent_mesh_ref_lst.forEach(function (mesh) { mesh.renderEvent(parent.blendshape, params, 2, shader, animation, fid); });

	            gl.depthMask(true);
	            gl.disable(gl.DEPTH_TEST);

	            this.meshlst.forEach(function (mesh) { mesh.triggerEndEvent(params, now, false, parent.AnimCounter); });
	        }
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
		this.nofaceFrame = 0;

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
	    this.update_animation = function(params) {
	        if (this.animation.animating) this.animation.update_callback(this.animation, params);
	    }
	    this.DoRender = function (params, pass, noface) {
	        if (this.animation != null) {
	            if (this.animation.support_vtf == -1) { //check vtf
	                var ret = 1;
	                if (FaceUnity.TestVTF != undefined)
	                    ret = FaceUnity.TestVTF();
	                this.animation.support_vtf = ret;
	                this.animation.use_vtf = ret;
	            }

	            var frame_id = 0;
	            if (frame_id == params.frame_id && !noface) return;
	            frame_id = params.frame_id;
				
				if(noface) {
					frame_id = this.nofaceFrame;
					params.frame_id = this.nofaceFrame;
					this.nofaceFrame++;
				}
				
	            var fid = 0;
	            params.physical = this.animation.physical;
	            if (canUsePhysical && this.animation.physical == 1 && params.main_bone === undefined) {
	                var json = JSON.parse(bones_json_string);
	                var count = json.bonesnum.sum;
	                for (var i = count - 1; i >= 0; i--) {
	                    var name = json["bone" + i]["name"];
	                    if (name === "main1") {
	                        params.main_bone = i;
	                    }
	                }
	                filterAct(params);
	            }
                
	            this.update_animation(params);
	            this.meshgroup.renderMesh(params, pass, this.animation, fid);
	        } else
	            this.meshgroup.renderMesh(params, pass, null, 0);
	    }
	}

	if (FaceUnity.InitPhysics != undefined && FaceUnity.IsPhysicsEnabled == undefined) {
	    if (canUsePhysical) {
	        FaceUnity.IsPhysicsEnabled = true
	        FaceUnity.InitPhysics(rigidBody_json_string, joint_json_string, bones_json_string);
	    }
	}

	var AnimMeshs = {};
	var avatarJson = JSON.parse(FaceUnity.ReadFromCurrentItem("avatar.json")||"{}");
	if(avatarJson["drawcalls"] && avatarJson["drawcalls"].length>0)
		AnimMeshs["avatar"] = new AnimationMeshPair("avatar");
	
	function AdjustZFov(oldZ) {
		var multiFace = FaceUnity.GetFaceIdentifier(20) == 1 ? false : true; 
		
		var asp = FaceUnity.g_image_w / FaceUnity.g_image_h;
		var fov = 25.0;
		if(multiFace) {
			if(FaceUnity.g_image_w < FaceUnity.g_image_h) fov *= asp;
		}
		var fovZ = oldZ;
		if(globals["use_fov"] > 0.5)
			fovZ = Math.tan((fov / 2.0)*DEG2RAD) * oldZ / Math.tan((globals["camera_fov"] / 2.0)*DEG2RAD);
		return fovZ;
	}

	var fMeshs = fbxmeshs.meshes;
	for (var i = 0; i < fMeshs.length; i++) {
	    var meshName = fMeshs[i];
	    AnimMeshs[meshName] = new AnimationMeshPair(meshName);
	}
	if(!fMeshs || fMeshs == undefined || fMeshs.length == 0)  
		fMeshs = ["avatar"];

	var animations = require("anim_dq_script.js");
	var animlist = animations.Anims;
	
    //animations trigger
	var UpdateAnimation = function (anim, params, noface) {
	    if (anim != undefined && anim != null && "meshName" in anim) {
	        var istriggerd = false;
	        if (anim.triggerstart == "alwaysrender" && !anim.betriggered &&
				!(anim.looptype == "loopcnt" && anim.play_count >= anim.loopcnt) &&
				!(anim.isactiveonce == 1 && anim.play_count >= 1) &&
				!(anim.triggerend == "faceaction" && isActionTriggered(anim.endaction, params))) {
					var pair = AnimMeshs[anim.meshName];
					if (pair.animation != anim) {
						istriggerd = true;
						anim.bind(pair);
					}
	        } else if ((((anim.triggerstart == "faceaction" && isActionTriggered(anim.startaction, params)) ||
                    (anim.triggerstart == "newface")) && !noface &&
                    (!anim.betriggered || anim.startaction == "null")) &&
					!(anim.looptype == "loopcnt" && anim.play_count >= anim.loopcnt) &&
					!(anim.isactiveonce == 1 && anim.play_count >= 1) &&
					!(anim.triggerend == "faceaction" && isActionTriggered(anim.endaction, params))) {
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
	                anim.pause();
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
	
	try {
		if(FaceUnity.DisableTongueCoefs)
			FaceUnity.DisableTongueCoefs();
	} catch(err){console.log(err.stack);}
	
	
	var blendshapenum = AnimMeshs[fMeshs[0]].meshgroup.blendshape.drawcalls[0].blendshapenum;
	console.log("blendshapenum:",blendshapenum);
	var mod47 = (blendshapenum+1)%47;
	if(mod47){
		console.log("Error:invalid facepup blendshape format");
	}
	var facepup_cnt = (blendshapenum+1)/47 - 1;
	if(facepup_cnt<1){
		console.log("Error:no facepup blendshape");
	}
	for(var i =0;i<facepup_cnt;i++)facepup_expr.push(0.0);
	
	return {
	    CalRef: AnimMeshs[0] ? AnimMeshs[0].meshgroup.calTriggerNextNodesRef:undefined,
	    meshlst: AnimMeshs[0] ? AnimMeshs[0].meshgroup.meshlst:undefined,
		animCounter: AnimCounter,
		//接下来就是道具对象的内容了
		/// \brief 处理编辑器发起的参数修改
		SetParam:function(name,value){
			//特殊参数名'@refresh'表示“刷新一下”
			if(name=='@refresh'){
			    ReloadThingsForEditor();
			    for (var prop in AnimMeshs)
			        AnimMeshs[prop].meshgroup.ReloadThingsForEditor();
				return 1;
			}
			if(name=='need_recompute_facepup'){
				need_recompute_facepup = 1;
				return 1;
			}
			if(name=='enter_facepup'){
				facepup_mode = 1;
				return 1;
			}
			if(name=='quit_facepup'){
				facepup_mode = 0;
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
			if(name=="weightOffset"){
				g_params[name]=value;
				return 1;
			}

			if (name == "rot_delta") {
			    rot_delta += value * Math.PI * 0.5;
			    globalRotationQuat = [0.0, Math.sin(rot_delta), 0.0, Math.cos(rot_delta)];
			    rot_ex = FaceUnity.CreateViewMatrix(globalRotationQuat, [0, 0, 0, 1]);
			    return 1;
			}
			if (name == "scale_delta") {
			    scale_delta = Math.max(Math.min(scale_delta + value, 1.0), -0.26);
			    scale_ex = 1.0 + scale_delta;
			    return;
			}
			
			if(name=="resetFlag") {
				if(value != 0) {
					for (var prop in AnimMeshs)
						AnimMeshs[prop].meshgroup.resetMesh();
				}
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
			if (name=="fix_rotation_mode"){
				g_params["fix_rotation_mode"] = value;
				return 1;
			}
			if (name=="fix_rotation"){
				g_params["fix_rotation"] = value;
				return 1;
			}
			if (name=="flip_wh") {
				g_params["flip_wh"] = value;
				return 1;
			}
			if (name=="setAnimFrame") {
				animations.SetFrame(value);
				return 1;
			}
			if(name=='clear_facepup'){
				for(var i=0;i<facepup_expr.length;i++){
					facepup_expr[i]=0;
				}
				return 1;
			}
			/*
			否则的话，name里面就是一个JSON对象：{"name":"材质名或<global>"，"param":"参数名"}
			接着就是根据不同情况找到参数的位置设上值。考虑到每个部分都可能写错，处理一下异常会安全一些。
			有特殊需求的话，可以在这里进行一定的合法性检查。
			*/
			try{
				console.log("parse:",name);
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
					return 1;
				}else if(desc.name=="facepup"){
					var facepupkey = desc.param;
					if(facepupkey < 1 || facepupkey>facepup_expr.length){
						console.log("Facepup key invalid:",facepupkey);
						console.log("Has ",facepup_cnt,"facepup channel");
						return 0;
					}else{
						facepup_expr[facepupkey-1] = value;	
						return 1;
					}
				}
				else{
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
			if(name == "animFrameCount") return animations.GetAnimFrameCount();
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
			if(g_params.isFlipExpr>0.5){
				//filp rotation 
				var rotation = params.rotation.slice();
				//rotation[0] = -rotation[0];
				rotation[1] = -rotation[1];
				rotation[2] = -rotation[2];
				params.rotation = rotation;
				
				//filp exp
				for (var i = 0;i<swaplst.length;i+=2){
					var tmp = params.expression[swaplst[i]];
					params.expression[swaplst[i]] = params.expression[swaplst[i+1]];
					params.expression[swaplst[i+1]] = tmp;
				}
				// fack eye rot
				params.pupil_pos[0] = -params.pupil_pos[0];
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
				while(params.expression.length<bsCount)
					params.expression.push(0.0);
				for(var i =0;i<bsCount;i++){
					if(params.expression[i]==undefined) params.expression[i] = 0.0;
					params.expression[i] = Math.max(Math.min(params.expression[i],1.0),0.0);
				}
			}
			
			//animation trigger
			for (var prop in animlist) {
			    UpdateAnimation(animlist[prop], params, false);
			}
			//3d item trigger & DoRender
			for (var prop in AnimMeshs) {
			    AnimMeshs[prop].DoRender(params, pass, false);
			}
		},
		RenderNonFace: function (params, pass) {  
		    ////fixed section
		    if (params.face_count > 0) return;
			var isNoFace = V(globals.isnofacerender, 0) > 0.5;
		    if (isNoFace) {
		        for (var ap in animlist) 
		            UpdateAnimation(animlist[ap], params, true);
		    }
		    for (var prop in AnimMeshs) {
		        var meshgrp = AnimMeshs[prop].meshgroup;
		        if (meshgrp.last_state == 1 && !params.face_count) {
		            for (var i = 0; i < meshgrp.meshlst.length; i++) meshgrp.meshlst[i].switchState(meshgrp.last_state, 0);
		            meshgrp.last_state = 0;
		        }
		        try {
		            if (isNoFace) {
		                params.translation = [V(globals.fixed_nx, 0), V(globals.fixed_ny, 0), V(globals.fixed_nz, 350), 1];
		                params.rotation = [0, 0, 0, 1];
		                params.pupil_pos = [0, 0];
		                params.expression = expression;
		                if (!params.focal_length) params.focal_length = focal_length;
		                AnimMeshs[prop].DoRender(params, pass, true);
		            }
		        } catch (err) {
		            console.log(err.stack);
		        }
		    }
		},
		name:V(globals.name,"unnamed"),
	};
})()