(function(){
	var g_default_params={    
		version:6,
		isAndroid: 1,
		multiHands:1,
		detected:0,
        loc_x_flip:0,
        loc_y_flip:0,
		boxes:[],
		clearFrame: 30
	};
	var g_params=JSON.parse(JSON.stringify(g_default_params));
	var playVelocity = 1;
	var cur_frame_id = 0;
	var is_rendering = 0;
	var render_count=0;
	//console.log("nn:"+FaceUnity.LoadNNModelThread);
	var model=FaceUnity.LoadNNModelThread("nn.json");
	var base_color=new Float32Array([-104,-117,-123]);
	
	var Handboxes = new Float32Array([0,0,0,0]);
	var UseState = false;
    var nowFrame = 0;
	
	return {
		m_hands:[],
		m_particles:[],
		m_matrix:[],
		//load detector data and parameters
		OnGeneralSSDDetector:function(){
			try{
			var matrix=new Float32Array(6);
			var rotation_mode=FaceUnity.g_current_rmode;
			var w=FaceUnity.g_image_w;
			var h=FaceUnity.g_image_h;
			switch(rotation_mode){
			default:{
				console.log('invalid rotation mode',rotation_mode);
			}break;case 0:{
				matrix[0]=w;
				matrix[1]=0;
				matrix[2]=0;
				matrix[3]=h;
				matrix[4]=0;
				matrix[5]=0;
			}break;case 1:{
				matrix[0]=0;
				matrix[1]=h;
				matrix[2]=-w;
				matrix[3]=0;
				matrix[4]=w;
				matrix[5]=0;
			}break;case 2:{
				matrix[0]=-w;
				matrix[1]=0;
				matrix[2]=0;
				matrix[3]=-h;
				matrix[4]=w;
				matrix[5]=h;
			}break;case 3:{
				matrix[0]=0;
				matrix[1]=-h;
				matrix[2]=w;
				matrix[3]=0;
				matrix[4]=0;
				matrix[5]=h;
			}}
            var mid_w = 0.5*matrix[0]+0.5*matrix[2]+matrix[4];
			var mid_h = 0.5*matrix[1]+0.5*matrix[3]+matrix[5];
            var maxlen = Math.max(h,w);
            switch(rotation_mode){
			default:{
				console.log('invalid rotation mode',rotation_mode);
			}break;case 0:{
				matrix[0]=maxlen;
				matrix[1]=0;
				matrix[2]=0;
				matrix[3]=maxlen;
				matrix[4]=-(0.5*matrix[0]+0.5*matrix[2])+mid_w;
				matrix[5]=-(0.5*matrix[1]+0.5*matrix[3])+mid_h;
			}break;case 1:{
				matrix[0]=0;
				matrix[1]=maxlen;
				matrix[2]=-maxlen;
				matrix[3]=0;
				matrix[4]=-(0.5*matrix[0]+0.5*matrix[2])+mid_w;
				matrix[5]=-(0.5*matrix[1]+0.5*matrix[3])+mid_h;
			}break;case 2:{
				matrix[0]=-maxlen;
				matrix[1]=0;
				matrix[2]=0;
				matrix[3]=-maxlen;
				matrix[4]=-(0.5*matrix[0]+0.5*matrix[2])+mid_w;
				matrix[5]=-(0.5*matrix[1]+0.5*matrix[3])+mid_h;
			}break;case 3:{
				matrix[0]=0;
				matrix[1]=-maxlen;
				matrix[2]=maxlen;
				matrix[3]=0;
				matrix[4]=-(0.5*matrix[0]+0.5*matrix[2])+mid_w;
				matrix[5]=-(0.5*matrix[1]+0.5*matrix[3])+mid_h;
			}}
            
            this.m_matrix=matrix;
			var input=FaceUnity.ExtractSSDInput(model.w,model.h,model.channels, matrix,base_color);
            var output=FaceUnity.RunNNModelThread(model,input);
			output.length=output.length-1;
            this.OnDetect(output);
			}catch(err){
			console.log(err.stack);
			}
		},
		OnDetect:function(boxes) {
			try {
				//boxes is a Float32Array with 1 or more x,y,w,h bounding boxes			
				var hands=this.m_hands;
				var matrix=this.m_matrix;
				var rotation_mode=FaceUnity.g_current_rmode;
				var w=FaceUnity.g_image_w;
				var h=FaceUnity.g_image_h;
				var imgw=w;
				var imgh=h;
				var maxlen = Math.max(h,w);
				for(var i=0;i<boxes.length;i+=7){
					//if (boxes[i+2]<0.65) continue;								
					if (boxes[i+2]<0.9) continue;
					
					var x=(boxes[i+3]+boxes[i+5])/2;
					var y=(boxes[i+4]+boxes[i+6])/2;
					var w=Math.abs(boxes[i+3]-boxes[i+5])*maxlen;
					var h=Math.abs(boxes[i+4]-boxes[i+6])*maxlen;
					
					x=(boxes[i+3]+boxes[i+5])/2*matrix[0]+(boxes[i+4]+boxes[i+6])/2*matrix[2]+matrix[4];
					y=(boxes[i+3]+boxes[i+5])/2*matrix[1]+(boxes[i+4]+boxes[i+6])/2*matrix[3]+matrix[5];
					
					var r=Math.sqrt(w*w+h*h)*0.5;
					var is_dup=0;
					if(hands.length>0 && !isNaN(x)) UseState = true;
					for(var j=0;j<hands.length;j++){
						if(!isNaN(x) && UseState) {
							Handboxes[0]=x;
							Handboxes[1]=y;
							Handboxes[2]=w;
							Handboxes[3]=h;
						}
						var dx=x-hands[j].x;
						var dy=y-hands[j].y;
						
						if(Math.sqrt(dx*dx+dy*dy)<(r+hands[j].r)*0.5){
							is_dup=1;
							hands[j].repeat=hands[j].repeat+1;
							if (hands[j].renderframe>0)
							{
								hands[j].detectframe=cur_frame_id;
								hands[j].detectx=x;
								hands[j].detecty=y;
								hands[j].detectr=r;
							}
							break;
						}
					}
					if(is_dup){continue;}
					if (is_rendering==0) hands.push({x:x,y:y,r:r, energy:1,repeat:0,detectframe:(cur_frame_id+1),detectx:x,detecty:y,detectr:r,renderframe:0});
				}
			} catch (err) {
				console.log(err.stack);
			}
		},
		GetParam:function(name){
			if (name == "box_x") { 
				if (UseState)
					return Handboxes[0];
				else 
					return undefined;
			} else if (name == "box_y") {
				if (UseState)
					return Handboxes[1];
				else 
					return undefined;
			} else if (name == "box_w") { 
				if (UseState)
					return Handboxes[2];
				else
					return undefined;
			} else if (name == "box_h") {
				if (UseState)
					return Handboxes[3];
				else
					return undefined;
			}
			
			if(g_params[name]!=undefined)        
				return g_params[name];
			else
				return undefined;
		},
		SetParam:function(name,value){
			if(g_params[name]!=undefined&&typeof(g_params[name])==typeof(value)) {
				g_params[name]=value;
				return 1;
			} else return undefined;
		},
		TriggerHand:function(item, params) {
			try{
				var w=params.w;
				var h=params.h;
				var hands=this.m_hands;
				cur_frame_id = params.frame_id;
				
				
			var x_len=0;
            var y_bbmax=0;
            var y_bbmin=0;
            var x_bbmax=0;
            var x_bbmin=0;
            //check cute gesture_cute1
            if (Math.abs(params.landmarks[1*2+0]-params.landmarks[13*2+0])>Math.abs(params.landmarks[1*2+1]-params.landmarks[13*2+1]))
            {
                if (params.landmarks[1*2+0]>params.landmarks[13*2+0])
                {
                    len=(params.landmarks[1*2+0]-params.landmarks[13*2+0])/2;
                    y_bbmax=params.landmarks[7*2+1]+len*0.1;
                    y_bbmin=(params.landmarks[1*2+1]+params.landmarks[13*2+1])/2-len*0.2;
                    x_bbmax=params.landmarks[1*2+0]+len*0.1;
                    x_bbmin=params.landmarks[13*2+0]-len*0.1;
                }
                else
                {
                    len=(params.landmarks[13*2+0]-params.landmarks[1*2+0])/2;
                    y_bbmax=(params.landmarks[13*2+1]+params.landmarks[1*2+1])/2+len*0.2;
                    y_bbmin=params.landmarks[7*2+1]-len*0.1;
                    x_bbmax=params.landmarks[13*2+0]+len*0.1;
                    x_bbmin=params.landmarks[1*2+0]-len*0.1;
                }
            }
            else
            {
                if (params.landmarks[1*2+1]>params.landmarks[13*2+1])
                {
                    len=(params.landmarks[1*2+1]-params.landmarks[13*2+1])/2;
                    y_bbmax=params.landmarks[1*2+1]+len*0.1;
                    y_bbmin=params.landmarks[13*2+1]-len*0.1;
                    x_bbmax=(params.landmarks[1*2+0]+params.landmarks[13*2+0])/2+len*0.2;
                    x_bbmin=params.landmarks[7*2+0]-len*0.1;
                }
                else
                {
                    len=(params.landmarks[13*2+1]-params.landmarks[1*2+1])/2;
                    y_bbmax=params.landmarks[13*2+1]+len*0.1;
                    y_bbmin=params.landmarks[1*2+1]-len*0.1;
                    x_bbmax=params.landmarks[7*2+0]+len*0.1;
                    x_bbmin=(params.landmarks[13*2+0]+params.landmarks[1*2+0])/2-len*0.2;
                }
            }
            
            var check=0;
            for(var handi=0;handi<hands.length;handi++)
            {
                //console.log("hand:",hands[handi].x,",",hands[handi].y);
                if ((hands[handi].x)<x_bbmin || (hands[handi].x)>x_bbmax || (hands[handi].y)<y_bbmin || (hands[handi].y)>y_bbmax) 
                {check++;}
                
            }
				
				
				
				for(var handi=0;handi<hands.length;handi++) {
					if((cur_frame_id-hands[handi].detectframe-hands[handi].repeat)>=10 && hands[handi].renderframe == 0) {hands[handi].energy=0; continue;}
					if (hands[handi].repeat>=2 && hands[handi].renderframe==0 && check) {hands[handi].renderframe=cur_frame_id; is_rendering=1;}
					if (hands[handi].renderframe==0) continue;
					
					item.TriggerHand(params, handi, hands[handi].detectx, hands[handi].detecty);
					
					if (g_params.multiHands==0) break;
				}
				
			} catch(ex) {
				console.log(ex.stack);
			}
		},
		CheckHand:function(item, params) {
			try{
				var w=params.w;
				var h=params.h;
				var hands=this.m_hands;
				cur_frame_id = params.frame_id;
				
				for(var handi=0;handi<hands.length;handi++) {
					if(item.CheckTriggerEnd(handi) && (params.frame_id - hands[handi].renderframe)%playVelocity >= (playVelocity-1)) {
						if (cur_frame_id - hands[handi].detectframe>10) {
							hands[handi].energy = 0;
							is_rendering=0;
							item.TriggerNoHand(params, handi);
						} else {
							hands[handi].renderframe=0;
							hands[handi].x=hands[handi].detectx;
							hands[handi].y=hands[handi].detecty;
							hands[handi].r=hands[handi].detectr;
							is_rendering=0;
						}
					}
				}
				
				this.m_hands = hands.filter(function(a){return a.energy>0;});
				g_params.detected = hands.length;
				g_params.boxes = hands;
			} catch(ex) {
				console.log(ex.stack);
			}
		},
		FlushHands:function() {
			if (UseState)
				console.log("hand:",Handboxes[0],Handboxes[1],Handboxes[2],Handboxes[3]);
			else
				console.log("nohand");
			
			if (nowFrame > g_params.clearFrame) {
				UseState = false;
				nowFrame = 0;
			}
			nowFrame++;
		}
	};
})()