vec3 QuatTransformVector(vec4 Q,vec3 v){
	return v + 2.0*cross(Q.xyz, cross(Q.xyz,v) + Q.w*v);
}

vec4 quaterionSlerp(vec4 p, vec4 q, float t){
	if(abs(p[0]-q[0])<0.00001 && abs(p[1]-q[1])<0.00001 && abs(p[2]-q[2])<0.00001 && abs(p[3]-q[3])<0.00001)return p;
	float theta = acos(dot(p,q));
	float ws = sin(theta);
	float w1 = sin((1.0 - t)*theta)/ws;
	float w2 = sin(t*theta)/ws;
	return normalize(w1*p + w2*q);
}

void main(){
	
	vec3 Ps=P*scales;
	vec4 Nf=model_normal_mat*vec4(N.xyz,0.0);

	Nf=vec4(Nf.x,Nf.y,-Nf.z,0);

	if(isFlipH>0.5){
		Ps.x = -Ps.x;
	}
	
	Ps = scale_e * Ps;

	//model transform
	Ps = (model_mat*vec4(Ps,1.0)).xyz; 
	Ps.z=-Ps.z;

	//weight transform
	
	if(0.5<obj_type&&obj_type<=0.75){
		vec4 head_quat;
		vec4 idq = vec4(0.0,0.0,0.0,1.0);
		
		head_quat = quaterionSlerp(idq,quatR1,1.0-weight);
		
		Ps -= weightOffset;
		Ps = QuatTransformVector(head_quat,Ps);
		Ps += weightOffset;

		vec4 Pf = mat_cam*vec4(Ps,1.0);
		Nf=mat_cam_normal*Nf;
		Nf.z=0.5;
		Pf=Pf-vec4(normalize(Nf.xyz),0)*outline;
		gl_Position=mat_proj*Pf;
	}else {
		vec4 Pf = mat_view*vec4(Ps,1.0);
		Nf=mat_view_normal*Nf;
		Nf.z=0.5;
		Pf=Pf-vec4(normalize(Nf.xyz),0)*outline;
		gl_Position=mat_proj*Pf;
	}
}
