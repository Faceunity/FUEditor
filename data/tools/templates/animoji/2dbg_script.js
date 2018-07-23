(function(){

	// grey_probe x0
	var g_coeff = [
		[0, 0, 0], [0, 0, 0], [0, 0, 0],
		[-0, -0, -0], [0, 0, 0], [0, 0, 0],
		[-0, -0, -0], [-0, -0, -0], [0, 0, 0] ];
	
	//ruitaocc
	var bigtexjson = JSON.parse(FaceUnity.ReadFromCurrentItem("2d_bigtex_desc.json"));
	var bigtexcnt = 0;
	var bigtex = new Array();
	for(var i=0;i<bigtexjson["bigtexs"].length;i++){
		bigtex[bigtexcnt] = FaceUnity.LoadTexture(bigtexjson["bigtexs"][i],0);
		bigtexcnt++;
	}
	var g_tex = bigtex[0];
	
	//var g_tex = FaceUnity.LoadTexture("1.png",0,1);
	var g_shader = FaceUnity.ReadFromCurrentItem("bg.glsl");
	var globals = {};
	var tex_id = 0;
	var mode = 0;
	var flipx = 0.0;
	var img_w = 0, img_h = 0;
	var screen_w = 0, screen_h = 0;
	var w_min = -1, w_max = -1;
	var h_min = -1, h_max = -1;
	var img_scale = -1;
	FaceUnity.m_coeff = g_coeff;
	if (!FaceUnity.SHVectorize) {
		FaceUnity.SHVectorize = function(c) {
			var c1 = 0.429043, c2 = 0.511664, c3 = 0.743125, c4 = 0.886227, c5 = 0.247708;
			var sh=[];
			for (var i = 0; i < 3; i++) {
				sh.push([c1*c[8][i],c1*c[4][i],c1*c[7][i],c2*c[3][i],
						c1*c[4][i],-c1*c[8][i],c1*c[5][i],c2*c[1][i],
						c1*c[7][i],c1*c[5][i],c3*c[6][i],c2*c[2][i],
						c2*c[3][i],c2*c[1][i],c2*c[2][i],c4*c[0][i]-c5*c[6][i] ]);
			}
			return sh;
		}
	}

	FaceUnity.m_SH = FaceUnity.SHVectorize(g_coeff);
	
	var DoRender = function() {
		gl.enable(gl.BLEND);
		if(tex_id) {
			FaceUnity.RenderScreenQuad(g_shader, { mode:mode, flipx:flipx, img_w:img_w, img_h:img_h, screen_w:screen_w, screen_h:screen_h, 
				w_min:w_min, w_max:w_max, h_min:h_min, h_max:h_max, img_scale:img_scale,
				tex_bg:tex_id, mat_scene:FaceUnity.m_tfm_bg }, globals);
		}
		else {
			FaceUnity.RenderScreenQuad(g_shader, { mode:mode, flipx:flipx, img_w:img_w, img_h:img_h, screen_w:screen_w, screen_h:screen_h,
				w_min:w_min, w_max:w_max, h_min:h_min, h_max:h_max, img_scale:img_scale,
				tex_bg:g_tex, mat_scene:FaceUnity.m_tfm_bg }, globals);
		}
		gl.disable(gl.BLEND);
	}
	
	return {
		Preprocess:function() {
			return ["000_background"];
		},
		GetParam:function(name) {
			if(name == "texture_id") return tex_id;
			return 0;
		},
		SetParam:function(name,value){
			console.log("set param ", name, " to ", value);
			if(name == 'bg') {
				tex_id = value[0];
				mode = value[1];
				flipx = value[2];
				screen_w = value[3];
				screen_h = value[4];
				img_w = value[5];
				img_h = value[6];
				w_min = w_max = h_min = h_max = -1;
				img_scale = -1;
				if(mode == 2) {
					w_min = value[7];
					w_max = value[8];
					h_min = value[9];
					h_max = value[10];
				}
				if(mode == 3) {
					img_scale = value[11];
				}
			}
			return 1;
		},
		Render:function(params) {
			DoRender();
		},
		RenderNonFace:function(params) {
			if(params.face_count>0) return;
			DoRender();
		},
		name: "bg"
	};
})()
