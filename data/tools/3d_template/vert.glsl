varying vec3 N_frag,V_frag,dPds_frag,dPdt_frag;
varying vec2 st_frag;

struct dquat{
	vec4 p;
	vec4 q;
};

dquat make_dquat(vec4 p0,vec4 q0){
	dquat a;
	a.p=p0;
	a.q=q0;
	return a;
}
dquat plus(const dquat a,const dquat b){
	return make_dquat(a.p+b.p,a.q+b.q);
}
dquat minus(const dquat a,const dquat b){
	return make_dquat(a.p-b.p,a.q-b.q);
}
dquat f_mul_quat(float a,const dquat b){
	return make_dquat(a*b.p,a*b.q);
}

float sqr(const dquat b){
	return dot(b.p,b.p);
}

dquat normalized(const dquat b){
	float lg2=sqr(b);
	float ilg=1.0/sqrt(lg2);
	return f_mul_quat(ilg,b);
}

//non-normalized transformation
vec3 transformPoint(const dquat a,const vec3 P){
	vec3 v0 = vec3(a.p.x,a.p.y,a.p.z);
	vec3 ve = vec3(a.q.x,a.q.y,a.q.z);
	vec3 trans = 2.0*(a.p.w*ve - a.q.w*v0 + cross(v0,ve));
	vec3 q_vec = vec3(a.p.x,a.p.y,a.p.z);
	return ((P + 2.0*cross(q_vec, cross(q_vec,P) + P*a.p.w ))+trans);
}

float selfDot(vec3 v){
	return v.x * v.x + v.y * v.y + v.z * v.z;
}
void main(){
	vec3 Ps=P*scales;
	if(0.5<obj_type&&obj_type<=0.75){
		dquat dquat1;
		dquat1.p=vec4(quatR1);
		dquat1.q=vec4(quatT1, 0.0);
		
		dquat dquat2;
		dquat2.p=vec4(quatR2);
		dquat2.q=vec4(quatT2, 0.0);
		dquat finalQuat=minus(dquat1,f_mul_quat(weight,minus(dquat1,dquat2)));
		dquat normalQuat=normalized(finalQuat);
		gl_Position=mat_proj*(mat_cam*vec4(transformPoint(normalQuat,Ps),1.0));
	}
	else
		gl_Position=mat_proj*(mat_view*vec4(Ps,1.0));
		
	//gl_Position=mat_proj*mat_view*vec4(Ps,1.0);
	V_frag=normalize((mat_view*vec4(Ps,1.0)).xyz);
	N_frag=normalize((mat_view*vec4(N.x,N.y,-N.z,0.0)).xyz);
	if (selfDot(dPds) > 0.0){
		dPds_frag=normalize((mat_view*vec4(dPds.x,dPds.y,-dPds.z,0.0)).xyz);	
	}else{
		dPds_frag=vec3(0.0);
	}
	if (selfDot(dPdt) > 0.0){
		dPdt_frag=normalize((mat_view*vec4(dPdt.x,dPdt.y,-dPdt.z,0.0)).xyz);
	}else{
		dPdt_frag=vec3(0.0);
	}
	st_frag=st;
}
