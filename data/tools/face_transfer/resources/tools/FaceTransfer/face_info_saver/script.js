(function(){
	var g_default_params={
		is_save: 0,
		save_path:"",
		dde_param: 0,
		projected_mesh: 0,
		projected_mesh_ext: 0,
		ar_mesh: 0,
		neutral_id: 0,
		bs: 0,
		is_log:0
	};
	var g_params=JSON.parse(JSON.stringify(g_default_params));

	/////////
	return {
		SetParam:function(name,value){			
			if(g_params[name]!=undefined&&typeof(g_params[name])==typeof(value)){
				g_params[name]=value;				
				return 1;
			}else{
				return 0;
			}
		},
		GetParam:function(name){
			if(g_params[name]!=undefined){				
				return g_params[name];
			}else{
				return 0;
			}
		},
		Render:function(params){
			try{
				if("" != g_params.is_save)
				{
					FaceUnity.SaveFaceInfo(
						g_params.save_path,{
							dde_param: g_params.dde_param,
							projected_mesh: g_params.projected_mesh,
							projected_mesh_ext: g_params.projected_mesh_ext,
							ar_mesh: g_params.ar_mesh,
							neutral_id: g_params.neutral_id,
							bs: g_params.bs
						});
					if(g_params.is_log)
						console.log("face info saved...");
				}
				
			}catch(err){
				console.log(err.stack)
			}
		},
		name:"face_info_saver",
	};
})()