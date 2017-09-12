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
	var boards = JSON.parse(FaceUnity.ReadFromCurrentItem("desc.json"));
	var boards_bk = JSON.parse(FaceUnity.ReadFromCurrentItem("desc.json"));
	var bigtexjson = JSON.parse(FaceUnity.ReadFromCurrentItem("bigtex_desc.json"));
	//var tex=FaceUnity.LoadTexture("bigtex.webp");
	var s_eyes_shader=FaceUnity.ReadFromCurrentItem("eyes.glsl");
	
	/*back#1ground_seg
	var model=FaceUnity.LoadNNModel("nn.json");
	var base_color=new Float32Array([-122.675/255,-116.669/255,-104.008/255]);
	var s_visualize_shader=FaceUnity.ReadFromCurrentItem("visualize.glsl");
	var cur_rotation_mode=-1;
	var cnn_prob = new Array();
	var cnn_running_time_sum = 0.;
	var cnn_running_time_count = 0;
	//back#1ground_seg*/
	
	var last = Date.now();
	
	var bigtexcnt = 0;
	var bigtex = new Array();
	for(var i=0;i<bigtexjson["bigtexs"].length;i++){
		bigtex[bigtexcnt] = FaceUnity.LoadTexture(bigtexjson["bigtexs"][i],0);
		bigtexcnt++;
	}
	console.log("bigtexcnt",bigtexcnt);
	
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
		isLandscape:0,
		rotationAngle:0,
		matp:[1,0,0,1]
	};
	//var ww,hh,rcx,rcy;
	var isExtract = false;
	var cur_w=0,cur_h=0;
	var last_state=0;
	
	deepCopy =function(p, c){
		var c = c || {};
　　　　for (var i in p) {
　　　　　　if (typeof p[i] === 'object') {
　　　　　　　　c[i] = (p[i].constructor === Array) ? [] : {};
　　　　　　　　deepCopy(p[i], c[i]);
　　　　　　} else {
　　　　　　　　　c[i] = p[i];
　　　　　　}
　　　　}
　　　　return c;
　　}
	
	var arCnt = 0;
	var arTex = new Array();
	var bg_boards = new Array();
	var bgCnt = 0;
	console.log("board.length",boards.length,"arCnt",arCnt,"bgCnt",bgCnt);
	for(var i=0;i<boards.length;i++){
		if(boards[i].name.search("_ar")!=-1){
			//console.log(boards[i].name);
			//console.log(boards[i].path);
			arTex[arCnt] = FaceUnity.LoadTexture(boards[i].path);
			arCnt++;
		}
		boards[i].isActive = true;
		if(boards[i].name.search("_fcbg")!=-1){
			bg_boards[bgCnt]=deepCopy(boards[i]);
			bg_boards[bgCnt].last = Date.now();
			bgCnt++;
			boards.splice(i,1);
			boards_bk.splice(i,1);
			i--;
		}
	}
	console.log("board.length",boards.length,"arCnt",arCnt,"bgCnt",bgCnt);
	
	reExtract=function (params){
		//console.log("reExtract")
		try{
			var w = cur_w;
			var h = cur_h; 
			
			for(var i=0;i<boards_bk.length;i++){
				if(boards_bk[i].name.search("_bg")!=-1){
					//console.log(boards_bk[i].name);
					for (var j=0;j<boards_bk[i].texture_frames.length;j++){
						var ww = boards_bk[i].texture_frames[j].v[2];
						var hh = boards_bk[i].texture_frames[j].v[5];
						var ratio = (w/380.0) < (h/672.0) ? (w/380.0) : (h/672.0);
						//console.log("ww hh",ww,hh,ratio);
						ww = ww * ratio;
						hh = hh * ratio;
						var rcx = boards_bk[i].texture_frames[j].v[8];
						var rcy = 1-boards_bk[i].texture_frames[j].v[11];
						var bx = - w/2 + rcx * w;
						var bh = -h/2 + rcy * h;
						//console.log("rcx rcy bx,bh",rcx,rcy,bx,bh);
						var l = boards_bk[i].texture_frames[j].v[0]* ratio;
						var r = boards_bk[i].texture_frames[j].v[3]* ratio;
						var t = boards_bk[i].texture_frames[j].v[1]* ratio;
						var b = boards_bk[i].texture_frames[j].v[10]* ratio;
						//console.log("lrtb ",l," ",r," ",t," ",b);
						boards[i].texture_frames[j].v=[ bx + l, bh + t,params.focal_length,
														bx + r, bh + t,params.focal_length,
														bx + r, bh + b,params.focal_length,
														bx + l, bh + b,params.focal_length];
						boards[i].matp = g_params["matp"];
					}
				}
				if(boards_bk[i].name.search("_fcp")!=-1){
					if(g_params.isLandscape>0.5)boards[i].isActive = false;
					//console.log("focal_length",params.focal_length);
					for (var j=0;j<boards_bk[i].texture_frames.length;j++){
						boards[i].texture_frames[j].v=[-w/2,h/2,params.focal_length,
													+w/2,h/2,params.focal_length,
													+w/2,-h/2,params.focal_length,
													-w/2,-h/2,params.focal_length];
						boards[i].matp = g_params["matp"];
					}
				}
				if(boards_bk[i].name.search("_fcl")!=-1){
					if(g_params.isLandscape<0.5)boards[i].isActive = false;
					//console.log("focal_length",params.focal_length);
					for (var j=0;j<boards_bk[i].texture_frames.length;j++){
						boards[i].texture_frames[j].v=[-w/2,h/2,params.focal_length,
													+w/2,h/2,params.focal_length,
													+w/2,-h/2,params.focal_length,
													-w/2,-h/2,params.focal_length];
						boards[i].matp = g_params["matp"];
					}
				}
			}
		}catch(err){
			console.log(err.stack)
		}
	};
	
	
	isActionTriggered=function (actionname, params){
		if(params.expression==undefined || params.rotation==undefined)return false;
		switch (actionname){
			//#action
			default:
				return false;
				break;
		}
		
	};
	var cnt =0;
	recursiveStop = function(idx,now){
		//console.log("recursiveStop:",boards[idx].name,cnt++);
		boards[idx].triggered =0;
		boards[idx].frame_id = 0;
		boards[idx].last = now;
		if(boards[idx].nodetype==3)return;
		for(var i = 0;i < boards[idx].childNodes.length;i++){
			recursiveStop(boards[idx].childNodes[i],now);
		}
	}
	orientationChange = function(){
		//console.log("g_params.isLandscape",g_params.isLandscape);
		for(var i= 0;i<boards.length;i++){
			var bisLandscape = g_params.isLandscape < 0.5 ? false : true;
			if(boards_bk[i].name.search("_fc")!=-1){
				boards[i].isActive = bisLandscape == (boards_bk[i].name.search("_fcl")!=-1);
				//console.log(boards[i].name,boards[i].isActive);
			}
		}
	}
	switchState = function(lst,now){
		//console.log("switchState");
		if(lst==0 && now==1){
			for(var i= 0;i<boards.length;i++){
				if(boards[i].triggerstart=="newface")boards[i].isActive = true;
			}
		}
		if(lst==1 && now==0){
			for(var i= 0;i<boards.length;i++){
				if(boards[i].triggerstart=="alwaysrender")boards[i].isActive = true;
			}
		}
		orientationChange();
	}
	//
	activateNext = function(board){
		if(board.triggerNextNodes==undefined || board.triggerNextNodes.length==0)return;
		for(var idx in board.triggerNextNodes){
			boards[board.triggerNextNodes[idx]].isActive=true;
		}
	}
	return {
		SetParam:function(name,value){
			//console.log("set param ", name, " to ", value);
			if(g_params[name]!=undefined&&typeof(g_params[name])==typeof(value)){
				if(name=="isLandscape"){
					g_params[name]=value;
					orientationChange();
				}
				if(name=="isAndroid"){
					g_params[name]=value;
					//g_params["matp"] = [0,1,-1,0];
				}
				if(name=="rotationAngle"){
					if(Math.abs(value-0) < 0.01){
						g_params["matp"] = [1,0,0,1];
					}else if(Math.abs(value-90) < 0.01){
						g_params["matp"] = [0,1,-1,0];
					}else if(Math.abs(value-180) < 0.01){
						g_params["matp"] = [-1,0,0,-1];
					}else if(Math.abs(value-270) < 0.01){
						g_params["matp"] = [0,-1,1,0];
					}else return;
					g_params["rotationAngle"] = value;
					//console.log("matp",g_params["matp"]);
				}
				return 1;
			}else{
				return 0;
			}
		},
		
		m_texid:0,
		m_matrix:undefined,
		enable_trackerless:1,
		////////////////////////////////
		/*back#2ground_seg
		m_texid:0,
		m_matrix:undefined,
		enable_trackerless:1,
		OnGeneralExtraDetector:function(){try{
			//we first compute the letterboxing / rotation matrix
			var matrix=new Float32Array(6);
			var rotation_mode=FaceUnity.g_current_rmode;
		if (cur_rotation_mode == -1 || cur_rotation_mode!=rotation_mode)
			{
				cur_rotation_mode=rotation_mode;
				cnn_prob.length=0;
			}
			
			//console.log("rotation_mode: ",rotation_mode);
			var w=FaceUnity.g_image_w;
			var h=FaceUnity.g_image_h;
			var dw_letterbox,dh_letterbox;
			if(!(rotation_mode&1)){
				var conceptual_h_letterboxed=Math.max(w/0.5625,h);
				var conceptual_w_letterboxed=conceptual_h_letterboxed*0.5625;
				dw_letterbox=(conceptual_w_letterboxed-w);
				dh_letterbox=(conceptual_h_letterboxed-h);
			}else{
				var conceptual_h_letterboxed=Math.max(h/0.5625,w);
				var conceptual_w_letterboxed=conceptual_h_letterboxed*0.5625;
				dw_letterbox=(conceptual_h_letterboxed-w);
				dh_letterbox=(conceptual_w_letterboxed-h);
			}
			switch(rotation_mode){
				default:{console.log('invalid rotation mode',rotation_mode);}break;
				case 0:{matrix[0]=w;matrix[1]=0;matrix[2]=0;matrix[3]=h;matrix[4]=0;matrix[5]=0;}break;
				case 1:{matrix[0]=0;matrix[1]=h;matrix[2]=-w;matrix[3]=0;matrix[4]=w;matrix[5]=0;}break;
				case 2:{matrix[0]=-w;matrix[1]=0;matrix[2]=0;matrix[3]=-h;matrix[4]=w;matrix[5]=h;}break;
				case 3:{matrix[0]=0;matrix[1]=-h;matrix[2]=w;matrix[3]=0;matrix[4]=0;matrix[5]=h;}
			}
			var input=FaceUnity.ExtractNNModelInput(model.w,model.h,model.channels, matrix,base_color);
			var output=FaceUnity.RunNNModelRaw(model,input);
			cnn_running_time_sum+=output[output.length-1];
			cnn_running_time_count++;
			//console.log("average running time:"+cnn_running_time_sum/cnn_running_time_count+"ms");
			if (cnn_prob.length==0){
				for(var i=0;i<output.length;i++){cnn_prob[i] = output[i];}
			}
			else{
				for(var i=0;i<output.length;i++){cnn_prob[i] = 0.5*output[i]+0.5*cnn_prob[i]; output[i]=cnn_prob[i];}
			}
			//console.log(cnn_prob);
			//console.log(output);
			this.m_texid=FaceUnity.UploadBackgroundSegmentationResult(model,output);
			this.m_matrix=matrix;
		}catch(err){
			console.log(err.stack);
		}},
		FilterEntireImage:function(){try{
			//console.log('FilterEntireImage',this.m_texid)
			if(!this.m_texid){return;}
			now = Date.now();
			var rsq01=1.0/(this.m_matrix[0]*this.m_matrix[0]+this.m_matrix[1]*this.m_matrix[1]);
			var rsq23=1.0/(this.m_matrix[2]*this.m_matrix[2]+this.m_matrix[3]*this.m_matrix[3]);
			for(var i=0;i<bg_boards.length;i++){
				if(bg_boards[i].isActive && bg_boards[i].name.search("_fcbg")!=-1){
					elapse = now - bg_boards[i].last;
					bg_boards[i].frame_id = parseInt(elapse * bg_boards[i].fps / 1000);
					var idx  = (bg_boards[i].frame_id)%bg_boards[i].texture_frames.length;
					FaceUnity.InsertImageFilter("color",s_visualize_shader,{
						inv_matrix0123:[this.m_matrix[0]*rsq01,this.m_matrix[1]*rsq01,this.m_matrix[2]*rsq23,this.m_matrix[3]*rsq23],
						inv_matrix45_image_dim:[this.m_matrix[4],this.m_matrix[5],FaceUnity.g_image_w,FaceUnity.g_image_h],
						tex_segmentation:this.m_texid,
						tex_background:bigtex[bg_boards[i].texture_frames[idx].bigtexidx],
						background_uv_lt:bg_boards[i].texture_frames[idx].vt.slice(0,4),
						background_uv_rb:bg_boards[i].texture_frames[idx].vt.slice(4)
					});	
				}
			}
		}catch(err){
			console.log(err.stack);
		}},
		//back#2ground_seg*/
		////////////////////////////////
		
		////////////////////////////////
		Render:function(params){
			////fixed section
			try{
				
				if (g_params.isAndroid > 0){
					//if (Math.abs(cur_h - params.w)>0.01 && Math.abs(cur_w - params.h)>0.01){
						cur_h=params.w;
						cur_w=params.h;
						reExtract(params);
					//}
				}else{
					//if (Math.abs(cur_w - params.w)>0.01 && Math.abs(cur_h - params.h)>0.01){
						cur_w=params.w;
						cur_h=params.h;
						reExtract(params);
					//}
				}
				
				if(last_state==0){
					switchState(last_state,1);
					last_state = 1;
				}
				
				if (eye_l>=0) boards[eye_l].uniforms={scale:1-params.expression[0]};
				if (eye_r>=0) boards[eye_r].uniforms={scale:1-params.expression[1]};
				
				now = Date.now();
				//// for ar mesh
				for(var i=0;i<arCnt;i++){
					FaceUnity.RenderAR(arTex[i]);
				}
				////
				
				var mat_cam=FaceUnity.CreateViewMatrix([0,0,0,1],params.translation);
				
				////<----trigger start section
				for(var i=0;i<boards.length - arCnt;i++){
					
					if(boards[i].triggerstart=="alwaysrender")continue;
					
					if( !boards[i].triggered
						&& boards[i].isActive == true
						&& (boards[i].nodetype == 0||/*group*/boards[i].nodetype == 1)
						&& (boards[i].triggerstart=="newface" 
						|| (/*action start*/boards[i].triggerstart=="faceaction" && isActionTriggered(boards[i].startaction,params)))){
							
						boards[i].triggered = 1;
						boards[i].frame_id = 0;
						boards[i].last = now;
						if(boards[i].nodetype == 1){
							//for group loops
							if(boards[i].looptype=="loopcnt")boards[i].loopcountdown = boards[i].loopcnt;
							
							for(var j = 0;j<boards[i].childNodes.length;j++){
								boards[boards[i].childNodes[j]].triggered = 1;
								boards[boards[i].childNodes[j]].frame_id = 0;
								boards[boards[i].childNodes[j]].last = now;
							}
						}
					}
				}
				////---->
					
				////<----render section
				for(var i=0;i<boards.length - arCnt;i++){
					if(!boards[i].triggered || boards[i].isActive != true)continue;
					if(boards[i].triggerstart=="alwaysrender")continue;
					if(boards[i].nodetype!=1){//non group root node
						elapse = now - boards[i].last;
						boards[i].frame_id = parseInt(elapse * boards[i].fps / 1000);
					
						if(boards[i].looptype=="infinite" || (boards[i].frame_id < boards[i].texture_frames.length * boards[i].loopcnt)){
							var idx  = (boards[i].frame_id)%boards[i].texture_frames.length;
							FaceUnity.RenderBillboard(bigtex[boards[i].texture_frames[idx].bigtexidx],boards[i],boards[i].texture_frames[idx],boards[i].matp,boards[i].rotationType?mat_cam:undefined);
							//console.log(boards[i].name,boards[i].frame_id);
						}
						if(boards[i].looptype=="loop1stay"&& boards[i].frame_id >= boards[i].texture_frames.length * boards[i].loopcnt){
							//loop 1 time and stay at last frame.
							var idx  = boards[i].texture_frames.length-1;
							FaceUnity.RenderBillboard(bigtex[boards[i].texture_frames[idx].bigtexidx],boards[i],boards[i].texture_frames[idx],boards[i].matp,boards[i].rotationType?mat_cam:undefined);
						}
					}
				}
				////---->
				
				////trigger end section
				for(var i=0;i<boards.length - arCnt;i++){
					if(boards[i].triggered!=1)continue;
					if(boards[i].triggerend=="newface"){
						//for triggerstart == alwaysrender
						boards[i].triggered = 0;
						boards[i].frame_id =0;
						boards[i].last = now;
						activateNext(boards[i]);
						if(boards[i].nodetype==1){
							recursiveStop(i,now);
						}
						boards[i].isActive = false;
						
						continue;
					}
					if(/*action end*/boards[i].triggerend=="faceaction" && isActionTriggered(boards[i].endaction,params)){
						boards[i].triggered = 0;
						boards[i].frame_id =0;
						boards[i].last = now;
						activateNext(boards[i]);
						if(boards[i].nodetype==1){
							recursiveStop(i,now);
						}
						if(boards[i].triggerstart=="newface"||boards[i].triggerstart=="alwaysrender"){
							boards[i].isActive = false;
							
						}
					}
					if(boards[i].triggerstart=="alwaysrender" || (boards[i].root!=-1 && boards[boards[i].root].triggerstart=="alwaysrender"))continue;
					
					if(/*action keep*/boards[i].triggerstart=="faceaction" && boards[i].needkeepfaceaction== 1 && !isActionTriggered(boards[i].startaction,params)){
						boards[i].triggered = 0;
						boards[i].frame_id =0;
						boards[i].last = now;
						activateNext(boards[i]);
						if(boards[i].nodetype==1){
							recursiveStop(i,now);
						}
					}
					
					
					if(/*action end*/boards[i].triggerend=="faceaction" && isActionTriggered(boards[i].endaction,params)){
						boards[i].triggered = 0;
						boards[i].frame_id =0;
						boards[i].last = now;
						activateNext(boards[i]);
						if(boards[i].nodetype==1){
							recursiveStop(i,now);
						}
						if(boards[i].triggerstart=="newface"){
							boards[i].isActive = false;
						}
					}
					if(/*loop end*/boards[i].looptype=="loopcnt" && ((boards[i].frame_id +1) >= boards[i].texture_frames.length * boards[i].loopcnt)){
						boards[i].triggered = 0;
						boards[i].frame_id =0;
						boards[i].last = now;
						activateNext(boards[i]);
						if(boards[i].triggerstart=="newface"){
							boards[i].isActive = false;
							activateNext(boards[i]);
						}
						if(boards[i].nodetype==3){
							//last node
							var root = boards[boards[i].root];
							if(root.looptype=="loopcnt"){
								//console.log("countdown");
								root.loopcountdown-=1;
								if(root.loopcountdown > 0){
									for(var j = 0;j<root.childNodes.length;j++){
										boards[root.childNodes[j]].triggered = 1;
										boards[root.childNodes[j]].frame_id = 0;
										boards[root.childNodes[j]].last = now;
									}
								}else{
									activateNext(boards[boards[i].root]);
									recursiveStop(boards[i].root,now);
									if(root.triggerstart=="newface"){
										root.isActive = false;
									}
								}
							}
							if(root.looptype=="infinite"){
								//restart loop
								//console.log("loop end");
								for(var j = 0;j<root.childNodes.length;j++){
									boards[root.childNodes[j]].triggered = 1;
									boards[root.childNodes[j]].frame_id = 0;
									boards[root.childNodes[j]].last = now;
								}
							}
							
						}else if(boards[i].nodetype==2){
							//start next node
							for(var j = 0;j<boards[i].childNodes.length;j++){
								//console.log(boards[boards[i].childNodes[j]].name);
								boards[boards[i].childNodes[j]].triggered = 1;
								boards[boards[i].childNodes[j]].frame_id = 0;
								boards[boards[i].childNodes[j]].last = now;
							}
						}
					}
				}
			////
			////dyn1////
			}catch(err){
				console.log(err.stack)
			}
		},
		RenderNonFace:function(params){
			////fixed section
			try{
				
				if (g_params.isAndroid > 0){
					//if (Math.abs(cur_h - params.w)>0.01 && Math.abs(cur_w - params.h)>0.01){
						cur_h=params.w;
						cur_w=params.h;
						reExtract(params);
					//}
				}else{
					//if (Math.abs(cur_w - params.w)>0.01 && Math.abs(cur_h - params.h)>0.01){
						cur_w=params.w;
						cur_h=params.h;
						reExtract(params);
					//}
				}
				
				if(last_state==1 && !params.face_count){
					switchState(last_state,0);
					last_state = 0;
				}
				
				now = Date.now();
				
				//var mat_cam=FaceUnity.CreateViewMatrix([0,0,0,1],params.translation);
				
				////<----trigger start section
				for(var i=0;i<boards.length - arCnt;i++){
					if(boards[i].triggerstart!="alwaysrender")continue;
					//for independent item
					if(!boards[i].triggered 
						&& boards[i].isActive == true
						&& (boards[i].nodetype == 0 || boards[i].nodetype == 1)
						&& (boards[i].triggerstart=="alwaysrender")){
						boards[i].triggered = 1;
						boards[i].frame_id = 0
						boards[i].last = now;
						if(boards[i].nodetype == 1){
							//for group loops
							if(boards[i].looptype=="loopcnt")boards[i].loopcountdown = boards[i].loopcnt;
							for(var j = 0;j<boards[i].childNodes.length;j++){
								boards[boards[i].childNodes[j]].triggered = 1;
								boards[boards[i].childNodes[j]].frame_id = 0;
								boards[boards[i].childNodes[j]].last = now;
							}
						}
					}
				}
				////---->
					
				////<----render section
				for(var i=0;i<boards.length - arCnt;i++){
					if(!boards[i].triggered || boards[i].isActive != true)continue;
					if(boards[i].nodetype==0 && boards[i].triggerstart!="alwaysrender")continue;
					if((boards[i].nodetype==2||boards[i].nodetype==3) && boards[boards[i].root].triggerstart!="alwaysrender")continue;
					
					if(boards[i].nodetype!=1){
						elapse = now - boards[i].last;
						boards[i].frame_id = parseInt(elapse * boards[i].fps / 1000);
						if(boards[i].looptype=="infinite" || (boards[i].frame_id < boards[i].texture_frames.length * boards[i].loopcnt)){
							var idx  = (boards[i].frame_id)%boards[i].texture_frames.length;
							FaceUnity.RenderBillboard(bigtex[boards[i].texture_frames[idx].bigtexidx],boards[i],boards[i].texture_frames[idx],boards[i].matp);
						}
						if(boards[i].looptype=="loop1stay"&& boards[i].frame_id >= boards[i].texture_frames.length * boards[i].loopcnt){
							//loop 1 time and stay at last frame.
							var idx = boards[i].texture_frames.length-1;
							FaceUnity.RenderBillboard(bigtex[boards[i].texture_frames[idx].bigtexidx],boards[i],boards[i].texture_frames[idx],boards[i].matp);
						}
					}
				}
				////---->
				
				////trigger end section
				for(var i=0;i<boards.length - arCnt;i++){
					if(!boards[i].triggered)continue;
					if((boards[i].nodetype==0||boards[i].nodetype==1) && boards[i].triggerstart!="alwaysrender")continue;
					if(boards[i].nodetype==3 && boards[boards[i].root].triggerstart=="newface" && !params.face_count){
						recursiveStop(boards[i].root,now);
						continue;
					}
					if((boards[i].nodetype==2||boards[i].nodetype==3) && boards[boards[i].root].triggerstart!="alwaysrender")continue;
					
					/*faceaction end*///need to trigger in Render(),here params.expression==undefined
					try{
					if((/*loop end*/boards[i].looptype=="loopcnt" && (boards[i].frame_id +1)>= boards[i].texture_frames.length * boards[i].loopcnt)){
						boards[i].triggered = 0;
						boards[i].frame_id = 0;
						boards[i].last = now;
						boards[i].isActive = false;
						activateNext(boards[i]);
						if(boards[i].nodetype==3){
							//last node
							var root = boards[boards[i].root];
							if(root.looptype=="loopcnt"){
								root.loopcountdown-=1;
								if(root.loopcountdown > 0){
									for(var j = 0;j<root.childNodes.length;j++){
										boards[root.childNodes[j]].triggered = 1;
										boards[root.childNodes[j]].frame_id = 0;
										boards[root.childNodes[j]].last = now;
									}
								}else{
									recursiveStop(boards[i].root,now);
									root.isActive = false;
									activateNext(boards[boards[i].root]);
								}
							}
							if(root.looptype=="infinite"){
								//restart loop
								for(var j = 0;j<root.childNodes.length;j++){
									boards[root.childNodes[j]].triggered = 1;
									boards[root.childNodes[j]].frame_id = 0;
									boards[root.childNodes[j]].last = now;
								}
							}
						}else if(boards[i].nodetype==2){
							//start next node
							for(var j = 0;j<boards[i].childNodes.length;j++){
								boards[boards[i].childNodes[j]].triggered = 1;
								boards[boards[i].childNodes[j]].frame_id = 0;
								boards[boards[i].childNodes[j]].last = now;
							}
						}
					}
					}catch(err){
						console.log(err.stack);
					}
				}
			}catch(err){
				console.log(err.stack)
			}
		},
		name:"dummy",
	};
})()