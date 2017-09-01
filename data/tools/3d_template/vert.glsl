varying vec3 N_frag,dPds_frag,dPdt_frag;
varying vec2 st_frag;
varying vec3 V_frag;

vec3 QuatTransformVector(vec4 Q,vec3 v){
	return v + 2.0*cross(Q.xyz, cross(Q.xyz,v) + Q.w*v);
}

void main(){
	
	vec3 Ps=P*scales;
	if(isFlipH>0.5){
		Ps.x = -Ps.x-7.364;
	}
	if(0.5<obj_type&&obj_type<=0.75){
		vec4 head_quat;
		head_quat=vec4(0.0,0.0,0.0,1.0)-quatR1;
		head_quat=quatR1+weight*head_quat;
		Ps = QuatTransformVector(head_quat,Ps);
		gl_Position=mat_proj*(mat_cam*vec4(Ps,1.0));
	}else
		gl_Position=mat_proj*(mat_view*vec4(Ps,1.0));
	
	V_frag=normalize((mat_view*vec4(Ps,1.0)).xyz);
		
	if(isFlipH>0.5){
		N_frag=normalize((mat_view*vec4(-N.x,N.y,-N.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(-dPds.x,dPds.y,-dPds.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(-dPdt.x,dPdt.y,-dPdt.z,0.0)).xyz);
	}else{
		N_frag=normalize((mat_view*vec4(N.x,N.y,-N.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(dPds.x,dPds.y,-dPds.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(dPdt.x,dPdt.y,-dPdt.z,0.0)).xyz);
	}
	st_frag=st;
}
