(function() {
	var frame_id=0;
	var glsl = FaceUnity.ReadFromCurrentItem("frag.glsl");
	var lookup_tex = FaceUnity.LoadTexture("lookup_tex.png", 0);
	var tex_0 = FaceUnity.LoadTexture("tex_0.png", 0);
	var g_default_params={
		filter_level:0.12,
	};
	var g_params=JSON.parse(JSON.stringify(g_default_params));
	return {
		SetParam:function(name,value){
			if (g_params[name] != undefined&&typeof(g_params[name]) == typeof(value)){
				g_params[name] = value;
				return 1;
			}
			else{
				return 0;
			}
		},
		GetParam:function(name){
			if (g_params[name] != undefined){
				return g_params[name];
			}
			else{
				return 0;
			}
		}, 
		VideoFilters:function(params){
			try {
				++frame_id;
				FaceUnity.RunVideoFilters(
					"807b2e18fe37664436f5503528ce06ebb2b373a7", 
					glsl, 
					lookup_tex,{
					lookup_tex_norm_y:0.5,
					frame_id:frame_id,
					img_size:[params.w, params.h],
					filter_level:g_params.filter_level,
					tex_0:tex_0,
				});
			}catch(err){
			}
		},
		Render:function(params){
			//nothing
		},
		name:"example_filter_gradient",
	};
})()


