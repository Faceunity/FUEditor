(function() {
	var frame_id=0;
	var glsl = FaceUnity.ReadFromCurrentItem("frag.glsl");
	var lookup_tex = FaceUnity.LoadTexture("lookup_tex.png");
	var tex_C_layer4 = FaceUnity.LoadTexture("tex_C_layer4.png");
	var tex_C_layer5 = FaceUnity.LoadTexture("tex_C_layer5.png");
	return {
		VideoFilters:function(params){
			try {
				++frame_id;
				FaceUnity.RunVideoFilters(
					"bf42204b92127d0a687fb1dd1203d8686bc35f0d", 
					glsl, 
					lookup_tex,{
					lookup_tex_norm_y:0.5,
					frame_id:frame_id,
					img_size:[params.w, params.h],
					tex_C_layer4:tex_C_layer4,
					tex_C_layer5:tex_C_layer5,
				});
			}catch(err){
			}
		},
		Render:function(params){
			//nothing
		},
		name:"red_black_white",
	};
})()


