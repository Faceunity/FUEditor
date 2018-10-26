varying vec3 N_frag;
varying vec3 V_frag;
varying vec3 dPds_frag, dPdt_frag;
varying vec2 st_frag;
varying vec3 P_world_frag;

vec3 QuatTransformVector(vec4 Q,vec3 v){
	return v + 2.0*cross(Q.xyz, cross(Q.xyz,v) + Q.w*v);
}

void main(){
	vec3 P1=P*scales;


	P1 = (model_mat*vec4(P1,1.0)).xyz;
	P1 = QuatTransformVector(quatR1,P1);
	
	P1.z=-P1.z;

	if(isFlipH>0.5){
		P1.x = -P1.x;
	}

	
	P_world_frag = P1;
	vec4 modelPosition = (mat_view*vec4(P1,1.0));
	
	gl_Position=mat_proj*modelPosition;
	V_frag=normalize(modelPosition.xyz);

	vec3 N2 = QuatTransformVector(quatR1, N);
	if(isFlipH>0.5)
		N_frag=normalize((mat_view*vec4(-N2.x,N2.y,-N2.z,0.0)).xyz);
	else
		N_frag=normalize((mat_view*vec4(N2.x,N2.y,-N2.z,0.0)).xyz);
	st_frag=st;
}
