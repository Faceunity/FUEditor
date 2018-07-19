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
	/////////////////////////util
	var CopySign = function (a, b) {
        var sign = 1;
        if (b < 0) sign = -1;
        return Math.abs(a) * sign;
    }

    var Quat2Euler = function (quat) {
        var x = quat[0]; var y = quat[1]; var z = quat[2]; var w = quat[3];
        // x-axis rotation
        var sinr = 2.0 * (w * x + y * z);
        var cosr = 1.0 - 2.0 * (x * x + y * y);
        var rx = Math.atan2(sinr, cosr);

        // y-axis rotation
        var sinp = 2.0 * (w * y - z * x);
        var ry = 0;
        if (Math.abs(sinp) >= 1)
            ry = CopySign(Math.PI * 0.5, sinp); // use 90 degrees if out of range
        else
            ry = Math.asin(sinp);

        // z-axis rotation
        var siny = 2.0 * (w * z + x * y);
        var cosy = 1.0 - 2.0 * (y * y + z * z);  
        var rz = Math.atan2(siny, cosy);

        var rta = 180.0 / Math.PI;
        rx *= rta; ry *= rta; rz *= rta;
        return [rx, ry, rz];
    }

    // axis = 0 is x, axis = 1 is y, axis = 2 is z
    // opt = 0 means less, opt = 1 means greater
    var isRotationTriggered = function (axis, value, opt, params) {
        var quat = params.rotation;
        var degree = Quat2Euler(quat)[axis];
        switch (opt) {
            case 0:
                if (degree < value)
                    return true;
                break;
            case 1:
                if (degree > value)
                    return true;
                break;
        }
        return false;
    }

	var isActionTriggered=function (actionname, params){
		if(params.expression==undefined || params.rotation==undefined)return false;
		switch (actionname){
			//#action
			default:
				return false;
				break;
		}
	};
	//
	console.log("Platform:",FaceUnity.m_platform);
	
	var g_params = {
	    isAndroid: 0,
	    isLandscape: 0,
	    rotationAngle: 0,
	    rotationTexAngle: 0,
		rotationBGTexAngle: 0,
	    matp: [1, 0, 0, 1],
	    hasmatp: 0,
	    rmode: 0,
	    isTracked: 0,
	    bgScaleW: 1,
	    bgScaleH: 1,
	    screenW: 0,
	    screenH: 0,
		resetFlag: 0
	};
	/////////////////////////res
	var boards = JSON.parse(FaceUnity.ReadFromCurrentItem("2d_desc.json"));
	var bigtexjson = JSON.parse(FaceUnity.ReadFromCurrentItem("2d_bigtex_desc.json"));
	var s_eyes_shader=FaceUnity.ReadFromCurrentItem("2d_eyes.glsl");
	
	/*back#1ground_seg
	if(!FaceUnity.LoadNNModel)console.log("!!!this faceunity nama sdk is lite version, not support NN");
	var model_v=FaceUnity.LoadNNModel("nn_v.json");
	var model_h=FaceUnity.LoadNNModel("nn_h.json");
	var base_color=new Float32Array([-122.675/255,-116.669/255,-104.008/255]);
	var s_visualize_shader=FaceUnity.ReadFromCurrentItem("visualize.glsl");
	var cur_rotation_mode=-1;
	var cnn_prob = new Array();
	var cnn_running_time_sum = 0.;
	var cnn_running_time_count = 0;
	//back#1ground_seg*/
	
	var bigtexcnt = 0;
	var bigtex = new Array();
	for(var i=0;i<bigtexjson["bigtexs"].length;i++){
		bigtex[bigtexcnt] = FaceUnity.LoadTexture(bigtexjson["bigtexs"][i],0);
		bigtexcnt++;
	}
	
	var arTex = new Array();
	var ar_meshs = boards.filter(function(board){return board.name.search("_ar")!=-1;});
	
	var boards = boards.filter(function(board){return board.name.search("_ar")==-1;});
	
	ar_meshs.forEach(function(armesh){arTex.push(FaceUnity.LoadTexture(armesh.path));});
	
	var AnimCounter={
		names:{},
		count:0,
		total:0,
		finish:function(name){
			if(this.names[name])return;
			this.names[name] = 1;
			this.count++;
			console.log("finish:",name,this.names[name],this.count);
		},
		hasFinish:function(){
			console.log("2d finish cnt",this.count);
			return this.count >= 1 ? 1:0;
		},
		allFinish:function(){
			console.log("2d finish cnt",this.count);
			return (this.count >= this.total && this.total!=0) ? 1 : 0;
		}
	}
	
	var deepCopy =function(p, c){
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
	
	//define Mesh for render objects
	//constructor Mesh, board for 2d,drawcall for 3d,
	var Mesh = function(board, drawcall){
		if(board!=undefined){
			deepCopy(board,this);
			this.texture_frames_bk = deepCopy(board.texture_frames,[]);
			this.itemtype=2;
			if (this.name == "EyeL"||this.name == "EyeR") this.shader=s_eyes_shader;
		}else if(drawcall!=undefined){
			this.itemtype=3;
		}
		if(this.betriggered==undefined)this.isActive = true;
		this.isFullScreenObj = 0;
		this.isFinished = 0;
		this.hand = -1;
		this.handTriggerd = false;
		this.handx = 0;
		this.handy = 0;
		this.triggerTime = 0;
		this.mat_seg = [1,0,0,1];
		this.paused = false;
		this.pauseTime = 0;
		this.pauseSum = 0;
		this.focal_length = (this.focal_length==undefined || Math.abs(this.focal_length)<0.001)?742.0:this.focal_length;
	}
	Mesh.prototype.reExtract=function (params){ 
		try{
			var w = params.w;
			var h = params.h; 
			if(g_params.isAndroid > 0.5){
				var tmp = w; w = h; h = tmp;	
			}
			var ar_mat = [1,0,0,1];
			if(g_params.hasmatp<0.5){
				var rmode = FaceUnity.g_current_rmode!=undefined ? FaceUnity.g_current_rmode : g_params.rmode;
				if(g_params.isTracked < 0.5){
					if(g_params.isAndroid>0.5)rmode = 1;
					else rmode =0;
				}
				if(g_params.isAndroid && rmode % 2==0){
					var tmp = w; w = h; h = tmp;
				}
				if(!g_params.isAndroid && rmode % 2==1){
					var tmp = w; w = h; h = tmp;
				}
				if(FaceUnity.GetARMat){
					var m= FaceUnity.GetARMat();
					ar_mat = [m[0],m[1],m[2],m[3]];
				}
				if(g_params.isTracked < 0.5 ){
					if(g_params.isAndroid>0.5)ar_mat = [0,1,-1,0];
					else ar_mat = [1,0,0,1];
				}
			}
			if(g_params.hasmatp)ar_mat = g_params.matp;
			if(this.name.search("_fg")!=-1){//foreground item
				for (var j=0;j<this.texture_frames_bk.length;j++){
					var ww = this.texture_frames_bk[j].v[2];
					var hh = this.texture_frames_bk[j].v[5];
					var ratio = (w/380.0) < (h/672.0) ? (w/380.0) : (h/672.0);
					ww = ww * ratio;
					hh = hh * ratio;
					var rcx = this.texture_frames_bk[j].v[8];
					var rcy = 1-this.texture_frames_bk[j].v[11];
					var bx = - w/2 + rcx * w;
					var bh = -h/2 + rcy * h;
					var l = this.texture_frames_bk[j].v[0]* ratio;
					var r = this.texture_frames_bk[j].v[3]* ratio;
					var t = this.texture_frames_bk[j].v[1]* ratio;
					var b = this.texture_frames_bk[j].v[10]* ratio;
					this.texture_frames[j].v=[ bx + l, bh + t,params.focal_length,
													bx + r, bh + t,params.focal_length,
													bx + r, bh + b,params.focal_length,
													bx + l, bh + b,params.focal_length];
				}
				this.matp = ar_mat;
				this.isFullScreenObj = 1;
			}
			if (this.name.search("_fc") != -1) {//full screen items
			    if (g_params.screenW != 0 && g_params.screenH != 0) {
			        if (g_params.screenH / g_params.screenW > h / w) {
			            g_params.bgScaleH = 1;
			            g_params.bgScaleW = (g_params.screenW * h) / (g_params.screenH * w);
			        } else {
			            g_params.bgScaleW = 1;
			            g_params.bgScaleH = (w * g_params.screenH) / (h * g_params.screenW);
			        }
			    }

				var scalez = 1;
				if(this.name[this.name.length-2]=='g') scalez = (20000/this.focal_length);//fcbackground
				for (var j = 0; j < this.texture_frames_bk.length; j++) {
				    this.texture_frames[j].v = [-scalez * w / 2 * g_params.bgScaleW, scalez * h / 2 * g_params.bgScaleH, scalez * this.focal_length,
												+scalez * w / 2 * g_params.bgScaleW, scalez * h / 2 * g_params.bgScaleH, scalez * this.focal_length,
												+scalez * w / 2 * g_params.bgScaleW, -scalez * h / 2 * g_params.bgScaleH, scalez * this.focal_length,
												-scalez * w / 2 * g_params.bgScaleW, -scalez * h / 2 * g_params.bgScaleH, scalez * this.focal_length];
				}
				this.matp = ar_mat;
				this.isFullScreenObj = 1;
			}
		}catch(err){
			console.log(err.stack)
		}
	};
	Mesh.prototype.recalUV = function(){
		var flip = g_params.rotationTexAngle < 0 ? 1 : 0;
		var rotationAngle = Math.abs(g_params.rotationTexAngle) % 360;
		var shiftcopy = 8;
		//ccw rotation
		if(Math.abs(rotationAngle-90)<0.01)shiftcopy = 10;
		if(Math.abs(rotationAngle-180)<0.01)shiftcopy = 12;
		if(Math.abs(rotationAngle-270)<0.01)shiftcopy = 14;
		//if(g_params.isLandscape)shiftcopy-=2;
		for (var j=0;j<this.texture_frames_bk.length;j++){
			for(var t =0;t<this.texture_frames_bk[j].vt.length;t++){
				this.texture_frames[j].vt[t] = this.texture_frames_bk[j].vt[(t+shiftcopy)%8]; 
			}
			if(flip){
				for(var i = 0;i<2;i++){
					var tmpx = this.texture_frames[j].vt[i*4+0];
					var tmpy = this.texture_frames[j].vt[i*4+1];
					this.texture_frames[j].vt[i*4+0] = this.texture_frames[j].vt[i*4+2];
					this.texture_frames[j].vt[i*4+1] = this.texture_frames[j].vt[i*4+3];
					this.texture_frames[j].vt[i*4+2] = tmpx;
					this.texture_frames[j].vt[i*4+3] = tmpy;
				}
			}
		}
	}
	Mesh.prototype.recalUVBGSeg = function(angle){
		if(Math.abs(angle-0) < 0.01){
			this.mat_seg = [1,0,0,1];
		}else if(Math.abs(angle-90) < 0.01){
			this.mat_seg = [0,1,-1,0];
		}else if(Math.abs(angle-180) < 0.01){
			this.mat_seg = [-1,0,0,-1];
		}else if(Math.abs(angle-270) < 0.01){
			this.mat_seg = [0,-1,1,0];
		}
	}
	Mesh.prototype.switchState = function(lst,now){
		if(this.betriggered || this.isFinished)return;
		if(lst==0 && now==1){
			if(this.triggerstart=="newface")this.isActive = true;
			//console.log("switchState:",this.name,this.isActive);
		}
		if(lst==1 && now==0){
			if(this.triggerstart=="alwaysrender")this.isActive = true;
		}
		this.orientationChange();
	}
	Mesh.prototype.orientationChange = function(){
		if(this.isFinished)return;
		var bisLandscape = g_params.isLandscape < 0.5 ? false : true;
		if(this.name.search("_fc")!=-1){
			this.isActive = bisLandscape == (this.name.search("_fcl")!=-1||this.name.search("_fcbgl")!=-1);
		}
	}
	Mesh.prototype.stopThis = function(now){
		//console.log("stopThis:",this.name);
		if(!this.triggered)return;
		this.triggered =0;
		this.frame_id = 0;
		this.last = now;
		this.pauseTime = 0;
		this.pauseSum = 0;
		this.activateNext();
		if(this.triggerstart=="newface"||this.triggerstart=="alwaysrender"){
			this.isActive = false;
		}
		if(this.isactiveonce==1){
			this.isFinished=1;
			AnimCounter.finish(this.name);
		}
	}
	Mesh.prototype.recursiveStop = function(now){
		this.stopThis(now);
		if(this.nodetype==3)return;
		for(var i = 0;i < this.childNodesRef.length;i++){
			this.childNodesRef[i].recursiveStop(now);
		}
	}
	Mesh.prototype.stop = function(now){
		if(this.nodetype==1){
			this.recursiveStop(now);
		}else{
			this.stopThis(now);
		}
	}
	Mesh.prototype.activateNext = function(){
		if(this.triggerNextNodesRef==undefined || this.triggerNextNodesRef.length==0)return;
		for(var idx in this.triggerNextNodesRef){
			if(this.triggerNextNodesRef[idx].isFinished==0){
				//this.triggerNextNodesRef[idx].isActive=true;
				this.triggerNextNodesRef[idx].triggerThis(Date.now());
			}
		}
	}
	Mesh.prototype.updateEvent=function(params,now){
		if(this.triggered){
			var elapse = now - this.last - this.pauseSum;
			if(!this.paused) 
				this.frame_id = parseInt(elapse * this.fps / 1000);
			if(this.force_frame_id!=undefined && this.force_frame_id>=0)this.frame_id = this.force_frame_id;
		}
			
		if (this.name == "EyeL" && params.expression)this.uniforms={scale:1-params.expression[0]};
		if (this.name == "EyeR" && params.expression)this.uniforms={scale:1-params.expression[1]};
	}
	Mesh.prototype.pauseThis=function(now) {
		if(!this.paused && this.triggered) {
			this.pauseTime = now;
			this.paused = true;
		}
	}
	Mesh.prototype.resumeThis=function(now) {
		if(this.paused && this.triggered) {
			this.pauseSum += now - this.pauseTime;
			this.paused = false;
		}
	}
	Mesh.prototype.resetThis=function(now) {
		this.stop(now);
		if(this.betriggered==undefined) {
			this.isFinished=0;
			this.isActive=1;
		}
		//this.last = now;
		this.pauseSum = 0;
	}
	Mesh.prototype.triggerThis=function(now){
		if(this.isFinished==1)return;
		this.triggered = 1;
		this.frame_id = 0;
		this.last = now;
		this.isActive = true;
		console.log("thriggerThis2d",this.name);
	}
	Mesh.prototype.triggerStartEvent=function(params,now,isNoneFace){
		if(this.triggered || this.handTriggerd || !this.isActive || !(this.nodetype == 0 || this.nodetype == 1) || this.betriggered!=undefined) return;
		if((!isNoneFace && (this.triggerstart=="newface" || (this.triggerstart=="faceaction" && isActionTriggered(this.startaction,params))))
				||(isNoneFace && this.triggerstart=="alwaysrender")
				||(!isNoneFace && this.hand >= 0)){ // trigger hand	
			this.triggerThis(now);
			if(this.hand >= 0) this.handTriggerd = true;
			if(this.nodetype == 1){
				if(this.looptype=="loopcnt")this.loopcountdown = this.loopcnt;
				for(var j = 0;j<this.childNodesRef.length;j++){
					this.childNodesRef[j].triggerThis(now);
				}
			}
		}
	}
	Mesh.prototype.triggerHand = function(params, now, handi, handx, handy) {
		if(this.triggered || !this.isActive || !(this.nodetype == 0 || this.nodetype == 1)) return;
		if(this.hand >= 0) return;
		if(this.triggerstart == "handaction") {
			console.log("hand trigger!", handi);
			this.hand = handi;
			this.handx = handx;
			this.handy = handy;
			return;
		}
		return;
	}
	Mesh.prototype.triggerNoHand = function(params, now, handi){
		if(this.hand >= 0) {
			console.log("trigger hand end!!!", handi);
			this.hand = -1;
			this.handTriggerd = false;
		}
	}
	Mesh.prototype.renderEvent=function(params,now,mat_cam,isNoneFace){
		if(!this.triggered || this.isActive != true)return;
		/*
		if(!isNoneFace){
			if(this.triggerstart=="alwaysrender"||this.name.search("_fg")!=-1)return;
		}else{
			if(this.name.search("_fg")==-1){
				if(this.nodetype==0 && this.triggerstart!="alwaysrender")return;
				if((this.nodetype==2|| this.nodetype==3) && this.rootRef.triggerstart!="alwaysrender")return;
			}
		}
		*/
		if(this.nodetype!=1 && this.name.search("_bgseg")==-1){//non group root node
			if(this.looptype=="infinite" || (this.frame_id < this.texture_frames.length * this.loopcnt)){
				var idx  = (this.frame_id)%this.texture_frames.length;
				FaceUnity.RenderBillboard(bigtex[this.texture_frames[idx].bigtexidx],this,this.texture_frames[idx],this.matp,this.rotationType?mat_cam:undefined,this.isFullScreenObj,params);
			}
			if(this.looptype=="loop1stay"&& this.frame_id >= this.texture_frames.length * this.loopcnt){
				//loop 1 time and stay at last frame.
				var idx  = this.texture_frames.length-1;
				FaceUnity.RenderBillboard(bigtex[this.texture_frames[idx].bigtexidx],this,this.texture_frames[idx],this.matp,this.rotationType?mat_cam:undefined,this.isFullScreenObj,params);
			}
			gl.disable(gl.DEPTH_TEST);
		}	
	}
	Mesh.prototype.triggerEndEvent = function(params,now,isNoneFace){
		if(this.triggered!=1)return;
		if(!isNoneFace){
			if(this.triggerend=="newface"){
				this.stop(now);return;
			}
			if(/*action end*/this.triggerend=="faceaction" && isActionTriggered(this.endaction,params)){
				this.stop(now);
			}
			if(this.triggerstart=="alwaysrender" || (this.root!=-1 && this.rootRef.triggerstart=="alwaysrender"))return;
			
			if(/*action keep*/this.triggerstart=="faceaction" && this.needkeepfaceaction== 1 && !isActionTriggered(this.startaction,params)){
				this.stop(now);
			}
		}else{
			if((this.nodetype==0||this.nodetype==1) && this.triggerstart!="alwaysrender")return;
			if(this.nodetype==3 && this.rootRef.triggerstart=="newface" && !params.face_count){
				this.rootRef.recursiveStop(now);
				return;
			}
			if((this.nodetype==2||this.nodetype==3) && this.rootRef.triggerstart!="alwaysrender")return;
		}
		
		if(/*loop end*/this.looptype=="loopcnt" && ((this.frame_id +1) >= this.texture_frames.length * this.loopcnt)){
			this.stop(now);
			if(this.nodetype==3){//last node
				var root = this.rootRef;
				if(root.looptype=="loopcnt"){
					root.loopcountdown-=1;
					if(root.loopcountdown > 0){
						for(var j = 0;j<root.childNodesRef.length;j++){
							root.childNodesRef[j].triggerThis(now);
						}
					}else{
						root.recursiveStop(now);
					}
				}
				if(root.looptype=="infinite"){//restart loop
					for(var j = 0;j<root.childNodesRef.length;j++){
						root.childNodesRef[j].triggerThis(now);
					}
				}
			}else if(this.nodetype==0||this.nodetype==1||this.nodetype==2){
				//start next node
				for(var j = 0;j<this.childNodes.length;j++){
					this.childNodesRef[j].triggerThis(now);
				}
			}
		}
	}
	/////////////////////////////////////reorginize data
	var last_state=0;
	AnimCounter.total=0;
	var meshlst = new Array();//oop mesh list for render
	for(var i = 0;i<boards.length;i++){
		var nmesh = new Mesh(boards[i]);
		meshlst.push(nmesh);
		meshlst[nmesh.name]=nmesh;
		if(nmesh.name.search("_fc")!=-1 || nmesh.name.search("_fg")!=-1||nmesh.name.search("_bgseg")!=-1){
			var origin_name = nmesh.name.substr(0,nmesh.name.lastIndexOf('_'));
			meshlst[origin_name]=nmesh
		}
		nmesh.orientationChange();
		if(nmesh.isactiveonce)AnimCounter.total++;
	}
	//speed up for focal_length change, copy lst for reExtract
	var reextract_mesh_ref_lst = meshlst.filter(function pred(mesh){
		return mesh.name.search("_fc")!=-1 || mesh.name.search("_fg")!=-1;
	});
	//speed up for orientationChange, copy lst for full screen obj
	var fc_mesh_ref_lst = reextract_mesh_ref_lst.filter(function pred(mesh){
		return mesh.name.search("_fc")!=-1;
	});
	//speed up for background segmentation
	var bgseg_mesh_ref_lst = meshlst.filter(function pred(mesh){
		return mesh.name.search("_bgseg")!=-1;
	});
	var non_bgseg_mesh_ref_lst = meshlst.filter(function pred(mesh){
		return mesh.name.search("_bgseg")==-1;
	});
	var nonbgseg_nonbg_mesh_ref_lst = non_bgseg_mesh_ref_lst.filter(function pred(mesh){
		return mesh.name.search("_fcbg")==-1 && mesh.name.search("_hnd")==-1;
	});
	var nonbgseg_bg_mesh_ref_lst = non_bgseg_mesh_ref_lst.filter(function pred(mesh){
		return mesh.name.search("_fcbg")!=-1;
	});
	var nonbgseg_nonbg_hnd_mesh_ref_lst = non_bgseg_mesh_ref_lst.filter(function pred(mesh){
		return mesh.name.search("_hnd")!=-1;
	});
	//redirect index
	for(var i = 0;i<meshlst.length;i++){
		var nmesh = meshlst[i];
		if(nmesh.root!=-1)nmesh.rootRef=meshlst[nmesh.root];
		if(nmesh.childNodes.length!=0)nmesh.childNodesRef = new Array();
		for(var j = 0;j<nmesh.childNodes.length;j++){
			nmesh.childNodesRef.push(meshlst[nmesh.childNodes[j]]);
		}
	}
	var alwaysrender_mesh_ref_lst = meshlst.filter(function pred(mesh){
		return (mesh.nodetype==0 && mesh.triggerstart=="alwaysrender")||
				((mesh.nodetype==2|| mesh.nodetype==3) && mesh.rootRef.triggerstart=="alwaysrender");
	});
	var alwaysrender_fcbg_mesh_ref_lst = alwaysrender_mesh_ref_lst.filter(function pred(mesh){
		return mesh.name.search("_fcbg")!=-1;
	});
	var alwaysrender_nonfcbg_mesh_ref_lst = alwaysrender_mesh_ref_lst.filter(function pred(mesh){
		return mesh.name.search("_fcbg")==-1;
	});
	
	//part may involve with 3d meshs
	var calTriggerNextNodesRef=function(meshlst_3d){
		for(var i = 0;i<meshlst.length;i++){
			var nmesh = meshlst[i];
			if(nmesh.triggerNextNodes.length!=0)nmesh.triggerNextNodesRef = new Array();
			for(var j = 0;j<nmesh.triggerNextNodes.length;j++){
				var mesh2dref = meshlst[nmesh.triggerNextNodes[j]];
				if(mesh2dref){nmesh.triggerNextNodesRef.push(mesh2dref);}
				else if(meshlst_3d){
					var mesh3dref = meshlst_3d[nmesh.triggerNextNodes[j]];
					if(mesh3dref){nmesh.triggerNextNodesRef.push(mesh3dref);}
				}
			}
		}
	}
	calTriggerNextNodesRef(undefined);
	console.log("3d AnimCounter.total",AnimCounter.total);
	////////////////////////////////////
	console.log("nama platform:",FaceUnity.m_platform);
	if(FaceUnity.m_platform && FaceUnity.m_platform=="android"){
		g_params.isAndroid=1;
	}
	var now = Date.now();
    ////////////////////////////////////

	var arconf = FaceUnity.ReadFromCurrentItem("armesh.json");
	var faceconf = null, facetex = null, facemvc = null, face_info = null;
	var advblend = false, highres = false;
	var hasface = false;
	if (arconf && arconf != undefined) {
	    console.log("has:", arconf);
	    faceconf = JSON.parse(arconf);
	    var facename = faceconf["name"];
	    advblend = faceconf["advblend"];
	    highres = faceconf["highres"];
	    if (facename != "") {
	        hasface = true;
	        try {
	            facetex = FaceUnity.LoadTexture(facename + ".webp", 0);
	            if (facetex) {
	                facemvc = FaceUnity.LoadMeanValueCoord("mvc.bin", highres);
	                face_info = FaceUnity.LoadFaceInfo(facename + ".bin");
	            }
	        } catch (ex) {
	            console.log(ex);
	        }
	    }
	}
	
	var vtfChecked = false;
	var vtfSupport = false;
	
	return {
		CalRef:calTriggerNextNodesRef,
		meshlst:meshlst,
		animCounter:AnimCounter,
		SetParam:function(name,value){
			if(g_params[name]!=undefined&&typeof(g_params[name])==typeof(value)){
				if(name=="isLandscape"){
					g_params[name]=value;
					fc_mesh_ref_lst.forEach(function(mesh){mesh.orientationChange();});//notify full screen object
				}
				if(name=="isAndroid"){
					g_params[name]=value;
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
					g_params.hasmatp = 1;
					g_params["rotationAngle"] = value;
				}
				if(name=="rotationTexAngle"){
					g_params["rotationTexAngle"] = value;
					fc_mesh_ref_lst.forEach(function(mesh){mesh.recalUV();});//notify full screen object
				}
				if(name == "rotationBGTexAngle") {
					g_params["rotationBGTexAngle"] = value;
					bgseg_mesh_ref_lst.forEach(function(mesh){mesh.recalUVBGSeg(g_params.rotationBGTexAngle);});//notify bg segement object
				}
				if(name=="orientation"){
					g_params.rmode = value;
				}
				if(name=="bgScaleW") {
					g_params.bgScaleW = value;
				}
				if(name=="bgScaleH") {
					g_params.bgScaleH = value;
				}
				if (name == "screenW") {
				    g_params.screenW = value;
				}
				if (name == "screenH") {
				    g_params.screenH = value;
				}
				if (name=="resetFlag") {
					if(value != 0) {
						meshlst.forEach(function(mesh){mesh.resetThis(Date.now());});
					}
				}
				return 1;
			}else{
				try{
					var desc;
					try{desc=JSON.parse(name)||{};}catch(err){console.log("non josn 2d param");return undefined;}
					if(desc.name=="@ALL"){
						meshlst.forEach(function(mesh){mesh[desc.param]=value;});
						return 1;
					}
					var mesh=meshlst[desc.name];
					if(!mesh){
						console.log("2d mesh not found");
						return undefined;
					}
					mesh[desc.param]=value;
					return 1;
				}catch(err){console.log(err);}
			}
		},
		GetParam:function(name){
			if(name=="hasFinish")return AnimCounter.hasFinish();
			if(name=="allFinish")return AnimCounter.allFinish();
			return undefined;
		},
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
				case 2:{matrix[0]=-w;matrix[1]=0;matrix[2]=0;matrix[3]=-h;matrix[4]=w;matrix[5]=h}break;
				case 3:{matrix[0]=0;matrix[1]=-h;matrix[2]=w;matrix[3]=0;matrix[4]=0;matrix[5]=h;}
			}
			//console.log("w/h"+1.*w/h);
			//console.log("rotation mode: "+rotation_mode);
			//console.log("w/h<1: "+w/h<1);
			if ((rotation_mode&1)^(w/h<1))
			{
				var input_v=FaceUnity.ExtractNNModelInput(model_v.w,model_v.h,model_v.channels, matrix,base_color);
				var output_v=FaceUnity.RunNNModelRaw(model_v,input_v);
				this.m_texid=FaceUnity.UploadBackgroundSegmentationResult(model_v,output_v);
				//console.log("vertical");
				cnn_running_time_sum+=output_v[output_v.length-1];
				cnn_running_time_count++;
				//console.log("average running time:"+cnn_running_time_sum/cnn_running_time_count+"ms");
				if (cnn_prob.length==0){
					for(var i=0;i<output_v.length;i++){cnn_prob[i] = output_v[i];}
				}
				else{
					for(var i=0;i<output_v.length;i++){cnn_prob[i] = 0.5*output_v[i]+0.5*cnn_prob[i]; output_v[i]=cnn_prob[i];}
				}
			}
			else
			{
				var input_h=FaceUnity.ExtractNNModelInput(model_h.w,model_h.h,model_h.channels, matrix,base_color);
				var output_h=FaceUnity.RunNNModelRaw(model_h,input_h);
				this.m_texid=FaceUnity.UploadBackgroundSegmentationResult(model_h,output_h);
				//console.log("horizontal");
				cnn_running_time_sum+=output_h[output_h.length-1];
				cnn_running_time_count++;
				//console.log("average running time:"+cnn_running_time_sum/cnn_running_time_count+"ms");
				if (cnn_prob.length==0){
					for(var i=0;i<output_h.length;i++){cnn_prob[i] = output_h[i];}
				}
				else{
					for(var i=0;i<output_h.length;i++){cnn_prob[i] = 0.5*output_h[i]+0.5*cnn_prob[i]; output_h[i]=cnn_prob[i];}
				}
			}
			
			this.m_matrix=matrix;
		}catch(err){
			console.log(err.stack);
		}},
		FilterEntireImage:function(flip_x,flip_y){try{
			//console.log('FilterEntireImage',this.m_texid)
			if(!this.m_texid){return;}
			now = Date.now();
			var rsq01=1.0/(this.m_matrix[0]*this.m_matrix[0]+this.m_matrix[1]*this.m_matrix[1]);
			var rsq23=1.0/(this.m_matrix[2]*this.m_matrix[2]+this.m_matrix[3]*this.m_matrix[3]);
			for(var i=0;i<bgseg_mesh_ref_lst.length;i++){
				var curbg = bgseg_mesh_ref_lst[i];
				if(curbg.triggered && curbg.isActive){
					elapse = now - curbg.last;
					curbg.frame_id = parseInt(elapse * curbg.fps / 1000);
					if(curbg.force_frame_id!=undefined && curbg.force_frame_id>=0)curbg.frame_id = curbg.force_frame_id;
					var idx  = (curbg.frame_id)%curbg.texture_frames.length;
					var is_bgra = (FaceUnity.m_is_bgra==2 ||  FaceUnity.m_is_bgra==4)?1:0;
					FaceUnity.InsertImageFilter("color",s_visualize_shader,{
						inv_matrix0123:[this.m_matrix[0]*rsq01,this.m_matrix[1]*rsq01,this.m_matrix[2]*rsq23,this.m_matrix[3]*rsq23],
						inv_matrix45_image_dim:[this.m_matrix[4],this.m_matrix[5],FaceUnity.g_image_w,FaceUnity.g_image_h],
						tex_segmentation:this.m_texid,
						tex_background:bigtex[curbg.texture_frames[idx].bigtexidx],
						background_uv_lt:curbg.texture_frames[idx].vt.slice(0,4),
						background_uv_rb:curbg.texture_frames[idx].vt.slice(4),
						is_bgra:is_bgra,
						flipx: (flip_x!=undefined)?flip_x:0.0,
						flipy: (flip_y!=undefined)?flip_y:0.0,
						mat_seg: curbg.mat_seg
					});	
				}
			}
		}catch(err){
			console.log(err.stack);
		}},
		//back#2ground_seg*/
		////////////////////////////////
		Render:function(params,pass){
			try{
				if(!vtfChecked) { // check vtf first
					var ret = 0;
	                if (FaceUnity.TestVTF != undefined)
	                    ret = FaceUnity.TestVTF();
					if (ret > 0)
						vtfSupport = true;
					else 
						console.log("vtf unsupported, can not change face!!!");
					vtfChecked = true;
				}
				
				g_params.isTracked = 1;
				now = Date.now();
				if(pass==1){
					//v4.0.6 alphacut issue, bg render first
					var mat_cam = undefined;
					if(last_state==0){
						for(var i = 0; i < meshlst.length; i++)meshlst[i].switchState(last_state,1);
						last_state = 1;
					}
					for(var i = 0; i < meshlst.length; i++){
						if(params.isPause) meshlst[i].pauseThis(now);
						else meshlst[i].resumeThis(now);
						meshlst[i].updateEvent(params,now);
						meshlst[i].triggerStartEvent(params,now,false);
					}
					for(var i = 0; i < nonbgseg_bg_mesh_ref_lst.length; i++)nonbgseg_bg_mesh_ref_lst[i].renderEvent(params,now,mat_cam,false);
					
				}else if(pass==2){
				    //render armesh
				    if (!hasface) {
				        if (highres==0) {
				            for (var i = 0; i < arTex.length; i++) { FaceUnity.RenderAR(arTex[i], undefined, undefined, params); }
				        }
				        else {
				            for (var i = 0; i < arTex.length; i++) { FaceUnity.RenderAREx(arTex[i], undefined, undefined, params); }
				        }
				    } else {
				        if (facetex) {
				            if (advblend != 0) {
								if (vtfSupport)
									FaceUnity.FaceTransfer(facetex, face_info, highres);
				            } else {
				                if (highres == 0)
				                    FaceUnity.RenderAR(facetex, undefined, undefined, params);
				                else
				                    FaceUnity.RenderAREx(facetex, undefined, undefined, params);
				            }
				        }
				    }
					var mat_cam=FaceUnity.CreateViewMatrix([0,0,0,1],params.translation);
					//render non bg mesh
					for(var i = 0; i < nonbgseg_nonbg_mesh_ref_lst.length; i++)nonbgseg_nonbg_mesh_ref_lst[i].renderEvent(params,now,mat_cam,false);
					
					//render hand track mesh
					for(var i = 0; i < nonbgseg_nonbg_hnd_mesh_ref_lst.length; i++) {
						var meshToRender = nonbgseg_nonbg_hnd_mesh_ref_lst[i];
						var w = params.w;
						var h = params.h;
						var x0=w/2-meshToRender.handx;
						var y0=h/2-meshToRender.handy;
						var x = x0;
						var y = y0;
						var z = params.focal_length;
						var mat_hnd = FaceUnity.CreateViewMatrix([0,0,0,1],[x,y,z]);
						meshToRender.renderEvent(params,now,mat_hnd,true);
					}
					
					for(var i = 0; i < meshlst.length; i++)meshlst[i].triggerEndEvent(params,now,false);
				}
				
			}catch(err){
				console.log(err.stack)
			}
		},
		
		RenderNonFace:function(params,pass){
			try{
				now = Date.now();
				if(pass==1){
					for(var i = 0; i < reextract_mesh_ref_lst.length; i++)reextract_mesh_ref_lst[i].reExtract(params);
					
					if(last_state==1 && !params.face_count){
						for(var i = 0; i < meshlst.length; i++)meshlst[i].switchState(last_state,0);
						last_state = 0;
					}
					
					for(var i = 0; i < meshlst.length; i++){
						if(params.isPause) meshlst[i].pauseThis(now);
						else meshlst[i].resumeThis(now);
						meshlst[i].updateEvent(params,now);
						meshlst[i].triggerStartEvent(params,now,true);
					}
					if(!params.face_count)for(var i = 0; i < alwaysrender_fcbg_mesh_ref_lst.length; i++)alwaysrender_fcbg_mesh_ref_lst[i].renderEvent(params,now,undefined,true);	
				}else if(pass == 2){
					if(!params.face_count)for(var i = 0; i < alwaysrender_nonfcbg_mesh_ref_lst.length; i++)alwaysrender_nonfcbg_mesh_ref_lst[i].renderEvent(params,now,undefined,true);
					
					//TODO
					
					for(var i = 0; i < meshlst.length; i++)meshlst[i].triggerEndEvent(params,now,true);			
				}
			}catch(err){
				console.log(err.stack)
			}
		},
		
		TriggerHand:function(params, handi, handx, handy) {
			for(var i = 0; i < meshlst.length; i++){
				meshlst[i].triggerHand(params, now, handi, handx, handy);
			}
		},
		
		TriggerNoHand:function(params, handi) {
			for(var i = 0; i < meshlst.length; i++){
				meshlst[i].triggerNoHand(params,now, handi);
			}
		},
		
		UpdateHand:function(handi, handx, handy) {
			for(var i = 0; i < meshlst.length; i++) {
				if(handi == meshlst[i].hand && meshlst[i].handTriggerd) {
					meshlst[i].handx = handx;
					meshlst[i].handy = handy;
				}
			}
		},
		
		CheckTriggerEnd:function(handi) {
			for(var i = 0; i < meshlst.length; i++){
				if(meshlst[i].handTriggerd && !meshlst[i].triggered)
					return true;
			}
			return false;
		},
		
		name:"dummy",
	};
})()