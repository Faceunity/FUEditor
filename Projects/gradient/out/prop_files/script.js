(function() {
	var frame_id=0;
	var glsl = FaceUnity.ReadFromCurrentItem("frag.glsl");
	var lookup_tex = FaceUnity.LoadTexture("lookup_tex.png");
	return {
		VideoFilters:function(params){
			try {
				++frame_id;
				FaceUnity.RunVideoFilters(
					"489f1e631809fecc9bc2fb0e9a837c5b0718f0f1", 
					glsl, 
					lookup_tex,{
					lookup_tex_norm_y:0.5,
					frame_id:frame_id,
					img_size:[params.w, params.h],
				});
			}catch(err){
			}
		},
		Render:function(params){
			//nothing
		},
		name:"gradient",
	};
})()


