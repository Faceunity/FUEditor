(function() {
	var frame_id=0;
	var glsl = FaceUnity.ReadFromCurrentItem("frag.glsl");
	var lookup_tex = FaceUnity.LoadTexture("lookup_tex.png");
	var tex_C_layer10 = FaceUnity.LoadTexture("tex_C_layer10.png");
	var tex_C_layer11 = FaceUnity.LoadTexture("tex_C_layer11.png");
	var tex_C_layer2 = FaceUnity.LoadTexture("tex_C_layer2.png");
	var tex_C_layer4 = FaceUnity.LoadTexture("tex_C_layer4.png");
	var tex_C_layer5 = FaceUnity.LoadTexture("tex_C_layer5.png");
	var tex_C_layer6 = FaceUnity.LoadTexture("tex_C_layer6.png");
	var tex_C_layer7 = FaceUnity.LoadTexture("tex_C_layer7.png");
	var tex_C_layer8 = FaceUnity.LoadTexture("tex_C_layer8.png");
	var tex_C_layer9 = FaceUnity.LoadTexture("tex_C_layer9.png");
	return {
		VideoFilters:function(params){
			try {
				++frame_id;
				FaceUnity.RunVideoFilters(
					"449811f2ea2b900907276db80370f4d38b4a62ba", 
					glsl, 
					lookup_tex,{
					lookup_tex_norm_y:0.5,
					frame_id:frame_id,
					img_size:[params.w, params.h],
					tex_C_layer10:tex_C_layer10,
					tex_C_layer11:tex_C_layer11,
					tex_C_layer2:tex_C_layer2,
					tex_C_layer4:tex_C_layer4,
					tex_C_layer5:tex_C_layer5,
					tex_C_layer6:tex_C_layer6,
					tex_C_layer7:tex_C_layer7,
					tex_C_layer8:tex_C_layer8,
					tex_C_layer9:tex_C_layer9,
				});
			}catch(err){
			}
		},
		Render:function(params){
			//nothing
		},
		name:"light_perception",
	};
})()


