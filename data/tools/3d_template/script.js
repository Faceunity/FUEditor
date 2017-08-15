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
	///////////////////////////
	//以下是材质参数
	/*物体的类型,一是镂空,[0,0.25]；
				二是会完全随着脑袋旋转和缩放,(0.25,0.5]；
				三是权重控制旋转的幅度（前提是有对应主obj的weight.png,例如aa.obj对应的权重贴图是aa_weight.png）,(0.5,0.75]；
				四是只会跟着脑袋位移变化和大小的缩放，例如身体(0.75,1]。
	*/
	//@mparam obj_type {"type":"slider","min":0,"max":1,"default_value":0.3}
	//半透明算法阈值，设为1.0适合普通简单的半透明物体，设为0.5适合头发
	//@gparam alphaThreshold {"type":"edit","default_value":"1.0"}
	//法向贴图，就是蓝了吧唧的那种，不是bump map哦～bump map要先转一下哦～～ 默认的grey.png等于没有贴图
	//@mparam tex_normal {"type":"texture","default_value":""}
	//法向贴图的强度，为了照顾没有法向贴图的模型，强度默认是0，所以设了法向贴图之后要把强度拽高点才能看到效果
	//@mparam normal_strength {"type":"slider","min":0,"max":1,"default_value":0}
	//颜色贴图，默认的white.png是白的。建议先弄好贴图再去调光哦。
	//@mparam albedo {"type":"texture","default_value":"white.png","isTex":1}
	//自发光强度
	//@mparam Ka {"type":"slider","min":0,"max":1,"default_value":0.8}
	//漫反射强度
	//@mparam Kd {"type":"slider","min":0,"max":1,"default_value":0.1}
	//高光强度，注意高光不受颜色贴图影响
	//@mparam Ks {"type":"slider","min":0,"max":1,"default_value":0.2}
	//环境图反射强度
	//@mparam Kr {"type":"slider","min":0,"max":1,"default_value":0.0}
	//表面粗糙度。越大高光越分散，越小高光越集中
	//@mparam roughness {"type":"slider","min":0.02,"max":1,"default_value":0.5}
	//高光强度贴图。在alpha通道里放的是影响高光和反射的权重，越大表示越亮。可以和颜色贴图放在一起哦。
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
	var globals=JSON.parse(FaceUnity.ReadFromCurrentItem("globals.json")||"{}");
	var materials_json=JSON.parse(FaceUnity.ReadFromCurrentItem("materials.json")||"{}");
	//下面是正常的三维道具绘制流程
	var blendshape=FaceUnity.LoadBlendshape("avatar.json","avatar.bin");
	var s_vert_shader=FaceUnity.ReadFromCurrentItem("vert.glsl");
	var s_frag_shader=FaceUnity.ReadFromCurrentItem("frag.glsl");
	//背景动画
	//var bg_board=JSON.parse(FaceUnity.ReadFromCurrentItem("desc.json"));
	//var tex_bg=FaceUnity.LoadTexture("bg.jpg");
	//var tex_joker = FaceUnity.LoadTexture("joker.png");
	/*
	从这里开始开始涉及到编辑器中需要操作的参数。为了加快编辑速度，需要在script.js中提供动态重载的接口，
	所以这里在初始化时并没有设置参数值，而是抽象出了一个ReloadThingsForEditor函数供编辑器随时调用。
	*/
	
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
		L0_color=CreateColor(V(globals.L0_R,1),V(globals.L0_G,1),V(globals.L0_B,1), V(globals.L0_log_intensity,0));
		L1_color=CreateColor(V(globals.L1_R,1),V(globals.L1_G,1),V(globals.L1_B,1), V(globals.L1_log_intensity,-2));
		//编辑器在改了贴图之后会自动把文件转换成webp拷贝到工作区里，但是并不会帮着调LoadTexture，所以这里要调一下
		tex_light_probe=FaceUnity.LoadTexture(V(globals.tex_light_probe,"beach_1_4.jpg"));
		//因为用户可能什么参数都没设……obj导出的贴图也还是load一下吧
		blendshape.drawcalls.forEach(function(dc){
			if(dc.mat.tex&&!tex_map[dc.mat.tex]){
				tex_map[dc.mat.tex]=FaceUnity.LoadTexture(dc.mat.tex);
			}
		});
		//对每个物体
		for(var sname in materials_json){
			//看一下是不是改过材质
			var mat=materials_json[sname];
			if(typeof(mat)=='object'){
				//然后在材质参数里面找tex_开头看着像贴图的
				for(var skey in mat){
					if(skey.match(/^tex_.*/)){
						//如果没有load过，就不管三七二十一load一下再说
						var fn=mat[skey];
						if(!tex_map[fn]){
							tex_map[fn]=FaceUnity.LoadTexture(fn);
						}
					}
				}
			}
		}
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
	var dcs0=blendshape.drawcalls.filter(function(dc){return dc.name.indexOf("face_hack")>=0;});
	var dcs1=blendshape.drawcalls.filter(function(dc){return !(dc.name.indexOf("face_hack")>=0);});
	blendshape.drawcalls=dcs0.concat(dcs1);
	return {
		//接下来就是道具对象的内容了
		/// \brief 处理编辑器发起的参数修改
		SetParam:function(name,value){
			//特殊参数名'@refresh'表示“刷新一下”
			if(name=='@refresh'){
				ReloadThingsForEditor();
				return 1;
			}
			/*
			否则的话，name里面就是一个JSON对象：{"name":"材质名或<global>"，"param":"参数名"}
			接着就是根据不同情况找到参数的位置设上值。考虑到每个部分都可能写错，处理一下异常会安全一些。
			有特殊需求的话，可以在这里进行一定的合法性检查。
			*/
			try{
				var desc=JSON.parse(name);
				if(desc.thing=="<global>"){
					globals[desc.param]=value;
					if (desc.param=="alphaThreshold"){
						blendshape.drawcalls.forEach(function(dc){
							dc.shader_hash_0=undefined;
							dc.shader_hash_1=undefined;
							dc.shader_hash_2=undefined;
						});
					}
					return 1;
				}else{
					var dc=materials_json[desc.thing];
					if(!dc){
						dc={};
						materials_json[desc.thing]=dc;
					}
					dc[desc.param]=value;
					return 1;
				}
			}catch(err){console.log(err.stack);}
			return 0;
		},
		/// \brief 给编辑器提供用来在界面上显示的参数值，或者将需要保存的东西返回给编辑器
		GetParam:function(name){
			//前面两个是保存用的
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
		Render:function(params){
			//一定要记得处理异常哦，要不然脚本没法调试了
			try{
				if((params.face_ord < FaceUnity.m_n_valid_faces-1)){
					faces.push(params);
					//要再画个面具的话可以加载一个贴图，然后去掉下面的注释
					//FaceUnity.RenderAR(tex_joker);
					//gl.enable(gl.DEPTH_TEST);
					//gl.depthFunc(gl.LEQUAL);
					//gl.depthMask(true);
					//gl.disable(gl.DEPTH_TEST);
					return;
				}
				faces.push(params);
				
				//贴图
				//for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
					//要再画个面具的话可以加载一个贴图，然后去掉下面的注释
					//FaceUnity.RenderAR(tex_joker);
				//}
				//设置一些OpenGL的流水线状态。具体是什么看GL的文档就好了。
				//如果要单面绘制的话可以gl.enable(gl.CULL_FACE);
				gl.enable(gl.DEPTH_TEST);
				gl.depthFunc(gl.LEQUAL);
				
				//face hack
				for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
					params = faces[faceIndex];
					
					//首先用ComputeBlendshapeGeometry计算blendshape动画并且上传模型数据
					var frame_id=params.frame_id;
					FaceUnity.ComputeBlendshapeGeometry(blendshape,params);
					
					var pass = 0;
					//遍历每个材质
					blendshape.drawcalls.forEach(function(dc){
						//取出编辑器提供的材质参数
						var matex=(materials_json[dc.name]||{});
						//判断这个材质是不是应该在当前这个pass画的
						if((V(matex.is_hair,0)<0.5)==(pass>0)){
							return;
						}
						//face hack
						if(V(matex.obj_type,0.3)<=0.25){
							//console.log(dc.mat.tex);
							var mat=FaceUnity.CreateViewMatrix(
								[-params.rotation[0],-params.rotation[1],-params.rotation[2],params.rotation[3]],
								params.translation);
							var mat_cam=FaceUnity.CreateViewMatrix(
								[0,0,0,1],
								params.translation);
							
							if(V(matex.is_eye,dc.is_eye)){
								/*
								眼球需要先绕着眼球中心转一下瞳孔，再进入整个头部的刚体变换。
								我们的矩阵是右乘制，所以是这个顺序。
								*/
								mat=FaceUnity.MatrixMul(
									FaceUnity.CreateEyeMatrix(
										[dc.P_center[0]*SCALE,dc.P_center[1]*SCALE,-dc.P_center[2]*SCALE],
										[params.pupil_pos[0]*V(globals.eye_rot_scale,1.5),params.pupil_pos[1]]),
									mat);
							}
							//对于头发胡子之类的复杂透明物体，需要在给定的刚体变换矩阵下进行深度排序。z_sort_matrix就是排序用的矩阵
							var z_sort_matrix=undefined;
							dc.use_custom_gl_states=1;
							if(dc.is_eye){
								mat=FaceUnity.MatrixMul(
								FaceUnity.CreateEyeMatrix(
									[dc.P_center[0]*SCALE,dc.P_center[1]*SCALE,-dc.P_center[2]*SCALE],
									[params.pupil_pos[0],params.pupil_pos[1]]),
								mat);
							}	
							
							dc.use_custom_gl_states = 1;
							gl.enable(gl.DEPTH_TEST);
							gl.depthMask(1);
							gl.enable(gl.BLEND);
							gl.blendFunc(gl.ZERO,gl.ONE);
							FaceUnity.RenderBlendshapeComponent(blendshape,dc,s_vert_shader,s_frag_shader,{
								scales:[dc.scales[0]*SCALE,dc.scales[1]*SCALE,-dc.scales[2]*SCALE],
								mat_view:mat,
								mat_cam:mat_cam,
								quatR1:[params.rotation[0],params.rotation[1],params.rotation[2],params.rotation[3]],
								quatT1:[0,0,0],//[params.translation[0],params.translation[1],params.translation[2],1],
								quatR2:[0,0,0,1],
								quatT2:[0,0,0],//[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]],
								obj_type:V(matex.obj_type, 0.3),
								mat_proj:FaceUnity.CreateProjectionMatrix(),
								tex_albedo:tex_map[V(matex.tex_albedo,dc.mat.tex)],
								tex_normal:tex_map[V(matex.tex_normal,"grey.png")],
								tex_smoothness:tex_map[V(matex.tex_smoothness,"grey.png")],
								normal_strength:V(matex.normal_strength,0.0),
								tex_light_probe:tex_light_probe,
								envmap_shift:V(globals.envmap_shift,0.75),
								envmap_fov:V(globals.envmap_fov,1.0),
								Ka:V(matex.Ka,0.0), Kd:V(matex.Kd,0.3), Ks:V(matex.Ks,0.2), Kr:V(matex.Kr,0.0),
								roughness:V(matex.roughness,0.5),
								has_tex_smoothness:V(matex.has_tex_smoothness,0.0),
								is_hair:pass==1,
								ior:V(matex.ior,1.33),
								F0:V(matex.F0,1.0),
								L0_dir:L0_dir,L0_color:L0_color,
								L1_dir:L1_dir,L1_color:L1_color,
								//L2_dir:[0.25,0,-1],L2_color:[2.0,2.0,2.0],
							},z_sort_matrix);//最后的隐藏参数是深度排序用的矩阵，undefined表示不排序。
							
							gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
							gl.disable(gl.BLEND);
							dc.use_custom_gl_states = 0;
						}
					});// end blendshape.drawcalls.forEach(function(dc)
				}
				//bg_board.uniforms={"iGlobalTime":params.frame_id/30,"iResolution":[params.tracker_space_w,params.tracker_space_h]};
				//背景动画
				/*for(var i=0;i<bg_board.length;i++){
					FaceUnity.RenderBillboard(tex_bg,bg_board[i],bg_board[i].texture_frames[(frame_id)%bg_board[i].texture_frames.length]);
				}*/
				//背景不动
				/*var scale=(20000/params.focal_length);
				var scale_tex=Math.min(tex_bg.w/params.tracker_space_w,tex_bg.h/params.tracker_space_h);
				var w_tex=(scale_tex*params.tracker_space_w)/tex_bg.w;
				var h_tex=(scale_tex*params.tracker_space_h)/tex_bg.h;
				var x_tex=(1.0-w_tex)*0.5;
				var y_tex=(1.0-h_tex)*0.5;
				FaceUnity.RenderBillboard(tex_bg,bg_board,{
					"v":[scale*params.tracker_space_w/2,-scale*params.tracker_space_h/2,scale*params.focal_length,
						-scale*params.tracker_space_w/2,-scale*params.tracker_space_h/2,scale*params.focal_length,
						-scale*params.tracker_space_w/2,scale*params.tracker_space_h/2,scale*params.focal_length,
						scale*params.tracker_space_w/2,scale*params.tracker_space_h/2,scale*params.focal_length],
					"vt":[
						x_tex+w_tex,y_tex,
						x_tex,y_tex,
						x_tex,y_tex+h_tex,
						x_tex+w_tex,y_tex+h_tex],
					//"vt":[1,0, 0,0, 0,1, 1,1],
				});*/
				
				//mesh
				for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
					params = faces[faceIndex];
					
					//首先用ComputeBlendshapeGeometry计算blendshape动画并且上传模型数据
					var frame_id=params.frame_id;
					FaceUnity.ComputeBlendshapeGeometry(blendshape,params);
					var shader;
					/*
					使用AlphaTest+Blend，使得头发等透明物体可以不经深度排序而得到较为自然的渲染效果
					将alphaThreshold改为0.5，可正确绘制头发
					将alphaThreshold改为1.0，可正确绘制半透明物体
					*/
					var alphaThreshold = parseFloat(V(globals.alphaThreshold, "1.0"));
					for(var pass=0;pass<3;pass++){
						if (pass==0) {
							gl.enable(gl.DEPTH_TEST);
							gl.depthFunc(gl.LEQUAL);
							gl.depthMask(true);
							gl.disable(gl.BLEND);
							shader=s_frag_shader+"vec4 shader_main_OIT(){vec4 c=shader_main();return vec4(c.rgb,1.0);}";
						} else if (pass==1) {
							gl.enable(gl.DEPTH_TEST);
							gl.depthMask(true);
							shader=s_frag_shader+"vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a>" + alphaThreshold.toFixed(3) 
								+ ") return vec4(c.rgb,1.0);else discard;}";
						} else if (pass==2) {
							gl.enable(gl.DEPTH_TEST);
							gl.depthMask(false);
							gl.enable(gl.BLEND);
							gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
							shader=s_frag_shader+"vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a<=" + alphaThreshold.toFixed(3) 
								+ ") return vec4(c.rgb,c.a*" + (1.0/alphaThreshold).toFixed(3) + ");else return vec4(c.rgb,0.0);}";
						}
						//遍历每个材质
						blendshape.drawcalls.forEach(function(dc){
						//取出编辑器提供的材质参数
							var matex=(materials_json[dc.name]||{});
							//判断这个材质是不是应该在当前这个pass画的
							if((V(matex.is_hair,0)<0.5)==(pass>0)){
								return;
							}
							//mesh
							if(V(matex.obj_type,0.3)<0.25){
								
							}else{
								//console.log(dc.mat.tex);
								var mat=FaceUnity.CreateViewMatrix(
									[-params.rotation[0],-params.rotation[1],-params.rotation[2],params.rotation[3]],
									params.translation);
								var mat_cam=FaceUnity.CreateViewMatrix(
									[0,0,0,1],
									params.translation);
								if(V(matex.is_eye,dc.is_eye)){
									/*
									眼球需要先绕着眼球中心转一下瞳孔，再进入整个头部的刚体变换。
									我们的矩阵是右乘制，所以是这个顺序。
									*/
									mat=FaceUnity.MatrixMul(
										FaceUnity.CreateEyeMatrix(
											[dc.P_center[0]*SCALE,dc.P_center[1]*SCALE,-dc.P_center[2]*SCALE],
											[params.pupil_pos[0]*V(globals.eye_rot_scale,1.5),params.pupil_pos[1]]),
										mat);
								}
								dc.use_custom_gl_states=1;
								dc.use_OIT_shader=1;

								//if(dc.name.indexOf('body')>=0){
								if(V(matex.obj_type,0.3)>0.75){
									
									//keep the rotation center invariant
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
								
								
								if(dc.is_eye){
									mat=FaceUnity.MatrixMul(
										FaceUnity.CreateEyeMatrix(
											[dc.P_center[0]*SCALE,dc.P_center[1]*SCALE,-dc.P_center[2]*SCALE],
											[params.pupil_pos[0],params.pupil_pos[1]]),
										mat);
								}
							
								FaceUnity.RenderBlendshapeComponent_new(blendshape,dc,s_vert_shader,shader,{
									scales:[dc.scales[0]*SCALE,dc.scales[1]*SCALE,-dc.scales[2]*SCALE],
									mat_view:mat,
									mat_cam:mat_cam,
									quatR1:[params.rotation[0],params.rotation[1],params.rotation[2],params.rotation[3]],
									quatT1:[0,0,0],//[params.translation[0],params.translation[1],params.translation[2],1],
									quatR2:[0,0,0,1],
									quatT2:[0,0,0],//[mat2[12]-center[0],mat2[13]-center[1],mat2[14]-center[2]],
									obj_type:V(matex.obj_type, 0.3),
									mat_proj:FaceUnity.CreateProjectionMatrix(),
									tex_albedo:tex_map[V(matex.tex_albedo,dc.mat.tex)],
									tex_normal:tex_map[V(matex.tex_normal,"grey.png")],
									tex_smoothness:tex_map[V(matex.tex_smoothness,"grey.png")],
									normal_strength:V(matex.normal_strength,0.0),
									tex_light_probe:tex_light_probe,
									envmap_shift:V(globals.envmap_shift,0.75),
									envmap_fov:V(globals.envmap_fov,1.0),
									Ka:V(matex.Ka,0.0), Kd:V(matex.Kd,0.3), Ks:V(matex.Ks,0.2), Kr:V(matex.Kr,0.0),
									roughness:V(matex.roughness,0.5),
									has_tex_smoothness:V(matex.has_tex_smoothness,0.0),
									is_hair:pass>0,
									ior:V(matex.ior,1.33),
									F0:V(matex.F0,1.0),
									L0_dir:L0_dir,L0_color:L0_color,
									L1_dir:L1_dir,L1_color:L1_color,
									//L2_dir:[0.25,0,-1],L2_color:[2.0,2.0,2.0],
								},pass);
									
							}
						});// end blendshape.drawcalls.forEach(function(dc)
					
					}
				}
				//渲染完成之后需要收拾一下GL的流水线状态，恢复默认值——直播框架什么的可能还要用的
				gl.depthMask(true);
				gl.disable(gl.DEPTH_TEST);
				faces.splice(0,faces.length);
			}catch(err){
				console.log(err.stack)
			}
		},
		name:V(globals.name,"dummy"),
	};
})()