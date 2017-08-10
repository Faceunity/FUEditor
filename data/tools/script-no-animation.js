(function(){
	var GL_ZERO=0x0;
	var GL_ONE=0x1;
	var GL_SRC_COLOR=0x0300;
	var GL_ONE_MINUS_SRC_COLOR=0x0301;
	var GL_SRC_ALPHA=0x0302;
	var GL_ONE_MINUS_SRC_ALPHA=0x0303;
	var GL_DST_ALPHA=0x0304;
	var GL_ONE_MINUS_DST_ALPHA=0x0305;
	var GL_DST_COLOR=0x0306;
	var GL_ONE_MINUS_DST_COLOR=0x0307;
	var GL_SRC_ALPHA_SATURATE=0x0308;
	var GL_CONSTANT_COLOR=0x8001;
	var GL_ONE_MINUS_CONSTANT_COLOR=0x8002;
	var GL_CONSTANT_ALPHA=0x8003;
	var GL_ONE_MINUS_CONSTANT_ALPHA=0x8004;
	/////////////////////////
	var boards=JSON.parse(FaceUnity.ReadFromCurrentItem("desc.json"));
	var tex=FaceUnity.LoadTexture("bigtex.webp");
	var s_eyes_shader=FaceUnity.ReadFromCurrentItem("eyes.glsl");
	
	var now;
	var last = Date.now();
	var elapse = 0;
	
	//var tex2=FaceUnity.LoadTexture("2.png");
	//console.log('hello world!');
	//console.log(boards);
	//console.log('tex=',tex);
	/////////
	//eyes
	var eye_l=-1, eye_r=-1;
	for (var i=0; i<boards.length; i++) {
		if (boards[i].name == "EyeL") eye_l = i;
		else if (boards[i].name == "EyeR") eye_r = i;
		
	}

	if (eye_l>=0) {
		//boards[eye_l].blendfunc_src=GL_ONE; boards[eye_l].blendfunc_tar=GL_ONE;
		boards[eye_l].shader=s_eyes_shader;
	}
	if (eye_r>=0) {
		//boards[eye_r].blendfunc_src=GL_ONE; boards[eye_r].blendfunc_tar=GL_ONE;
		boards[eye_r].shader=s_eyes_shader;
	}
	/////////
	//teeth
	var frame_id_teeth=0;
	/////////
	var g_params={
		isAndroid: 0,
	};
	//var ww,hh,rcx,rcy;
	var isExtract = false;
	
	var arCnt = 0;
	var arTex = new Array();
	for(var i=0;i<boards.length;i++){
		if(boards[i].name.search("_ar")!=-1){
			console.log(boards[i].name);
			//console.log(boards[i].path);
			arTex[arCnt] = FaceUnity.LoadTexture(boards[i].path);
			arCnt++;
		}
	}
	console.log("arCnt",arCnt);
	return {
		SetParam:function(name,value){
			//console.log("set param ", name, " to ", value);
			if(g_params[name]!=undefined&&typeof(g_params[name])==typeof(value)){
				g_params[name]=value;
				
				return 1;
			}else{
				return 0;
			}
		},
		Render:function(params){
			try{
				//FaceUnity.RenderAR(tex2);
				//console.log(FaceUnity.m_seconds_since_last_frame);
				
				now = Date.now();
				var delta = now - last;
				//var frame_id=Math.floor(params.frame_id/2);
				
				var w = 0;
				var h = 0;
				if (g_params.isAndroid > 0){
					h=params.w;
					w=params.h;
				}else{
					w=params.w;
					h=params.h;
				}
				
				if (eye_l>=0) boards[eye_l].uniforms={scale:1-params.expression[0]};
				if (eye_r>=0) boards[eye_r].uniforms={scale:1-params.expression[1]};
				if(!isExtract){
					for(var i=0;i<boards.length;i++){
						last[i] = now;
						if(boards[i].name.search("_bg")!=-1){
							console.log(boards[i].name);
							for (var j=0;j<boards[i].texture_frames.length;j++){
								var ww = boards[i].texture_frames[j].v[2];
								var hh = boards[i].texture_frames[j].v[5];
								var ratio = (w/380.0) < (h/672.0) ? (w/380.0) : (h/672.0);
								ww = ww * ratio;
								//hh = hh * (h/672.0);
								hh = hh * ratio;
								var rcx = boards[i].texture_frames[j].v[8];
								var rcy = 1-boards[i].texture_frames[j].v[11];
								console.log("ww:",ww,"hh:",hh,"rcx:",rcx,"rcy",rcy);
								var bx = -w/2 + rcx * w;
								var bh = -h/2 + rcy * h;
								var l = boards[i].texture_frames[j].v[0]* ratio;
								var r = boards[i].texture_frames[j].v[3]* ratio;
								var t = boards[i].texture_frames[j].v[1]* ratio;
								var b = boards[i].texture_frames[j].v[10]* ratio;
								boards[i].texture_frames[j].v=[ bx + l, bh + t,params.focal_length,
																bx + r, bh + t,params.focal_length,
																bx + r, bh + b,params.focal_length,
																bx + l, bh + b,params.focal_length];
							}
						}
						if(boards[i].name.search("_fc")!=-1){
							console.log(boards[i].name);
							for (var j=0;j<boards[i].texture_frames.length;j++){
								boards[i].texture_frames[j].v=[-w/2,h/2,params.focal_length,
															w/2,h/2,params.focal_length,
															w/2,-h/2,params.focal_length,
															-w/2,-h/2,params.focal_length];
							}
						}
					}
					
					isExtract = true;
				}
				
				for(var i=0;i<arCnt;i++){
					FaceUnity.RenderAR(arTex[i]);
				}
				for(var i=0;i<boards.length - arCnt;i++){
					var fps = boards[i].fps == undefined ? 20:boards[i].fps;
					var frame_id = parseInt(delta * fps / 1000);
					FaceUnity.RenderBillboard(tex,boards[i],boards[i].texture_frames[(frame_id)%boards[i].texture_frames.length]);
				}
				
				
			}catch(err){
				console.log(err.stack)
			}
		},
		name:"dummy",
	};
})()