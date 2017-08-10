(function(){

	//@gparam name {"type":"edit","default_value":"unnamed"}
	//@gparam log_scale {"type":"slider","min":-5,"max":5,"default_value":0}
	//@gparam eye_rot_scale {"type":"slider","min":0.0,"max":3.0,"default_value":1.5}
	//@gparam L0_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_B {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_log_intensity {"type":"slider","min":-4,"max":4,"default_value":0}
	//@gparam L1_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_B {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_log_intensity {"type":"slider","min":-4,"max":4,"default_value":-2}
	//@mparam obj_type {"type":"edit","default_value":"0"}
	//@mparam eye_type {"type":"edit","default_value":"0"}
	//@mparam is_hair {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam is_teeth {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam is_glasses {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam is_clothes {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam has_transparency {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam tex_albedo {"type":"texture","default_value":"white.png"}
	//@mparam Ka {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam Kd {"type":"slider","min":0,"max":1,"default_value":1}
	//@mparam Ks {"type":"slider","min":0,"max":1,"default_value":0.5}
	//@mparam face_blend {"type":"slider","min":0,"max":1,"default_value":0}
	//@mparam depth_hack {"type":"slider","min":-20,"max":20,"default_value":0}
	//@mparam spec_width {"type":"slider","min":0,"max":20,"default_value":4}
	//@mparam spec_var {"type":"slider","min":0,"max":30,"default_value":10}
	//@mparam spec_bright {"type":"slider","min":-4,"max":4,"default_value":0}
	//@mparam eye_blend {"type":"slider","min":0,"max":1,"default_value":0}
	//@gparam alphaThreshold {"type":"edit","default_value":"1.0"}
	//@gparam ly {"type":"slider","min":-2,"max":2,"default_value":0}
	//@gparam lz {"type":"slider","min":2,"max":10,"default_value":2.5}
	//@gparam trans_x {"type":"slider","min":-30,"max":30,"default_value":0}
	//@gparam trans_y {"type":"slider","min":-30,"max":30,"default_value":0}
	//@gparam trans_z {"type":"slider","min":-30,"max":30,"default_value":0}
	//@gparam model_scale {"type":"slider","min":0,"max":2,"default_value":1}

	var globals=JSON.parse(FaceUnity.ReadFromCurrentItem("globals.json")||"{}");
	var materials_json=JSON.parse(FaceUnity.ReadFromCurrentItem("materials.json")||"{}");
	var blendshape=FaceUnity.LoadBlendshape("avatar.json","avatar.bin");
	var s_vert_shader=FaceUnity.ReadFromCurrentItem("vert.glsl");
	var s_frag_shader=FaceUnity.ReadFromCurrentItem("frag.glsl");
	var expression=[]; for(var i=0; i<46; i++) expression.push(0);
	var tfm_before=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	var tfm_after=tfm_before.slice();
	var frame_id=0;
	var defaultTranslationZ = 1243;
	var maxTranslationY = 98;
	var gestureRotationAngle = 0.0;
	var gestureScale = 0.0;

	var animation = {
		animating: 0,
		anim_head: 0,
		frame_id_callback: null,
		tex_deform: 0,
		tex_deform_width: 0
	};
	var animation_default = JSON.parse(JSON.stringify(animation));
	var calculate_anim_fid = function(frame_id) {
		return animation.animating ? animation.frame_id_callback(animation, frame_id) : 0;
	}

	var s_vert_deco_shader=FaceUnity.ReadFromCurrentItem("vert_deco.glsl");
	var s_vert_clothes_shader=FaceUnity.ReadFromCurrentItem("vert_clothes.glsl");
	var s_frag_hair_shader=FaceUnity.ReadFromCurrentItem("frag_hair.glsl");
	var tfm_id = tfm_before.slice();

	var tex_map={};
	var SCALE;
	var L0_color, L1_color;
	var V=function(v0,v1){return v0==undefined?v1:v0;};
	var Vs=function(v0,v1){return v0==undefined?v1:v0.slice();};
	var CreateColor=function(R,G,B,log_intensity){var L=Math.exp(log_intensity);return [L*R,L*G,L*B]};
	var ReloadThingsForEditor=function(){
		SCALE=Math.exp(V(globals.log_scale,0));
		L0_color=CreateColor(V(globals.L0_R,1),V(globals.L0_G,1),V(globals.L0_B,1), V(globals.L0_log_intensity,0));
		L1_color=CreateColor(V(globals.L1_R,1),V(globals.L1_G,1),V(globals.L1_B,1), V(globals.L1_log_intensity,-2));
		for(var sname in materials_json){
			var mat=materials_json[sname];
			if(typeof(mat)=='object'){
				for(var skey in mat){
					if(skey.match(/^tex_.*/)){
						var fn=mat[skey];
						if(!tex_map[fn]){
							tex_map[fn]=FaceUnity.LoadTexture(fn);
						}
					} else if(skey.match(/^fx_.*/)){
						var fn=mat[skey];
						if(!tex_map[fn]){
							tex_map[fn]=FaceUnity.ReadFromCurrentItem(fn);
						}
					}
				}
			}
		}
	};
	ReloadThingsForEditor();
	// m is row major
	var inverseMatrix = function(m) {
		// column major
		var a00 = m[0], a01 = m[4], a02 = m[8], a03 = m[12];
		var a10 = m[1], a11 = m[5], a12 = m[9], a13 = m[13];
		var a20 = m[2], a21 = m[6], a22 = m[10], a23 = m[14];
		var a30 = m[3], a31 = m[7], a32 = m[11], a33 = m[15];
		var b00 = a00 * a11 - a01 * a10;
		var b01 = a00 * a12 - a02 * a10;
		var b02 = a00 * a13 - a03 * a10;
		var b03 = a01 * a12 - a02 * a11;
		var b04 = a01 * a13 - a03 * a11;
		var b05 = a02 * a13 - a03 * a12;
		var b06 = a20 * a31 - a21 * a30;
		var b07 = a20 * a32 - a22 * a30;
		var b08 = a20 * a33 - a23 * a30;
		var b09 = a21 * a32 - a22 * a31;
		var b10 = a21 * a33 - a23 * a31;
		var b11 = a22 * a33 - a23 * a32;
		var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
		var ret = [
			a11 * b11 - a12 * b10 + a13 * b09,
			a02 * b10 - a01 * b11 - a03 * b09,
			a31 * b05 - a32 * b04 + a33 * b03,
			a22 * b04 - a21 * b05 - a23 * b03,
			a12 * b08 - a10 * b11 - a13 * b07,
			a00 * b11 - a02 * b08 + a03 * b07,
			a32 * b02 - a30 * b05 - a33 * b01,
			a20 * b05 - a22 * b02 + a23 * b01,
			a10 * b10 - a11 * b08 + a13 * b06,
			a01 * b08 - a00 * b10 - a03 * b06,
			a30 * b04 - a31 * b02 + a33 * b00,
			a21 * b02 - a20 * b04 - a23 * b00,
			a11 * b07 - a10 * b09 - a12 * b06,
			a00 * b09 - a01 * b07 + a02 * b06,
			a31 * b01 - a30 * b03 - a32 * b00,
			a20 * b03 - a21 * b01 + a22 * b00
		];
		// transpose to row major
		for (var i = 0; i < 4; i++) {
			for (var j = i + 1; j < 4; j++) {
				var tmp = ret[4 * i + j];
				ret[4 * i + j] = ret[4 * j + i];
				ret[4 * j + i] = tmp;
			}
		}
		// divided by determinant
		for (var i = 0; i < 16; i++) {
			ret[i] /= det;
		}
		return ret;
	}

	var GenAdjustMatrixBeforeAnim=function(){
		var bcenter=blendshape.drawcalls[0].P_center;
		var v=V(FaceUnity.m_model_feature_pos,[0,0,0,0,0,0,0,0,0]);
		var ornaments_scale=V(FaceUnity.m_ornaments_scale,1.0);
		var ref_center=[0.00101222,1.7475,0.118913];
		var trs=[v[6]-ref_center[0],v[7]-ref_center[1],v[8]-ref_center[2] ];
		tfm_before=FaceUnity.MatrixTranslate([-bcenter[0],-bcenter[1],-bcenter[2] ]);
		tfm_before=FaceUnity.MatrixMul(tfm_before, FaceUnity.MatrixScale([ornaments_scale, ornaments_scale, ornaments_scale])); // scale
		tfm_before=FaceUnity.MatrixMul(tfm_before, FaceUnity.MatrixTranslate([bcenter[0],bcenter[1],bcenter[2] ]));
		tfm_before=FaceUnity.MatrixMul(tfm_before, FaceUnity.MatrixTranslate([trs[0],trs[1],trs[2] ])); // translate
	};
	GenAdjustMatrixBeforeAnim();
	var GenAdjustMatrixAfterAnim=function(){
		tfm_after=FaceUnity.MatrixTranslate([0, -1.65, 0]);
		tfm_after=FaceUnity.MatrixMul(tfm_after, FaceUnity.MatrixScale([720, 720, 720]));
		tfm_after=FaceUnity.MatrixMul(tfm_after, FaceUnity.MatrixScale([SCALE, SCALE, SCALE]));
	};
	GenAdjustMatrixAfterAnim();

	var DoRender=function(params){
		if (frame_id == params.frame_id) return;
		frame_id = params.frame_id;
		var localRotationQuat = [0,0,0,1];
		var globalTranslation = Vs(FaceUnity.globalTranslation, [0,-98,1243,1]);
		var globalRotationQuat = Vs(FaceUnity.globalRotationQuat, [0,0,0,1]);
		try{
			FaceUnity.ComputeBlendshapeGeometry(blendshape,params);
			var matProj=FaceUnity.CreateProjectionMatrix_FOV();
			var coeff=FaceUnity.m_coeff;
			var color0=L0_color,color1=L1_color;
			var fid = calculate_anim_fid(frame_id);
			if (coeff[0][0]>0.001){color0=[0,0,0];color1=[0,0,0];}
			var vert = s_vert_shader, frag, frag_OIT;
			var alphaThreshold = parseFloat(V(globals.alphaThreshold, "1.0"));
			for(var pass=0;pass<3;pass++){
				if (pass==0) {
					gl.enable(gl.DEPTH_TEST);
					gl.depthFunc(gl.LEQUAL);
					gl.depthMask(true);
					gl.disable(gl.BLEND);
					frag_OIT="vec4 shader_main_OIT(){vec4 c=shader_main();return vec4(c.rgb,1.0);}";
				} else if (pass==1) {
					gl.enable(gl.DEPTH_TEST);
					gl.depthMask(true);
					frag_OIT="vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a>" + alphaThreshold.toFixed(3) 
						+ ") return vec4(c.rgb,1.0);else discard;}";
				} else if (pass==2) {
					gl.enable(gl.DEPTH_TEST);
					gl.depthMask(false);
					gl.enable(gl.BLEND);
					gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ZERO,gl.ONE);
					frag_OIT="vec4 shader_main_OIT(){vec4 c=shader_main();if (c.a<=" + alphaThreshold.toFixed(3) 
						+ ") return vec4(c.rgb,c.a*" + (1.0/alphaThreshold).toFixed(3) + ");else return vec4(c.rgb,0.0);}";
				}
				blendshape.drawcalls.forEach(function(dc){
					var matex=(materials_json[dc.name]||{});
					var obj_type = V(matex.obj_type, 0);
					if ((V(matex.has_transparency,0)<0.5) == (pass>0)) return;
					if (obj_type < 1) vert = s_vert_deco_shader;
					else if (V(matex.is_clothes,0) > 0.5) vert = s_vert_clothes_shader;
					else vert = s_vert_shader;
					if (V(matex.is_hair,0) > 0) frag = s_frag_eye_shader + frag_OIT;
					else frag = s_frag_shader + frag_OIT;
					var mat_model = tfm_after;
					if (obj_type < 1) {
						localRotationQuat = V(params.rotation, [0,0,0,1]);
						localRotationQuat = [-localRotationQuat[0], -localRotationQuat[1], -localRotationQuat[2], localRotationQuat[3] ];
					} else localRotationQuat = [0,0,0,1];
					var mat_view=FaceUnity.CreateViewMatrix(
						globalRotationQuat,
						globalTranslation);
					if(V(matex.eye_type,0) > 0 && animation.anim_head == 0){
						mat_model=FaceUnity.MatrixMul(
							FaceUnity.CreateEyeMatrix(
								[dc.P_center[0],dc.P_center[1],-dc.P_center[2] ],
								[params.pupil_pos[0]*V(globals.eye_rot_scale,1.5),params.pupil_pos[1] ]),
							mat_model);
					}
					dc.use_custom_gl_states=1;
					dc.use_OIT_shader=1;
					FaceUnity.RenderBlendshapeComponent_new(blendshape,dc,vert,frag,{
						fid:fid,
						animating:animation.animating,
						tex_deform:animation.tex_deform,
						deform_width:animation.tex_deform_width,
						anim_head:animation.anim_head,
						inv_quantize:[dc.scales[0],dc.scales[1],dc.scales[2] ],
						mat_view:mat_view,
						mat_model:mat_model,
						head_rotation_quat:localRotationQuat,
						mat_proj:matProj,
						tfm_before:V(matex.is_glasses,0)>0.5?tfm_before:tfm_id,
						obj_type:obj_type,
						eye_type:V(matex.eye_type, 0),
						tex_albedo:tex_map[V(matex.tex_albedo,dc.mat.tex)],
						Ka:V(matex.Ka,0.0), Kd:V(matex.Kd,1.0), Ks:V(matex.Ks,0.5),
						L0_color:color0,L1_color:color1,
						l00:coeff[0],l1_1:coeff[1],l10:coeff[2],l11:coeff[3],
						l2_2:coeff[4],l2_1:coeff[5],l20:coeff[6],l21:coeff[7],l22:coeff[8],
						ly:V(globals.ly,0),lz:V(globals.lz,2.5),
						depth_hack:V(matex.depth_hack,0),
						inverse_mat_model:obj_type<1?inverseMatrix(mat_model):mat_model,
					},pass);
				});
			}
			FaceUnity.SimpleOITEnd();
		}catch(err){
			console.log(err.stack)
		}
	}

	return {

		Preprocess:function(){
			return ["600_ornaments"];
		},

		SetParam:function(name,value) {
			if (name=='@refresh') {
				ReloadThingsForEditor();
				return 1;
			} else if (name == "rot_degree") {
				gestureRotationAngle = value;
				FaceUnity.globalRotationQuat = [0.0,Math.sin(value),0.0,Math.cos(value)];
				return 1;
			} else if (name == "scale_degree") {
				gestureScale = value;
				FaceUnity.globalTranslation[1] = -maxTranslationY + value * 150;
				FaceUnity.globalTranslation[2] = defaultTranslationZ + value * (defaultTranslationZ + 6000);
				return 1;
			}
			if (value=='@global_json') {
				globals=JSON.parse(name);
			} else if (value=='@materials_json') {
				materials_json=JSON.parse(name);
			}
			try {
				var desc=JSON.parse(name);
				if (desc.thing=="<global>") {
					globals[desc.param]=value;
					if (desc.param=="alphaThreshold"){
						blendshape.drawcalls.forEach(function(dc){
							dc.shader_hash_0=undefined;
							dc.shader_hash_1=undefined;
							dc.shader_hash_2=undefined;
						});
					}
					return 1;
				} else {
					var dc=materials_json[desc.thing];
					if (!dc) { dc={}; materials_json[desc.thing]=dc; }
					dc[desc.param]=value;
					return 1;
				}
			} catch(err) {}
			return 0;
		},
		GetParam:function(name){
			if (name=='@global_json')
				return JSON.stringify(globals,null,2);
			else if (name=='@materials_json')
				return JSON.stringify(materials_json,null,2);
			try {
				var desc=JSON.parse(name);
				if (desc.thing=="<global>") {
					return globals[desc.param];
				} else {
					var dc=materials_json[desc.thing];
					if (dc) return dc[desc.param];
				}
			} catch(err) {}
			return undefined;
		},

		OnBind:function(item){
			if (item.animation != undefined)
				animation = item.animation;
		},

		OnUnbind:function(item){
			animation = animation_default;
		},

		Render:function(params){
			DoRender(params);
		},
		RenderNonFace:function(params){
			if(params.face_count>0) return;
			params.translation=[0,0,500,1];
			params.rotation=[0,0,0,1];
			params.pupil_pos=[0,0];
			params.expression=expression;
			DoRender(params);
		},
		name:V(globals.name,"unnamed")

	};
})()
