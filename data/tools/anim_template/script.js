(function(){
	var pathRel = "";

	var animList = [
		FaceUnity.LoadAnimationToMemory(pathRel+"anim.json", pathRel+"anim_dq.bin")
	];
    var animJsonStr = FaceUnity.ReadFromCurrentItem(pathRel+"anim.json");
    var animBinStr = FaceUnity.ReadFromCurrentItem(pathRel+"anim_dq.bin");
    var boneMapStr = FaceUnity.ReadFromCurrentItem(pathRel+"boneMap.json");
	var expStr = FaceUnity.ReadFromCurrentItem(pathRel+"expression.json");
	var expression = expStr!=undefined?JSON.parse(expStr):undefined;
	var face_animation_list = [
		expression
	];
	animList[0].boneMap = JSON.parse(boneMapStr);
	var rotStr = FaceUnity.ReadFromCurrentItem(pathRel+"rotation.json");
	var rotation = rotStr!=undefined?JSON.parse(rotStr):undefined;
	var face_rotation_list = [
        rotation
	];

	var reset_anim_process=function(anim_state){
		anim_state.firstTime = true;
		anim_state.last_time = 0;
		anim_state.last_frame_id = 0;
		anim_state.anim_time = 0;
		anim_state.last_anim_fid = 0;
	}
	var start=function(anim_state, frame_id){
		if (anim_state.firstTime) {
			anim_state.firstTime = false;
			anim_state.last_time = new Date().getTime();
			anim_state.last_frame_id = frame_id;
		}
	}

	var frame_id_callback_0 = function (target, frame_id) {
	    return 0;
	}

	var frame_id_callback_ex = function (target, frame_id) {
	    var anim_state = target.anim_state;
	    start(anim_state, frame_id);
	    if (frame_id != anim_state.last_frame_id) {
	        var current_time = new Date().getTime();
	        var delta_time = current_time - anim_state.last_time;
	        anim_state.last_time = current_time;
	        anim_state.last_frame_id = frame_id;
	        anim_state.anim_time += delta_time;

	        var anim_fid = Math.floor(anim_state.anim_time * 0.025) % (animList[0].frame_num);
	        anim_state.last_anim_fid = anim_fid;
	    }
	    return anim_state.last_anim_fid;
	};

	var update_callback=function(target, params){
	    var anim_id = 0;

		var fid = frame_id_callback_ex(target, params.frame_id);

		if (target.use_vtf == 1)
			FaceUnity.LoadAnimationFrame(target.tex_deform, animList[0].frames, target.tex_deform.h, fid, 1);
        else
            FaceUnity.LoadAnimationFrame(target.arrvec4_deform, animList[0].frames, target.tex_deform.h, fid, 0);

		if (face_animation_list[anim_id]!=undefined && face_animation_list[anim_id]["expressions"].length > 0) {
		    var exps = face_animation_list[anim_id]["expressions"];
		    for(var i = 0; i < exps.length; i++) {
		    	if(exps[i] < 0.0 || exps[i] > 1.0) console.log(exps[i]);
		    }
		    if (fid <= exps.length - 1)
		        params.expression = exps[fid];
		    else
		        params.expression = exps[exps.length - 1];
		}
		if (face_rotation_list[anim_id]!=undefined && face_rotation_list[anim_id]["rotations"].length > 0) {
		    var rots = face_rotation_list[anim_id]["rotations"];
		    if (fid <= rots.length - 1) {
		        params.rotation = rots[fid];
		    }
		    else {
		        params.rotation = rots[rots.length - 1];
		        //console.log("out side");
		    }
		}
		return fid;
	}
	return {
		animating: 1,
		animData : animList[0],
        animJsonStr : animJsonStr,
        boneMapStr:boneMapStr,
        animBinStr:animBinStr,
		anim_head: animList[0].anim_head,
		tex_deform: animList[0].tex_deform,
		arrvec4_deform: animList[0].arrvec4_deform,
		cluster_num: animList[0].cluster_num,
		update_callback: update_callback,
		anim_state: {
			animation_id: 0,
			firstTime: true,
			last_time: 0,
			last_frame_id: 0,
			anim_time: 0,
			last_anim_fid: 0
		},
		Render:function(){},
		name:"animation"
	};
})()
